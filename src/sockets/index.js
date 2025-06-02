import { Server } from "socket.io";

export function setupWebSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: "*",
            credentials: true,
        }
    })

    io.on("connection", async (socket) => {
        socket.on('message', (data) => {
            console.log('Mensaje recibido:', data);
            io.emit('message', data); // emite a todos
        });
    })

}