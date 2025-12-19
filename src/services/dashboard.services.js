import prisma from "../config/db.js";

/**
 * 🔹 Ganancias mes actual y mes pasado
 */
export const getGananciasService = async (companyId) => {
  try {
    const now = new Date();

    const inicioMesActual = new Date(now.getFullYear(), now.getMonth(), 1);
    const inicioMesPasado = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const finMesPasado = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const gananciaMesActual = await prisma.order.aggregate({
      where: {
        companyId,
        status: "completed",
        createAt: {
          gte: inicioMesActual,
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
    const inicioDia = new Date();
    inicioDia.setHours(0, 0, 0, 0);

    const finDia = new Date();
    finDia.setHours(23, 59, 59, 999);

    const totalHoy = await prisma.order.count({
      where: {
        companyId,
        createAt: {
          gte: inicioDia,
          lte: finDia,
        },
      },
    });

    const finalizadasHoy = await prisma.order.count({
      where: {
        companyId,
        status: "completed",
        createAt: {
          gte: inicioDia,
          lte: finDia,
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

