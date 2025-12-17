import { Router } from "express";
import upload from "../middleware/uploadMiddleware.js";
import {
  createProduct,
  getProductsByCompany,
  updateProduct,
  testUpload
} from "../controllers/product.controller.js";

const router = Router();

router.get("/:companyId", getProductsByCompany);
router.post("/", createProduct);
router.put("/:productId", updateProduct); // 🔹 Nueva ruta para actualizar productos
router.post('/test-upload', upload.single('image'), testUpload); // 🔹 Nueva ruta para pruebas de subida de archivos

export default router;
