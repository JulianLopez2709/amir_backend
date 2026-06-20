import { Router } from "express";
import {
  createOrder,
  getOrdersByCompany,
  getOrderDetail,
  updateOrderStatus,
  updateOrder,
  payOrderProducts,
} from "../controllers/order.controller.js";

const router = Router();

// 🧾 Crear una nueva orden
router.post("/", createOrder);

// 🧾 Obtener todas las órdenes de una compañía 🟢
router.get("/company/:companyId", getOrdersByCompany);

// 🧾 Obtener detalle completo de una orden
router.get("/:orderId", getOrderDetail);

// 🧾 Actualizar estado de una orden
router.patch("/:orderId/status", updateOrderStatus);
router.patch("/:orderId/pay", payOrderProducts);
router.put("/:orderId", updateOrder);

router.get("/company/:companyId", getOrdersByCompany);


export default router;
