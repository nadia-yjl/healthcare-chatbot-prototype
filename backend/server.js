import http from "http";
import { Server } from "socket.io";
import express from "express";

const app = express();

// Basic route to verify server is running
app.get("/", (req, res) => {
  res.send("Server is running");
});

const httpServer = http.Server(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST"],
  },
});

const temporaryChatHistory = [];
function saveMessageTemporary(message) {
  temporaryChatHistory.push(message);
}

// Rest of your socket.io code remains the same
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

  // Your existing socket event handlers...
  socket.on("toggleChange", (data) => {
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
        console.log("Admin said:", message);
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
          console.log("user said:", message);
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
  console.log(`Server started on port ${PORT}`);
});