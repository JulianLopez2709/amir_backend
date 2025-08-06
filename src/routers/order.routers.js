import { Router } from "express";
import { createOrder, getOrdesByCompany, updateOrderStatus } from "../controllers/order.controller.js";

const router = Router()

router.get("/:companyId", getOrdesByCompany)
router.post("/", createOrder)
router.patch('/:orderId/status', updateOrderStatus);

export default router