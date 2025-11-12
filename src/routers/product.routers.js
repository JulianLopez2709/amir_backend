import { Router } from "express";
import {
  createProduct,
  getProductsByCompany,
  updateProduct
} from "../controllers/product.controller.js";

const router = Router();

router.get("/:companyId", getProductsByCompany);
router.post("/", createProduct);
router.put("/:productId", updateProduct); // 🔹 Nueva ruta para actualizar productos

export default router;
