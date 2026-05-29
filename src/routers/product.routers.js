import { Router } from "express";
import upload from "../middleware/uploadMiddleware.js";
import {
  createProduct,
  getProductsByCompany,
  updateProduct
} from "../controllers/product.controller.js";

const router = Router();

router.get("/:companyId", getProductsByCompany);
router.post("/", upload.single('image'), createProduct);
router.patch("/:productId", upload.single('image'), updateProduct); // 🔹 Nueva ruta para actualizar productos

export default router;
