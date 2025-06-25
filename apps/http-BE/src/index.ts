import express from "express";
import { z } from "zod";
import bcrypt from "bcrypt";

const app = express();

const bodyInput = z.object({
  username: z.string(),
  password: z.string(),
});

app.post("/signup", async (req, res) => {
  const { success } = bodyInput.safeParse(req.body);
  const { password, username } = req.body;
  if (!success) {
    res.status(403).json({
      msg: "invalid inputs!",
    });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
});

app.post("/signin", (req, res) => {});

app.post("/create-room", (req, res) => {});

app.listen(3001, () => {
  console.log("listening on the port 3000");
});
