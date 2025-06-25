import { WebSocketServer } from "ws";

const wss = new WebSocketServer({port : 8080})

wss.on("connection",(socket)=>{
    console.log("connection made");
    socket.send("Hello there!")
})