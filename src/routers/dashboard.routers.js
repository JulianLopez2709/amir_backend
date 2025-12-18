import { Router } from "express";
import {
  getDashboardSummary,
  getMonthlyEarnings,
  getTodayOrders,
  getOrdersInProcess,
  getCompletedOrdersToday,
  getChartData
} from "../controllers/dashboard.controller.js";

const router = Router();

// 🔹 Resumen general del dashboard
router.get("/summary/:companyId", getDashboardSummary);

// 🔹 Ganancias
router.get("/ganancias/:companyId", getMonthlyEarnings);

// 🔹 Órdenes
router.get("/ordenes-hoy/:companyId", getTodayOrders);
router.get("/ordenes-proceso/:companyId", getOrdersInProcess);
router.get("/ordenes-finalizadas-hoy/:companyId", getCompletedOrdersToday);

// 🔹 Gráficas
router.get("/chart/:companyId/:filtro", getChartData);

export default router;

