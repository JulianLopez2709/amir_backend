// 🔹 Resumen general del dashboard
export const getDashboardSummary = async (req, res) => {
  try {
    const { companyId } = req.params;

    return res.status(200).json({
      companyId,
      gananciasMesActual: 0,
      gananciasMesPasado: 0,
      ordenesHoy: 0,
      ordenesEnProceso: [],
      ordenesFinalizadasHoy: 0,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// 🔹 Ganancias mensuales
export const getMonthlyEarnings = async (req, res) => {
  try {
    const { companyId, month } = req.params;

    return res.status(200).json({
      companyId,
      month,
      total: 0,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// 🔹 Órdenes del día
export const getTodayOrders = async (req, res) => {
  try {
    const { companyId } = req.params;

    return res.status(200).json({
      companyId,
      total: 0,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// 🔹 Órdenes en proceso
export const getOrdersInProcess = async (req, res) => {
  try {
    const { companyId } = req.params;

    return res.status(200).json({
      companyId,
      orders: [],
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// 🔹 Órdenes finalizadas hoy
export const getCompletedOrdersToday = async (req, res) => {
  try {
    const { companyId } = req.params;

    return res.status(200).json({
      companyId,
      total: 0,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// 🔹 Datos para gráficas
export const getChartData = async (req, res) => {
  try {
    const { companyId, filtro } = req.params;

    return res.status(200).json({
      companyId,
      filtro,
      data: [],
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

