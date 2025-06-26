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
app.use(express.json());

app.post("/signup", async (req, res) => {
  const parsedData = CreateUserSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(403).json({
      msg: "invalid inputs!",
    });
    return;
  }
  try {
    const hashedPassword = await bcrypt.hash(parsedData.data.password, 10);
    const existingUser = await prismaClient.user.findFirst({
      where: {
        email: parsedData.data.username,
      },
    });
    if (existingUser) {
      res.status(403).json({
        msg: "user already registered",
      });
    }
    const user = await prismaClient.user.create({
      data: {
        name: parsedData.data.name,
        email: parsedData.data.username,
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
  const parsedData = SigninSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(403).json({
      msg: "invalid inputs!",
    });
    return;
  }
  try {
    const existingUser = await prismaClient.user.findFirst({
      where: {
        email: parsedData.data.username,
      },
    });
    if (existingUser) {
      const comparePass = await bcrypt.compare(
        parsedData.data.password,
        existingUser.password
      );
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
