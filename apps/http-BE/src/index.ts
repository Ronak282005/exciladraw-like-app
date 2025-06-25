import express from "express";

const app = express();

app.post("/signup", (req, res) => {});

app.post("/signin", (req, res) => {});

app.post("/create-room", (req, res) => {});

app.listen(3001, () => {
  console.log("listening on the port 3000");
});
