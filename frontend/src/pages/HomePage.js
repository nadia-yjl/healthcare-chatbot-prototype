import React from "react";
import ChatBox from "../components/ChatBox";
import myImage from '/Users/nadia/healthcare-chatbot-prototype/frontend/src/chatbot_image_holder.png'; // Adjust the path to your image


export default function HomePage() {
  return (
    <div>
      <h1>Healthcare Chatbot</h1>
      <p>Please share your symptoms with us and talk to the chatbot</p>
       {/* Image below the h1 and p, aligned left, and styled */}
       <img
        src={myImage}
        alt="Healthcare Chatbot"
        style={{
          width: "30%", 
          display: "block",
          margin: "20px 0",
          borderRadius: "8px"
        }}
      />
      <ChatBox />
    </div>
  );
}
