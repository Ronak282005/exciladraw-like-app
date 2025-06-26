import { WebSocketServer } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (ws, request) => {
  const url = request.url;
  if (!url) {
    return;
  }
  const queryParm = new URLSearchParams(url.split("?")[1]);
  const token = queryParm.get("token");
  const decode = jwt.verify(token, JWT_SECRET);
  if (!decode || !(decode as JwtPayload).userId) {
    ws.close();
    return;
  }
  ws.on("message", (data) => {
    ws.send("pong");
  });
});
