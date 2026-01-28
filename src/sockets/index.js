import { Server, Socket } from "socket.io";
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';

const verifyTokenAndGetCompanyId = (token) => {
    try {
        // console.log("Token received for verification:", token); 
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Usa tu JWT_SECRET

        if (decoded && decoded.companyId) {
            return decoded.companyId;
        }
        return null;
    } catch (error) {
        console.error("Token verification failed:", error.message);
        return null;
    }
};

export function setupWebSocket(server) {

    const corsOriginEnv = process.env.CORS_ORIGIN;
    const allowedOrigins = corsOriginEnv
        ? corsOriginEnv.split(',')
        : ['http://localhost:5173'];

    const io = new Server(server, {
        cors: {
            origin: allowedOrigins, // Usa tus orígenes permitidos
            credentials: true,
        },
        pingInterval: 25000,
        pingTimeout: 20000,
        transports: ["polling", "websocket"],
    });

    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth?.token || socket.handshake.headers.cookie?.split('token=')[1];
            if (!token) {
                console.log("Conexión WebSocket rechazada: Token no proporcionado");
                return next(new Error('Authentication error: Token not provided'));
            }

            const companyId = verifyTokenAndGetCompanyId(token);

            if (!companyId) {
                console.log("Conexión WebSocket rechazada: Token inválido o companyId no encontrado");
                return next(new Error('Authentication error: Invalid token'));
            }

            socket.companyId = companyId;
            socket.join(companyId);
            console.log(`Usuario autenticado, sala: ${companyId}`);
            next();
        } catch (error) {
            console.error(err);
            next(new Error('Authentication error'));
        }
    })


    //algunas peticiones por websocket que debo tener encuenta ¿
    //newProduct, productUpdated, stockUpdated, productDeleted
    //newOrder, orderUpdated, orderStatusChanged
    io.on("connection", (socket) => {
        // Unir el socket a una sala específica de su empresa
        // Cada empresa tendrá su propia "sala" de Socket.IO
        socket.on('message', ({ to, data }) => {
            console.log("enviando mensaje ... ", data, " a ", to)
            socket.to(to).emit("message added", data)
        })

        socket.on('disconnect', () => {
            console.log(`Cliente desconectado: ${socket.id} de la sala: ${/*socket.companyId*/ socket.companyId}`);
        });

        // Este listener 'products' ya no sería global
        /*socket.on('products', (data) => {
            console.log('Mensaje recibido:', data);
            const products = await getProductsByCompanyService(socket.companyId)
            io.to(socket.companyId).emit('message', data); // Emite solo a la sala de la empresa
        });*/
    });

    // Expón la instancia 'io' para que puedas usarla en tus rutas o servicios
    return io;

}