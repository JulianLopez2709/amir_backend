import { Router } from "express";
import { createProduct,getProductsByUser } from "../controllers/product.controller.js";

const router = Router()

router.get("/:companyId", getProductsByUser)
router.post("/", createProduct)

export default router