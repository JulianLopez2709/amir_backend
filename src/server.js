// server.js
import http from 'http';
import app from './app.js';
import { setupWebSocket } from './sockets/index.js';

const server = http.createServer(app);
const port = process.env.PORT || 3000;

setupWebSocket(server);

const httpServer = server.listen(port, () => {
    console.log(`Servidor ejecutándose en el puerto ${port}`);
});

export default httpServer;