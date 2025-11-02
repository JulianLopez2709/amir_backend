import { Router } from "express";
import {
  createOrder,
  getOrdersByCompany,
  getOrderDetail,
  updateOrderStatus,
} from "../controllers/order.controller.js";

const router = Router();

// 🧾 Crear una nueva orden
router.post("/", createOrder);

// 🧾 Obtener todas las órdenes de una compañía
router.get("/company/:companyId", getOrdersByCompany);

// 🧾 Obtener detalle completo de una orden
router.get("/:orderId", getOrderDetail);

// 🧾 Actualizar estado de una orden
router.patch("/:orderId/status", updateOrderStatus);

router.get("/company/:companyId", getOrdersByCompany);

router.put("/:orderId/status", updateOrderStatus);


export default router;
