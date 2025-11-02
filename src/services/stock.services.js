import prisma from "../config/db.js";

/**
 * 🔹 Obtener el stock de un producto específico
 */
export const getStockByProductService = async (productId) => {
  try {
    const stock = await prisma.stock.findUnique({
      where: { productId },
      include: {
        product: {
          select: { name: true, companyId: true },
        },
      },
    });
    return stock;
  } catch (error) {
    console.error("❌ Error al obtener el stock:", error.message);
    throw new Error("No se pudo obtener el stock del producto.");
  }
};

/**
 * 🔹 Actualizar el stock de un producto (suma o resta)
 */
export const updateStockService = async (productId, quantity, type, reference) => {
  try {
    const existingStock = await prisma.stock.findUnique({ where: { productId } });

    if (!existingStock) {
      throw new Error("El producto no tiene registro de stock.");
    }

    const newQuantity = existingStock.quantity + quantity;

    const updatedStock = await prisma.stock.update({
      where: { productId },
      data: {
        quantity: newQuantity,
        type,
        reference,
      },
    });

    return updatedStock;
  } catch (error) {
    console.error("❌ Error al actualizar el stock:", error.message);
    throw new Error("No se pudo actualizar el stock.");
  }
};

/**
 * 🔹 Obtener el stock de todos los productos de una compañía
 */
export const getStockByCompanyService = async (companyId) => {
  try {
    const stockList = await prisma.stock.findMany({
      where: {
        product: {
          companyId,
        },
      },
      include: {
        product: {
          select: { name: true, companyId: true },
        },
      },
    });

    return stockList;
  } catch (error) {
    console.error("❌ Error al obtener stock de la compañía:", error.message);
    throw new Error("No se pudo obtener el stock de la compañía.");
  }
};
