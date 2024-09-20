import http from "http";
import path from "path";
import { Server } from "socket.io";
import express from "express";
import fs from 'fs';

const app = express();
const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "/frontend/build")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "/frontend/build/index.html"));
});

const httpServer = http.Server(app);

const io = new Server(httpServer, { cors: { origin: "*" } });
const users = [];

// Function to save each message to the temporary string
const  temporaryChatHistory = [];
function saveMessageTemporary(message) {
  // Append the new message to the chat history
  temporaryChatHistory.push(message);
}



io.on("connection", (socket) => {
  socket.on("onLogin", (user) => {
    const updatedUser = {
      ...user,
      online: true,
      socketId: socket.id,
      messages: [],
    };

    const existUser = users.find((x) => x.name === updatedUser.name);
    if (existUser) {
      existUser.socketId = socket.id;
      existUser.online = true;
    } else {
      users.push(updatedUser);
    }
    const admin = users.find((x) => x.name === "Admin" && x.online);
    if (admin) {
      io.to(admin.socketId).emit("updateUser", updatedUser);
    }
    if (updatedUser.name === "Admin") {
      io.to(updatedUser.socketId).emit("listUsers", users);
    }
  });

    
    // Listen for toggle change from user
    socket.on("toggleChange", (data) => {
      // Broadcast the toggle change to the admin
      const admin = users.find((x) => x.name === "Admin" && x.online);
      if (admin) {
        io.to(admin.socketId).emit("toggleUpdate", data);
      }
    });
    
   

  socket.on("disconnect", () => {
    const user = users.find((x) => x.socketId === socket.id);
    if (user) {
      user.online = false;
      const admin = users.find((x) => x.name === "Admin" && x.online);
      if (admin) {
        io.to(admin.socketId).emit("updateUser", user);
      }
    }
  });
  socket.on("onUserSelected", (user) => {
    const admin = users.find((x) => x.name === "Admin" && x.online);
    if (admin) {
      const existUser = users.find((x) => x.name === user.name);
      io.to(admin.socketId).emit("selectUser", existUser);
    }
  });
  socket.on("onMessage", (message) => {
    if (message.from === "Admin") {
      const user = users.find((x) => x.name === message.to && x.online);
      if (user) {
        io.to(user.socketId).emit("message", message);
        user.messages.push(message);
        //Debugging
        console.log("Admin said:");
        console.log(message);
        saveMessageTemporary(message);

        //to save the chat history
        if(message.body == "Ending the session. Saving the Chat history") {
          const chatFile = 'chatHistory'+'-'+message.to+'.json';
          // Function to save each message to the chat history file immediately
          function saveMessageToFile(temporaryChatHistory) {
            console.log(JSON.stringify(temporaryChatHistory));

            // Load existing chat history if the file exists
            /*
            if (fs.existsSync(chatFile)) {
              temporaryChatHistory = JSON.parse(fs.readFileSync(chatFile, 'utf8'));
            }
            */

            // Save the updated chat history back to the file
            fs.writeFileSync(chatFile, JSON.stringify(temporaryChatHistory,null,2));
          }
          saveMessageToFile(temporaryChatHistory);
        }else
        {
          //do nothing
        }
       

      } else {
        io.to(socket.id).emit("message", {
          from: "System",
          to: "Admin",
          body: "User Is Not Online",
        });
      }
    } else {
      const admin = users.find((x) => x.name === "Admin" && x.online);
      if (admin) {
        io.to(admin.socketId).emit("message", message);
        const user = users.find((x) => x.name === message.from && x.online);
        if (user) {
          user.messages.push(message);
          console.log("user said:");
          console.log(message);
          saveMessageTemporary(message);

        }
      } else {
        io.to(socket.id).emit("message", {
          from: "System",
          to: message.from,
          body: "Sorry. Admin is not online right now",
        });
      }
    }
  });
});



const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});

