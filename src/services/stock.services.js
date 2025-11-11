import prisma from "../config/db.js";

/**
 * 🔹 Crear o inicializar stock para un producto
 */
export const createOrUpdateStockService = async ({ productId, quantity = 0, type = "Inicial", reference = "Registro manual" }) => {
  try {
    // Verificar si el producto ya tiene registro de stock
    const existingStock = await prisma.stock.findUnique({ where: { productId } });

    if (existingStock) {
      // Si existe, actualizamos la cantidad
      const updatedStock = await prisma.stock.update({
        where: { productId },
        data: {
          quantity: quantity,
          type,
          reference,
        },
      });
      return updatedStock;
    }

    // Si no existe, lo creamos
    const newStock = await prisma.stock.create({
      data: {
        productId,
        quantity,
        type,
        reference,
      },
    });

    return newStock;
  } catch (error) {
    console.error("❌ Error en createOrUpdateStockService:", error.message);
    throw new Error("No se pudo crear o actualizar el stock.");
  }
};

/**
 * 🔹 Obtener stock por producto
 */
export const getStockByProductService = async (productId) => {
  try {
    const stock = await prisma.stock.findUnique({
      where: { productId },
      include: {
        product: {
          select: { name: true, price_selling: true },
        },
      },
    });

    if (!stock) {
      throw new Error("No se encontró registro de stock para este producto.");
    }

    return stock;
  } catch (error) {
    console.error("❌ Error en getStockByProductService:", error.message);
    throw new Error("No se pudo obtener el stock.");
  }
};

/**
 * 🔹 Ajustar stock (incrementar o disminuir)
 */
export const adjustStockService = async (productId, quantityChange, reference = "Ajuste manual") => {
  try {
    const stock = await prisma.stock.findUnique({ where: { productId } });

    if (!stock) throw new Error("No existe stock para este producto.");

    const updatedStock = await prisma.stock.update({
      where: { productId },
      data: {
        quantity: stock.quantity + quantityChange,
        reference,
        type: quantityChange > 0 ? "Ingreso" : "Salida",
      },
    });

    return updatedStock;
  } catch (error) {
    console.error("❌ Error en adjustStockService:", error.message);
    throw new Error("No se pudo ajustar el stock.");
  }
};

