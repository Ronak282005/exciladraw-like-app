import { WebSocket, WebSocketServer } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { ENV } from "@repo/backend-common/config";
import { prismaClient } from "@repo/db/client";
const wss = new WebSocketServer({ port: 8080 });

interface User {
  userId: string;
  ws: WebSocket;
  rooms: string[];
}

const users: User[] = [];

function checkUser(token: string): string | null {
  const decode = jwt.verify(token as string, ENV.JWT_SECRET);
  if (typeof decode == "string") {
    return null;
  }
  if (!decode || !decode.userId) {
    return null;
  }
  return decode.userId;
}

wss.on("connection", (ws, request) => {
  const url = request.url;
  if (!url) {
    return;
  }
  const queryParm = new URLSearchParams(url.split("?")[1]);
  const token = queryParm.get("token") || "";
  const userId = checkUser(token);
  if (userId == null) {
    ws.close();
    return;
  }
  users.push({
    userId,
    ws,
    rooms: [],
  });
  ws.on("message", async (data) => {
    if (typeof data !== "string") {
      return null;
    }
    const parsedData = JSON.parse(data);
    if (parsedData.type === "join_room") {
      const user = users.find((x) => x.ws === ws);
      user?.rooms.push(parsedData.roomId);
    }

    if (parsedData.type === "leave_room") {
      const user = users.find((x) => x.ws === ws);
      if (!user) {
        return;
      }
      user.rooms = user.rooms.filter((x) => x === parsedData.room);
    }

    if (parsedData.type === "chat") {
      const roomId = parsedData.roomId;
      const message = parsedData.message;

      await prismaClient.chat.create({
        data: {
          roomId,
          message,
          userId,
        },
      });

      users.forEach((user) => {
        if (user.rooms.includes(roomId)) {
          user.ws.send(
            JSON.stringify({
              type: "chat",
              message: message,
              roomId,
            })
          );
        }
      });
    }
  });
});
