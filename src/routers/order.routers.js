import { Router } from "express";
import { createOrder, getOrdesByCompany } from "../controllers/order.controller.js";

const router = Router()

router.get("/:companyId", getOrdesByCompany)
router.post("/", createOrder)

export default router