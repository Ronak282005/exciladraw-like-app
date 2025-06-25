import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (ws, request) => {
  const url = request.url;
  if (!url) {
    return;
  }
  const queryParm = new URLSearchParams(url.split("?")[1]);
  const token = queryParm.get("token");
  ws.on("message", (data) => {
    ws.send("pong");
  });
});
