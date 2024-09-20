import React, { useState, useEffect } from "react";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import socketIOClient from "socket.io-client";

const ENDPOINT = "http://127.0.0.1:4000"; // Adjust this to your server's address

export default function ToggleButtons() {
  const [toggleOne, setToggleOne] = useState(false);
  const [toggleTwo, setToggleTwo] = useState(false);
  const [toggleThree, setToggleThree] = useState(false);

  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const sk = socketIOClient(ENDPOINT);
    setSocket(sk);
    return () => sk.disconnect();
  }, []);

  const handleToggleChange = (toggleIndex, value) => {
    const toggleData = {
      toggleIndex,
      value,
    };

    // Emit the toggle change event to the server
    socket.emit("toggleChange", toggleData);

    // Update the local state
    switch (toggleIndex) {
      case 1:
        setToggleOne(value);
        break;
      case 2:
        setToggleTwo(value);
        break;
      case 3:
        setToggleThree(value);
        break;
      default:
        break;
    }
  };

  const toggleStyle = {
    display: "flex",
    alignItems: "center",
  };

  const labelStyle = {
    marginRight: "8px",
  };

  return (
    <div className="my-3">
      <Row className="align-items-center">
        <Col className="d-flex" style={{ gap: "24px" }}>
          <div style={toggleStyle}>
            <span style={labelStyle}>Ethos</span>
            <Form.Check 
              type="switch"
              id="toggle-one"
              checked={toggleOne}
              onChange={(e) => handleToggleChange(1, e.target.checked)}
            />
          </div>

          <div style={toggleStyle}>
            <span style={labelStyle}>Pathos</span>
            <Form.Check 
              type="switch"
              id="toggle-two"
              checked={toggleTwo}
              onChange={(e) => handleToggleChange(2, e.target.checked)}
            />
          </div>

          <div style={toggleStyle}>
            <span style={labelStyle}>Logos</span>
            <Form.Check 
              type="switch"
              id="toggle-three"
              checked={toggleThree}
              onChange={(e) => handleToggleChange(3, e.target.checked)}
            />
          </div>
        </Col>
      </Row>
    </div>
  );
}




