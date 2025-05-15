// app.js
import express from 'express';
import dotenv from 'dotenv';
import routerUser from './routers/user.routers.js';
import routerCompany from './routers/company.routers.js';
import { authenticateToken } from './middleware/auth.js';
import prisma from './config/db.js';
import router from './routers/auth.js';

dotenv.config();

const app = express();

// Middleware básico
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas protegidas con autenticación
app.use("/profile", authenticateToken, async (req, res) => {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });
    res.json({ user });
});

// Rutas públicas
app.use("/order", (req, res) => {
    res.send("ordenes detail");
});

app.use("/product", (req, res) => {
    res.json({ message: "product" });
});

// Rutas protegidas
app.use("/company", authenticateToken, routerCompany);
app.use("/user", authenticateToken, routerUser);
app.use("/auth", router);

// Middleware de manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Error del servidor' });
});

export default app;