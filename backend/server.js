import http from "http";
import { Server } from "socket.io";
import express from "express";

const app = express();

// Basic route to verify server is running
app.get("/", (req, res) => {
  res.send("Server is running");
});

const httpServer = http.Server(app);

// Define the users array
const users = [];

// Updated CORS configuration
const io = new Server(httpServer, {
  cors: {
    origin: ["https://nadia-yjl.github.io", "http://localhost:3000"],
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["my-custom-header"],
  },
  allowEIO3: true,
  transports: ['websocket', 'polling']
});

const temporaryChatHistory = [];
function saveMessageTemporary(message) {
  temporaryChatHistory.push(message);
}

io.on("connection", (socket) => {
  console.log('New client connected:', socket.id);

  socket.on("onLogin", (user) => {
    console.log('Login attempt:', user);
    
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

    console.log('Current users:', users);
    
    const admin = users.find((x) => x.name === "SymptoBot" && x.online);
    if (admin) {
      console.log('Sending update to admin:', updatedUser);
      io.to(admin.socketId).emit("updateUser", updatedUser);
    }
    if (updatedUser.name === "SymptoBot") {
      console.log('Sending user list to admin');
      io.to(updatedUser.socketId).emit("listUsers", users);
    }
  });

  socket.on("onMessage", (message) => {
    console.log('Received message:', message);
    if (message.from === "SymptoBot") {
      const user = users.find((x) => x.name === message.to && x.online);
      if (user) {
        console.log('Sending message to user:', message);
        io.to(user.socketId).emit("message", message);
        user.messages.push(message);
        console.log("SymptoBot said:", message);
        saveMessageTemporary(message);

        if(message.body === "Ending the session. Saving the Chat history") {
          const chatFile = 'chatHistory'+'-'+message.to+'.json';
          try {
            fs.writeFileSync(chatFile, JSON.stringify(temporaryChatHistory, null, 2));
          } catch (error) {
            console.error('Error saving chat history:', error);
          }
        }
      } else {
        io.to(socket.id).emit("message", {
          from: "System",
          to: "SymptoBot",
          body: "User Is Not Online",
        });
      }
    } else {
      const admin = users.find((x) => x.name === "SymptoBot" && x.online);
      if (admin) {
        console.log('Sending message to admin:', message);
        io.to(admin.socketId).emit("message", message);
        const user = users.find((x) => x.name === message.from && x.online);
        if (user) {
          user.messages.push(message);
          console.log("user said:", message);
          saveMessageTemporary(message);
        }
      } else {
        io.to(socket.id).emit("message", {
          from: "System",
          to: message.from,
          body: "Sorry. SymptoBot is not online right now",
        });
      }
    }
  });

  socket.on("toggleChange", (data) => {
    console.log('Toggle change:', data);
    const admin = users.find((x) => x.name === "SymptoBot" && x.online);
    if (admin) {
      io.to(admin.socketId).emit("toggleUpdate", data);
    }
  });

  socket.on("disconnect", () => {
    const user = users.find((x) => x.socketId === socket.id);
    if (user) {
      user.online = false;
      console.log('User disconnected:', user.name);
      const admin = users.find((x) => x.name === "SymptoBot" && x.online);
      if (admin) {
        io.to(admin.socketId).emit("updateUser", user);
      }
    }
  });

  socket.on("onUserSelected", (user) => {
    console.log('User selected:', user);
    const admin = users.find((x) => x.name === "SymptoBot" && x.online);
    if (admin) {
      const existUser = users.find((x) => x.name === user.name);
      io.to(admin.socketId).emit("selectUser", existUser);
    }
  });
});

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});