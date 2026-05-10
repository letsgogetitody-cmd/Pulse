const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

let posts = {
  Sports: [],
  News: [],
  Tech: [],
  Politics: [],
};

io.on("connection", (socket) => {
  let user = "";

  socket.on("login", (username, cb) => {
    user = username;
    cb({ ok: true });
  });

  socket.on("joinTopic", (topic) => {
    socket.join(topic);
    socket.emit("loadPosts", posts[topic]);
  });

  socket.on("newPost", ({ topic, text, image }) => {
    const post = { user, text, image, likes: 0 };
    posts[topic].unshift(post);
    io.to(topic).emit("newPost", post);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("PULSE running"));
