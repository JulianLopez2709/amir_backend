import { Router } from "express";
import {
  createProduct,
  getProductsByCompany
} from "../controllers/product.controller.js";

const router = Router();

/**
 * 🔹 Rutas de productos
 */

// Obtener todos los productos de una compañía
// Ejemplo: GET /product/company/1
router.get("/company/:companyId", getProductsByCompany);

// Crear un nuevo producto
// Ejemplo: POST /product
router.post("/", createProduct);

export default router;
