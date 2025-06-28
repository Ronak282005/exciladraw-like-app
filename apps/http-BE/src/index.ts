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
    if (!existingUser) {
      res.status(403).json({
        msg: "invalid inputs!",
      });
      return;
    }
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
  } catch (error) {
    res.status(403).json({
      error,
    });
  }
});

app.post("/room", authMiddleware,async (req, res) => {
  const parsedData = CreateRoomSchema.safeParse(req.body);
  if (!parsedData.success) {
    res.status(403).json({
      msg: "invalid inputs!",
    });
    return
  }
  // @ts-ignore
  const {userId} = req
  try {
    const room = await prismaClient.room.create({
      data : {
        slug : parsedData.data.name,
       adminId : userId 
      }
    })
    res.json({
      roomId: room.id,
    });
  } catch (error) {
    res.status(403).json({
      error,
    });
  }
}); 

app.get("/chat/:roomId", async (req, res) => {
  const roomId = Number(req.params.roomId);
  try {
    const message = await prismaClient.chat.findMany({
      where: {
        roomId
      },
      orderBy : {
        id : "desc"
      },
      take : 50
    });
    res.json({ message });
  } catch (error) {
    res.status(403).json({
      error,
    });
  }
});

app.get("/room/:slug",async(req,res)=>{
  const {slug} = req.params
  try {
    const room = await prismaClient.room.findFirst({
      where : {
        slug
      }
    })
    if (!room) {
      res.status(403).json({
        msg : "Wrong Slug!"
      })
    }
    res.json({
      room
    })
  } catch (error) {
    res.status(403).json({
      error
    })
  }
})

app.listen(ENV.HTTP_PORT || 3001, () => {
  console.log("listening on the port 3000");
});
