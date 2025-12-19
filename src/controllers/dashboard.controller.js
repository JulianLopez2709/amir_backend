import {
  getGananciasService,
  getOrdenesHoyService,
  getOrdenesEnProcesoService,
  getChartService
} from "../services/dashboard.services.js";

/**
 * 🔹 Resumen principal del dashboard
 */
export const getDashboardSummary = async (req, res) => {
  try {
    const companyId = parseInt(req.params.companyId);

    if (isNaN(companyId)) {
      return res.status(400).json({ message: "companyId inválido" });
    }

    const [
      ganancias,
      ordenesHoy,
      ordenesEnProceso
    ] = await Promise.all([
      getGananciasService(companyId),
      getOrdenesHoyService(companyId),
      getOrdenesEnProcesoService(companyId)
    ]);

    return res.status(200).json({
      gananciasMesActual: ganancias.mesActual,
      gananciasMesPasado: ganancias.mesPasado,
      totalOrdenesHoy: ordenesHoy.totalOrdenesHoy,
      ordenesFinalizadasHoy: ordenesHoy.ordenesFinalizadasHoy,
      ordenesEnProceso: ordenesEnProceso
    });

  } catch (error) {
    console.error("❌ Error en getDashboardSummary:", error);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * 🔹 Ganancias (mes actual / mes pasado)
 */
export const getMonthlyEarnings = async (req, res) => {
  try {
    const companyId = parseInt(req.params.companyId);

    const ganancias = await getGananciasService(companyId);

    return res.status(200).json(ganancias);
  } catch (error) {
    console.error("❌ Error en getMonthlyEarnings:", error);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * 🔹 Órdenes del día
 */
export const getTodayOrders = async (req, res) => {
  try {
    const companyId = parseInt(req.params.companyId);

    const data = await getOrdenesHoyService(companyId);

    return res.status(200).json(data);
  } catch (error) {
    console.error("❌ Error en getTodayOrders:", error);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * 🔹 Órdenes en proceso
 */
export const getOrdersInProcess = async (req, res) => {
  try {
    const companyId = parseInt(req.params.companyId);

    const data = await getOrdenesEnProcesoService(companyId);

    return res.status(200).json(data);
  } catch (error) {
    console.error("❌ Error en getOrdersInProcess:", error);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * 🔹 Órdenes finalizadas hoy
 */
export const getCompletedOrdersToday = async (req, res) => {
  try {
    const companyId = parseInt(req.params.companyId);

    const { ordenesFinalizadasHoy } = await getOrdenesHoyService(companyId);

    return res.status(200).json({ total: ordenesFinalizadasHoy });
  } catch (error) {
    console.error("❌ Error en getCompletedOrdersToday:", error);
    return res.status(500).json({ message: error.message });
  }
};

/**
 * 🔹 Datos para gráficas
 */
export const getChartData = async (req, res) => {
  try {
    const companyId = parseInt(req.params.companyId);
    const { filtro } = req.params;

    const data = await getChartService(companyId, filtro);

    return res.status(200).json(data);
  } catch (error) {
    console.error("❌ Error en getChartData:", error);
    return res.status(500).json({ message: error.message });
  }
};


