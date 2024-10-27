import React, { useEffect, useRef, useState } from "react";
import socketIOClient from "socket.io-client";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ListGroup from "react-bootstrap/ListGroup";
import Alert from "react-bootstrap/Alert";
import Badge from "react-bootstrap/Badge";
import FormControl from "react-bootstrap/FormControl";
import InputGroup from "react-bootstrap/InputGroup";
import Button from "react-bootstrap/Button";

// Update ENDPOINT configuration
const ENDPOINT = "https://healthcare-chatbot-prototype.onrender.com";

export default function AdminPage() {
  const [selectedUser, setSelectedUser] = useState({});
  const [socket, setSocket] = useState(null);
  const uiMessagesRef = useRef(null);
  const [messageBody, setMessageBody] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [connected, setConnected] = useState(false);

  //Add State for Toggle Buttons on Admin Page
  const [toggleOne, setToggleOne] = useState(false);
  const [toggleTwo, setToggleTwo] = useState(false);
  const [toggleThree, setToggleThree] = useState(false);

  useEffect(() => {
    if (!socket) {
      const sk = socketIOClient(ENDPOINT, {
        transports: ['websocket'],
        cors: {
          origin: "*",
          credentials: true
        }
      });

      sk.on('connect', () => {
        console.log('Connected to server');
        setConnected(true);
        sk.emit("onLogin", {
          name: "Admin"
        });
      });

      sk.on('connect_error', (error) => {
        console.error('Connection error:', error);
        setConnected(false);
      });

      setSocket(sk);
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  useEffect(() => {
    if (uiMessagesRef.current) {
      uiMessagesRef.current.scrollBy({
        top: uiMessagesRef.current.scrollHeight,
        left: 0,
        behavior: "smooth",
      });
    }

    if (socket) {
      socket.on("message", (data) => {
        console.log('Received message:', data);
        if (selectedUser.name === data.from) {
          setMessages(prev => [...prev, data]);
        } else {
          const existUser = users.find((user) => user.name === data.from);
          if (existUser) {
            setUsers(prev =>
              prev.map((user) =>
                user.name === existUser.name ? { ...user, unread: true } : user
              )
            );
          }
        }
      });

      socket.on("toggleUpdate", (data) => {
        console.log('Received toggle update:', data);
        switch (data.toggleIndex) {
          case 1:
            setToggleOne(data.value);
            break;
          case 2:
            setToggleTwo(data.value);
            break;
          case 3:
            setToggleThree(data.value);
            break;
          default:
            break;
        }
      });

      socket.on("updateUser", (updatedUser) => {
        console.log('Received user update:', updatedUser);
        setUsers(prev => {
          const existUser = prev.find((user) => user.name === updatedUser.name);
          if (existUser) {
            return prev.map((user) =>
              user.name === existUser.name ? updatedUser : user
            );
          }
          return [...prev, updatedUser];
        });
      });

      socket.on("listUsers", (updatedUsers) => {
        console.log('Received users list:', updatedUsers);
        setUsers(updatedUsers);
      });

      socket.on("selectUser", (user) => {
        console.log('User selected:', user);
        setMessages(user.messages || []);
      });

      return () => {
        socket.off("message");
        socket.off("updateUser");
        socket.off("listUsers");
        socket.off("selectUser");
        socket.off("toggleUpdate");
      };
    }
  }, [socket, selectedUser.name, users]);

  const selectUser = (user) => {
    setSelectedUser(user);
    const existUser = users.find((x) => x.name === user.name);
    if (existUser) {
      setUsers(
        users.map((x) =>
          x.name === existUser.name ? { ...x, unread: false } : x
        )
      );
    }
    socket.emit("onUserSelected", user);
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (!messageBody.trim()) {
      alert("Error. Please type message.");
    } else {
      setMessages([
        ...messages,
        { body: messageBody, from: "Admin", to: selectedUser.name },
      ]);
      setTimeout(() => {
        socket.emit("onMessage", {
          body: messageBody,
          from: "Admin",
          to: selectedUser.name,
        });
      }, 1000);
      setMessageBody("");
    }
  };

  return (
    <Row>
      <Col sm={3}>
        {!connected && (
          <Alert variant="warning">Connecting to server...</Alert>
        )}
        {connected && users.filter((x) => x.name !== "Admin").length === 0 && (
          <Alert variant="info">No User Found</Alert>
        )}
        <ListGroup>
          {users
            .filter((x) => x.name !== "Admin")
            .map((user) => (
              <ListGroup.Item
                action
                key={user.name}
                variant={user.name === selectedUser.name ? "info" : ""}
                onClick={() => selectUser(user)}
              >
                <Badge
                  bg={
                    selectedUser.name === user.name
                      ? user.online
                        ? "primary"
                        : "secondary"
                      : user.unread
                      ? "danger"
                      : user.online
                      ? "primary"
                      : "secondary"
                  }
                >
                  {selectedUser.name === user.name
                    ? user.online
                      ? "Online"
                      : "Offline"
                    : user.unread
                    ? "New"
                    : user.online
                    ? "Online"
                    : "Offline"}
                </Badge>
                &nbsp;
                {user.name}
              </ListGroup.Item>
            ))}
        </ListGroup>
      </Col>
      <Col sm={9}>
        <div className="admin">
          {!selectedUser.name ? (
            <Alert variant="info">Select a user to start chat</Alert>
          ) : (
            <div>
              <h3>Chat with {selectedUser.name}</h3>
              
              <div>
                <div style={{ display: 'flex', gap: '24px' }}>
                  <div>
                    <span style={{ marginRight: '8px' }}>Ethos:</span>
                    <input type="checkbox" checked={toggleOne} readOnly />
                  </div>
                  <div>
                    <span style={{ marginRight: '8px' }}>Pathos:</span>
                    <input type="checkbox" checked={toggleTwo} readOnly />
                  </div>
                  <div>
                    <span style={{ marginRight: '8px' }}>Logos:</span>
                    <input type="checkbox" checked={toggleThree} readOnly />
                  </div>
                </div>
              </div>

              <hr />

              <ListGroup ref={uiMessagesRef}>
                {messages.length === 0 && (
                  <ListGroup.Item>No message</ListGroup.Item>
                )}
                {messages.map((msg, index) => (
                  <ListGroup.Item key={index}>
                    <strong>{`${msg.from}: `}</strong> {msg.body}
                  </ListGroup.Item>
                ))}
              </ListGroup>
              <div>
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
              </div>
            </div>
          )}
        </div>
      </Col>
    </Row>
  );
}