const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const fs = require("fs");
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3001",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);
  socket.on("upload", (data) => {
    // console.log(data);
    // console.log(data.data.toString('base64'));
    console.log(`data:image/jpg;base64,${data.data.toString('base64')}`);
    const srcimg = `data:image/jpg;base64,${data.data.toString('base64')}`;
    socket.broadcast.emit("download",{data:srcimg,name:data.name});
  });
  socket.on("send_message", (data) => {
    console.log(data);
    socket.broadcast.emit("receieve_message",data);
  });
});

server.listen(3001, () => {
  console.log("SERVER IS RUNNING");
});
