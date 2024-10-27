import http from "http";
import { Server } from "socket.io";
import express from "express";

const app = express();

// Basic route to verify server is running
app.get("/", (req, res) => {
  res.send("Server is running");
});

const httpServer = http.Server(app);

// Define the users array at the top level
const users = [];

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST"],
    credentials: true
  },
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
    
    const admin = users.find((x) => x.name === "Admin" && x.online);
    if (admin) {
      console.log('Sending update to admin:', updatedUser);
      io.to(admin.socketId).emit("updateUser", updatedUser);
    }
    if (updatedUser.name === "Admin") {
      console.log('Sending user list to admin');
      io.to(updatedUser.socketId).emit("listUsers", users);
    }
  });

  // Rest of your event handlers remain the same...
});

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});