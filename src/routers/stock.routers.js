import { Router } from "express";
import {
  getStockByProduct,
  updateStock,
  getStockByCompany,
} from "../controllers/stock.controller.js";

const router = Router();

router.get("/:productId", getStockByProduct); // Obtener stock de un producto
router.patch("/:productId", updateStock); // Actualizar cantidad de stock
router.get("/company/:companyId", getStockByCompany); // Stock total de una compañía

export default router;
