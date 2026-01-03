import { Router } from "express";
import { createOrUpdateStock, getStockByProduct, adjustStock } from "../controllers/stock.controller.js";

const router = Router();

router.post("/", createOrUpdateStock);
router.get("/:productId", getStockByProduct);
router.put("/adjust", adjustStock);

export default router;
