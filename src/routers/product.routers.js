import { Router } from "express";
import { createProduct,getProductsByCompany } from "../controllers/product.controller.js";

const router = Router()

router.get("/:companyId", getProductsByCompany)
router.post("/", createProduct)

export default router