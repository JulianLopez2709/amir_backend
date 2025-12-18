
import express from 'express'
import cors from 'cors'
import routerUser from './routers/user.routers.js'
import { authenticateToken } from './middleware/auth.js';
import routerCompany from './routers/company.routers.js'
import routerProduct from './routers/product.routers.js'
import routerOrden from './routers/order.routers.js'
import prisma from './config/db.js';
import router from './routers/auth.js';
import dashboardRouters from "./routers/dashboard.routers.js";

const app = express()
app.use(express.json())
const corsOriginEnv = process.env.CORS_ORIGIN;

// Divide la cadena en un array de dominios.
const allowedOrigins = corsOriginEnv
  ? corsOriginEnv.split(',')
  : ['http://localhost:5173'];

app.use(cors({
  origin: allowedOrigins, 
  credentials: true,
}));

app.use(express.urlencoded({ extended: true }));

app.use("/order", routerOrden)
app.use("/product", routerProduct)
app.use("/company", routerCompany)
app.use("/user", routerUser)
app.use("/auth", router);
app.use("/dashboard", dashboardRouters);

// Middleware de manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Error del servidor' });
});

export default app