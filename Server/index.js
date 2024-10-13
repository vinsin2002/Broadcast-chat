const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { createClient } = require("redis");
const { createAdapter } = require("@socket.io/redis-adapter");
const axios = require("axios");
const fs = require("fs");

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

async function setupRedis() {
  try {
    const pubClient = createClient({ url: "redis://localhost:6379" });
    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);
    io.adapter(createAdapter(pubClient, subClient));
    console.log("Socket.IO Redis adapter set up successfully");
    process.on('SIGINT', () => {
      pubClient.quit();
      subClient.quit();
      process.exit(0);
    });

  } catch (error) {
    console.error("Failed to set up Redis adapter:", error);
    console.log("Continuing without Redis adapter");
  }
}

setupRedis();
let messages=[]
io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);
  
  socket.on("upload", (data) => {
    console.log(`data:image/jpg;base64,${data.data.toString('base64')}`);
    const srcimg = `data:image/jpg;base64,${data.data.toString('base64')}`;
    socket.broadcast.emit("download", { data: srcimg, name: data.name });
  });
  
  socket.on("send_message", (data) => {
    console.log(data);
    if (data.message === "Summarization completed") {
      summarizeChatAndBroadcast();
    }
    else{
      messages.push({ message: data.message, name: data.name });
      socket.broadcast.emit("receieve_message", data);
    }
  });
});

async function summarizeChatAndBroadcast() {
  const chatText = messages.map(m => `${m.message} (${m.name})`).join('\n');
  const requestBody = { text: chatText };
  console.log(requestBody);
  try {
    // Make the POST request to the API
    const response = await axios.post('http://127.0.0.1:5000/summarize', requestBody);

    // Get the summary from the API response
    const summary = response.data.summary;
    console.log("Chat Summary:", summary);

    // Broadcast the summary to all connected clients
    io.emit("receieve_message", { message: summary, name: "summary" });

    // Clear the messages after broadcasting
    messages = [];
  } catch (error) {
    console.error("Error sending data to the summarization API:", error);
  }
}

server.listen(3001, () => {
  console.log("SERVER IS RUNNING");
});

process.on('SIGINT', () => {
  io.close(() => {
    console.log('Socket.IO server closed');
    process.exit(0);
  });
});
