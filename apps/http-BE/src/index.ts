import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ENV } from "@repo/backend-common/config";
import { authMiddleware } from "./middleware";
import {
  CreateUserSchema,
  SigninSchema,
  CreateRoomSchema,
} from "@repo/common/types";
import { prismaClient } from "@repo/db/client";

const app = express();

app.post("/signup", async (req, res) => {
  const { success } = CreateUserSchema.safeParse(req.body);
  const { password, username, name } = req.body;
  if (!success) {
    res.status(403).json({
      msg: "invalid inputs!",
    });
    return
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const existingUser = await prismaClient.user.findFirst({
      where: {
        email: username,
      },
    });
    if (existingUser) {
      res.status(403).json({
        msg: "user already registered",
      });
    }
    const user = await prismaClient.user.create({
      data: {
        name,
        email: username,
        password: hashedPassword,
      },
    });
    res.json({
      msg: "User added succesfully!",
    });
  } catch (error) {
    res.json({
      error,
    });
  }
});

app.post("/signin", async (req, res) => {
  const { success } = SigninSchema.safeParse(req.body);
  const { password, username } = req.body;
  if (!success) {
    res.status(403).json({
      msg: "invalid inputs!",
    });
    return
  }
  try {
    const existingUser = await prismaClient.user.findFirst({
      where: {
        email: username,
      },
    });
    if (existingUser) {
      const comparePass = await bcrypt.compare(password, existingUser.password);
      if (comparePass) {
        const token = jwt.sign({ userId: existingUser.id }, ENV.JWT_SECRET);
        res.json({
          token,
        });
      }
    }
  } catch (error) {
    res.status(403).json({
      error,
    });
  }
});

app.post("/room", authMiddleware, (req, res) => {
  const { success } = CreateRoomSchema.safeParse(req.body);
  if (!success) {
    res.status(403).json({
      msg: "invalid inputs!",
    });
  }
  // db logic
  res.json({
    roomId: "123",
  });
});

app.listen(ENV.HTTP_PORT || 3001, () => {
  console.log("listening on the port 3000");
});
