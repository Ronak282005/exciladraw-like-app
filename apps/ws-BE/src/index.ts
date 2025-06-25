import { WebSocketServer } from "ws";

const wss = new WebSocketServer({port : 3000})

wss.on("connection",(socket)=>{
    console.log("connection made");
    socket.send("Hello there!")
})