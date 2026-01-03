import { Router } from "express";
import {
  createVariant,
  getVariantsByProduct,
  updateVariant,
  deleteVariant,
} from "../controllers/variant.controller.js";

const router = Router();

/**
 * 📦 Rutas para la gestión de variantes de productos
 */

// Crear una nueva variante
router.post("/", createVariant);

// Obtener todas las variantes de un producto
router.get("/product/:productId", getVariantsByProduct);

// Actualizar una variante existente
router.put("/:variantId", updateVariant);

// Eliminar una variante
router.delete("/:variantId", deleteVariant);

export default router;



