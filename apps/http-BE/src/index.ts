import express from "express";

const app = express();


app.post("/signup", (req, res) => {
    const {username,password} = req.body
    
});

app.post("/signin", (req, res) => {});

app.post("/create-room", (req, res) => {});

app.listen(3001, () => {
  console.log("listening on the port 3000");
});
