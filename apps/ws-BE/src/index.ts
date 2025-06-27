import { WebSocket, WebSocketServer } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import {ENV} from "@repo/backend-common/config"

const wss = new WebSocketServer({ port: 8080 });

interface User {
  userId : string
  ws : WebSocket
  rooms : string[]
}

const users : User[] = []

function checkUser(token : string) : string | null {
  const decode = jwt.verify(token as string, ENV.JWT_SECRET);
  if( typeof decode == "string"){
    return null;
  }
  if (!decode || !decode.userId) {
    return null;
  }
  return decode.userId
}

wss.on("connection", (ws, request) => {
  const url = request.url;
  if (!url) {
    return;
  }
  const queryParm = new URLSearchParams(url.split("?")[1]);
  const token = queryParm.get("token") || "";
  const userId = checkUser(token)
  if (userId == null) {
    ws.close()
    return
  }
  users.push({
    userId,
    ws,
    rooms : []
  })
  ws.on("message", (data) => {
    ws.send("pong");
  });
});
