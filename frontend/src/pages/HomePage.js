import React from "react";
import ChatBox from "../components/ChatBox";
import myImage from '../certified.png'; // Adjust the path to your image, get rid after /users
import myImage2 from '../doctors.png'; // Adjust the path to your image, get rid after /users


export default function HomePage() {
  return (
    <div>
      <h1>Healthcare Chatbot</h1>
         <p style={{ width: "42%", marginBottom: "20px", fontSize: "0.9em" }}>
        Welcome to the user study! 
        In this session, you will be given a scenario 
        where you experience certain symptoms, and your task is to describe these 
        symptoms to our symptom diagnosis chatbot. The chatbot will then analyze 
        the information you provide and offer a potential diagnosis and feedback 
        on how you might be feeling. Your input will help us improve the chatbot’s 
        accuracy and user experience. 
      </p>
      <h3>Your Scenario:</h3>

       <p style={{ width: "42%", marginBottom: "20px", fontSize: "0.9em" }}>
      Imagine you're feeling unwell with a fever and a persistent cough. 
      Recently, you've also noticed that your sense of taste has diminished. 
      As these symptoms continue, you decide to describe how you're feeling to the chatbot to understand what might be going on.
      Additional Context:
      You have no known allergies or chronic illnesses.
      You have not recently traveled or been in contact with anyone who is known to be seriously ill.
      </p>


       <p style={{ width: "42%", marginBottom: "20px", fontSize: "0.9em" }}>
      Thank you for participating!
      </p>

       {/* Image below the h1 and p, aligned left, and styled */}

       <img
        src={myImage2}
        alt="Healthcare Chatbot"
        style={{
          width: "40%", 
          display: "block",
          margin: "40px 0",
          borderRadius: "8px"
        }}
      />

    
       <img
        src={myImage}
        alt="Healthcare Chatbot"
        style={{
          width: "16%", 
          display: "block",
          margin: "16px 0",
          borderRadius: "8px"
        }}
      />
    
      <ChatBox />
    </div>
  );
}
