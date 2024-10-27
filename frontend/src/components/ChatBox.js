import React, { useEffect, useRef, useState } from "react";
import socketIOClient from "socket.io-client";
import Button from "react-bootstrap/Button";
import CloseButton from 'react-bootstrap/CloseButton';
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ListGroup from "react-bootstrap/ListGroup";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import ToggleButtons from "./ToggleButtons";

// Update ENDPOINT to always use Render URL
const ENDPOINT = "https://healthcare-chatbot-prototype.onrender.com";

export default function ChatBox() {
  const uiMessagesRef = useRef(null);
  const [userName, setUserName] = useState("");
  const [messages, setMessages] = useState([
    { from: "System", body: "Hello there, Please ask your question." },
  ]);
  const [socket, setSocket] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [messageBody, setMessageBody] = useState("");
  const [connected, setConnected] = useState(false);

  // Handle socket connection
  useEffect(() => {
    if (isOpen && userName && !socket) {
      console.log('Attempting to connect with username:', userName);
      const sk = socketIOClient(ENDPOINT, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      sk.on('connect', () => {
        console.log('Connected to server');
        setConnected(true);
        sk.emit("onLogin", { 
          name: userName,
          online: true 
        });
      });

      sk.on('connect_error', (error) => {
        console.error('Connection error:', error);
        setConnected(false);
      });

      setSocket(sk);

      return () => {
        if (sk) {
          console.log('Cleaning up socket connection');
          sk.disconnect();
        }
      };
    }
  }, [isOpen, userName]);

  // Handle messages
  useEffect(() => {
    if (socket) {
      socket.on("message", (data) => {
        console.log('Received message:', data);
        setMessages(prev => [...prev, data]);
      });

      return () => {
        socket.off("message");
      };
    }
  }, [socket]);

  // Handle scrolling
  useEffect(() => {
    if (uiMessagesRef.current) {
      uiMessagesRef.current.scrollBy({
        top: uiMessagesRef.current.scrollHeight,
        left: 0,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const supportHandler = () => {
    setIsOpen(true);
    if (!userName) {
      const name = prompt("Please enter your name");
      if (name && name.trim()) {
        console.log('Setting username:', name);
        setUserName(name.trim());
      } else {
        setIsOpen(false);
      }
    }
  };

  const closeHandler = () => {
    if (socket) {
      console.log('Disconnecting socket');
      socket.disconnect();
      setSocket(null);
    }
    setIsOpen(false);
    setConnected(false);
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (!messageBody.trim()) {
      alert("Error. Please type message.");
    } else {
      const newMessage = {
        body: messageBody,
        from: userName,
        to: "Admin"
      };
      console.log('Sending message:', newMessage);
      
      if (socket && socket.connected) {
        socket.emit("onMessage", newMessage);
        setMessages(prev => [...prev, newMessage]);
        setMessageBody("");
      } else {
        console.error('Socket not connected');
        setMessages(prev => [...prev, {
          from: "System",
          body: "Connection error. Please try again."
        }]);
      }
    }
  };

  return (
    <div style={{ position: "fixed", bottom: "24px", right: "24px" }}>
      {!isOpen ? (
        <Button onClick={supportHandler} variant="primary">
          Chat with us
        </Button>
      ) : (
        <Card style={{
          width: "50vw",
          height: "88vh",
          position: "fixed",
          bottom: "20px",
          right: "20px",
          overflow: "hidden",
        }}>
          <Card.Body style={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <Row>
              <Col>
                <strong>Diagnosis</strong>
                {!connected && <span className="text-warning"> (Connecting...)</span>}
                {connected && <span className="text-success"> (Connected)</span>}
              </Col>
              <Col className="text-end">
                <CloseButton 
                  className="btn-sm btn-secondary"
                  onClick={closeHandler}
                />
              </Col>
            </Row>

            <ToggleButtons />

            <hr />
            <ListGroup
              ref={uiMessagesRef}
              style={{ flexGrow: 1, overflowY: "auto" }}
            >
              {messages.map((msg, index) => (
                <ListGroup.Item 
                  key={index}
                  className={msg.from === userName ? "text-end bg-light" : ""}
                >
                  <strong>{`${msg.from}: `}</strong> {msg.body}
                </ListGroup.Item>
              ))}
            </ListGroup>
            <form onSubmit={submitHandler}>
              <InputGroup>
                <FormControl
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                  type="text"
                  placeholder="Type message"
                  disabled={!connected}
                ></FormControl>
                <Button 
                  type="submit" 
                  variant="primary"
                  disabled={!connected}
                >
                  Send
                </Button>
              </InputGroup>
            </form>
          </Card.Body>
        </Card>
      )}
    </div>
  );
}
/* ver 2
import React, { useEffect, useRef, useState } from "react";
import socketIOClient from "socket.io-client";
import Button from "react-bootstrap/Button";
import CloseButton from 'react-bootstrap/CloseButton';

import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ListGroup from "react-bootstrap/ListGroup";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import ToggleButtons from "./ToggleButtons"; // Import the ToggleButtons component



const ENDPOINT =
  window.location.host.indexOf("localhost") >= 0
    //? "http://127.0.0.1:4000" //replace the link from Render
    ? "https://healthcare-chatbot-prototype.onrender.com" //replace the link from Render
    : window.location.host;

export default function ChatBox() {
  const uiMessagesRef = useRef(null);

  const [userName, setUserName] = useState("");
  const [messages, setMessages] = useState([
    { from: "System", body: "Hello there, Please ask your question." },
  ]);

  const [socket, setSocket] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [messageBody, setMessageBody] = useState("");

  useEffect(() => {
    if (uiMessagesRef.current) {
      uiMessagesRef.current.scrollBy({
        top: uiMessagesRef.current.scrollHeight,
        left: 0,
        behavior: "smooth",
      });
    }
    if (socket) {
      socket.emit("onLogin", { name: userName });
      socket.on("message", (data) => {
        setMessages([...messages, data]);
      });
    }
  }, [messages, socket, userName]);

  const supportHandler = () => {
    setIsOpen(true);
    if (!userName) {
      setUserName(prompt("Please enter your name"));
    }
    const sk = socketIOClient(ENDPOINT);
    setSocket(sk);
  };
  const closeHandler = () => {
    setIsOpen(false);
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (!messageBody.trim()) {
      alert("Error. Please type message.");
    } else {
      setMessages([
        ...messages,
        { body: messageBody, from: userName, to: "Admin" },
      ]);
      setTimeout(() => {
        socket.emit("onMessage", {
          body: messageBody,
          from: userName,
          to: "Admin",
        });
      }, 1000);
      setMessageBody("");
    }
  };

  return (
    <div style={{ position: "fixed", bottom: "24px", right: "24px" }}>
      {!isOpen ? (
        <Button onClick={supportHandler} variant="primary">
          Chat with us
        </Button>
      ) : (
        <Card
          style={{
            width: "50vw", // Set the width to half of the viewport
            height: "88vh", // Set the height to half of the viewport
            position: "fixed",
            bottom: "20px",
            right: "20px",
            overflow: "hidden",
          }}
        >
          <Card.Body
            style={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            <Row>
              <Col>
                <strong>Diagnosis</strong>
              </Col>
              <Col className="text-end">
                <CloseButton
                  className="btn-sm btn-secondary"
                  type="button"
                  onClick={closeHandler}
                >
                  
                </CloseButton>
              </Col>
            </Row>

           
            <ToggleButtons />


            <hr />
            <ListGroup
              ref={uiMessagesRef}
              style={{ flexGrow: 1, overflowY: "auto" }} // Makes the message area scrollable
            >
              {messages.map((msg, index) => (
                <ListGroup.Item key={index}>
                  <strong>{`${msg.from}: `}</strong> {msg.body}
                </ListGroup.Item>
              ))}
            </ListGroup>
            <form onSubmit={submitHandler}>
              <InputGroup>
                <FormControl
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                  type="text"
                  placeholder="Type message"
                ></FormControl>
                <Button type="submit" variant="primary">
                  Send
                </Button>
              </InputGroup>
            </form>
          </Card.Body>
        </Card>
      )}
    </div>
  );
}
*/






/*
//original codes
import React, { useEffect, useRef, useState } from "react";
import socketIOClient from "socket.io-client";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ListGroup from "react-bootstrap/ListGroup";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";

const ENDPOINT =
  window.location.host.indexOf("localhost") >= 0
    ? "http://127.0.0.1:4000"
    : window.location.host;

export default function ChatBox() {
  const uiMessagesRef = useRef(null);

  const [userName, setUserName] = useState("");
  const [messages, setMessages] = useState([
    { from: "System", body: "Hello there, Please ask your question." },
  ]);

  const [socket, setSocket] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [messageBody, setMessageBody] = useState("");

  useEffect(() => {
    if (uiMessagesRef.current) {
      uiMessagesRef.current.scrollBy({
        top: uiMessagesRef.current.scrollHeight,
        left: 0,
        behavior: "smooth",
      });
    }
    if (socket) {
      socket.emit("onLogin", { name: userName });
      socket.on("message", (data) => {
        setMessages([...messages, data]);
      });
    }
  }, [messages, socket, userName]);

  const supportHandler = () => {
    setIsOpen(true);
    if (!userName) {
      setUserName(prompt("Please enter your name"));
    }
    const sk = socketIOClient(ENDPOINT);
    setSocket(sk);
  };
  const closeHandler = () => {
    setIsOpen(false);
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (!messageBody.trim()) {
      alert("Error. Please type message.");
    } else {
      setMessages([
        ...messages,
        { body: messageBody, from: userName, to: "Admin" },
      ]);
      setTimeout(() => {
        socket.emit("onMessage", {
          body: messageBody,
          from: userName,
          to: "Admin",
        });
      }, 1000);
      setMessageBody("");
    }
  };

  return (
    <div className="chatbox">
      {!isOpen ? (
        <Button onClick={supportHandler} variant="primary">
          Chat with us
        </Button>
      ) : (
        <Card>
          <Card.Body>
            <Row>
              <Col>
                <strong>Support</strong>
              </Col>
              <Col className="text-end">
                <Button
                  className="btn-sm btn-secondary"
                  type="button"
                  onClick={closeHandler}
                >
                  x
                </Button>
              </Col>
            </Row>
            <hr />
            <ListGroup ref={uiMessagesRef}>
              {messages.map((msg, index) => (
                <ListGroup.Item key={index}>
                  <strong>{`${msg.from}: `}</strong> {msg.body}
                </ListGroup.Item>
              ))}
            </ListGroup>
            <form onSubmit={submitHandler}>
              <InputGroup className="col-6">
                <FormControl
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                  type="text"
                  placeholder="type message"
                ></FormControl>
                <Button type="submit" variant="primary">
                  Send
                </Button>
              </InputGroup>
            </form>
          </Card.Body>
        </Card>
      )}
    </div>
  );
}
*/
