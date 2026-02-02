import { endOfDay, startOfDay } from "date-fns";
import prisma from "../config/db.js";
import { toZonedTime } from "date-fns-tz";
/**
 * 🔹 Ganancias mes actual y mes pasado
 */
export const getGananciasService = async (companyId) => {
  try {
    const now = new Date();

    const inicioMesActual = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
      10, 0, 0
    );

    const finMesActual = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      1,
      9, 59, 59
    );


    // =========================
    // MES PASADO (operativo)
    // =========================
    const inicioMesPasado = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1,
      10, 0, 0
    );

    const finMesPasado = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
      9, 59, 59
    );


    const gananciaMesActual = await prisma.order.aggregate({
      where: {
        companyId,
        status: "completed",
        createAt: {
          gte: inicioMesActual,
          lte: finMesActual,
        },
      },
      _sum: {
        total_price: true,
      },
    });

    const gananciaMesPasado = await prisma.order.aggregate({
      where: {
        companyId,
        status: "completed",
        createAt: {
          gte: inicioMesPasado,
          lte: finMesPasado,
        },
      },
      _sum: {
        total_price: true,
      },
    });

    return {
      mesActual: {
        fecha: inicioMesActual,
        total: gananciaMesActual._sum.total_price || 0,
      },
      mesPasado: {
        fecha: inicioMesPasado,
        total: gananciaMesPasado._sum.total_price || 0,
      },
    };
  } catch (error) {
    console.error("❌ Error en getGananciasService:", error);
    throw error;
  }
};

/**
 * 🔹 Órdenes del día
 */
export const getOrdenesHoyService = async (companyId) => {
  try {
    const todayLocal = new Date()
      .toLocaleDateString("en-CA", { timeZone: "America/Bogota" }); // YYYY-MM-DD

    const { startUTC, endUTC } = getUTCDateRangeForBusinessDay(todayLocal);

    const totalHoy = await prisma.order.count({
      where: {
        companyId,
        createAt: {
          gte: startUTC,
          lte: endUTC,
        },
      },
    });

    const finalizadasHoy = await prisma.order.count({
      where: {
        companyId,
        status: "completed",
        createAt: {
          gte: startUTC,
          lte: endUTC,
        },
      },
    });

    return {
      totalOrdenesHoy: totalHoy,
      ordenesFinalizadasHoy: finalizadasHoy,
    };
  } catch (error) {
    console.error("❌ Error en getOrdenesHoyService:", error);
    throw error;
  }
};

/**
 * 🔹 Órdenes en proceso
 */
export const getOrdenesEnProcesoService = async (companyId) => {
  try {
    const ordenes = await prisma.order.findMany({
      where: {
        companyId,
        status: {
          in: ["pending", "processing"],
        },
      },
      select: {
        id: true,
      },
      orderBy: {
        createAt: "desc",
      },
    });

    return {
      cantidad: ordenes.length,
      ordenes: ordenes.map((o) => ({
        id: o.id.slice(-4), // últimos 4 caracteres
      })),
    };
  } catch (error) {
    console.error("❌ Error en getOrdenesEnProcesoService:", error);
    throw error;
  }
};

/**
 * 🔹 Datos para gráfica (semana / quincena / mes)
 */
export const getChartService = async (companyId, filtro) => {
  try {
    const now = new Date();
    let inicio;

    if (filtro === "semana") {
      inicio = new Date(now);
      inicio.setDate(now.getDate() - 7);
    } else if (filtro === "quincena") {
      inicio = new Date(now);
      inicio.setDate(now.getDate() - 15);
    } else {
      // mes
      inicio = new Date(now);
      inicio.setMonth(now.getMonth() - 1);
    }

    const orders = await prisma.order.findMany({
      where: {
        companyId,
        status: "completed",
        createAt: {
          gte: inicio,
        },
      },
      select: {
        createAt: true,
        total_price: true,
      },
      orderBy: {
        createAt: "asc",
      },
    });

    const grouped = {};

    for (const order of orders) {
      const fecha = order.createAt.toISOString().split("T")[0];
      grouped[fecha] = (grouped[fecha] || 0) + order.total_price;
    }

    return Object.entries(grouped).map(([fecha, total]) => ({
      fecha,
      total,
    }));
  } catch (error) {
    console.error("❌ Error en getChartService:", error);
    throw error;
  }
};

// services/dashboard.services.js
export const getGananciasHoyService = async (companyId) => {
  try {
    const todayLocal = new Date()
      .toLocaleDateString("en-CA", { timeZone: "America/Bogota" }); // YYYY-MM-DD

    const { startUTC, endUTC } = getUTCDateRangeForBusinessDay(todayLocal);

    const ordenesHoy = await prisma.order.findMany({
      where: {
        companyId,
        createAt: {
          gte: startUTC,
          lte: endUTC,
        },
      },
      select: {
        total_price: true,
        status: true,
      },
    });

    const gananciasHoy = ordenesHoy
      .filter(o => o.status === "completed")
      .reduce((sum, o) => sum + o.total_price, 0);

    const gananciaEstimadaHoy = ordenesHoy
      .filter(o => o.status !== "canceled")
      .reduce((sum, o) => sum + o.total_price, 0);

    return {
      gananciasHoy,
      gananciaEstimadaHoy,
    };
  } catch (error) {
    console.error("❌ Error en getGananciasHoyService:", error);
    throw error;
  }
};
function getUTCDateRangeForBusinessDay(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);

  // Colombia UTC-5
  // 05:00 COL = 10:00 UTC
  const startUTC = new Date(Date.UTC(year, month - 1, day, 10, 0, 0, 0));

  // 04:59 COL del día siguiente = 09:59 UTC
  const endUTC = new Date(Date.UTC(year, month - 1, day + 1, 9, 59, 59, 999));

  return { startUTC, endUTC };
}
