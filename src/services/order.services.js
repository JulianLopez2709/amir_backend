import prisma from "../config/db.js";

/**
 * Crea una nueva orden con sus productos asociados
 */
export const createOrderService = async ({ companyId, total_price, products, detail }) => {
  try {
    // 1️⃣ Crear la orden principal
    const newOrder = await prisma.order.create({
      data: {
        companyId,
        total_price,
        detail,
        status: "new"
      },
    });

    // 2️⃣ Crear los productos de la orden y actualizar stock
    for (const item of products) {
      const { productId, quantity } = item;

      // Validar producto
      const existingProduct = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!existingProduct) {
        throw new Error(`El producto con ID ${productId} no existe.`);
      }

      // Crear relación producto-orden
      await prisma.productOrder.create({
        data: {
          status: "pending",
          quantity,
          notes: "Venta generada por pedido",
          productId,
          orderId: newOrder.id,
          subtotal: existingProduct.price_selling * quantity,
        },
      });

      // Actualizar el stock (decrementar cantidad)
      await prisma.stock.update({
        where: { productId },
        data: {
          quantity: { decrement: quantity },
          type: "Venta",
          reference: `Orden ${newOrder.id}`,
        },
      });
    }

    return newOrder;
  } catch (error) {
    console.error("❌ Error en createOrderService:", error.message);
    throw new Error("No se pudo crear la orden. Verifica los datos enviados.");
  }
};

/**
 * Obtiene el detalle completo de una orden
 */
export const getOrderDetailService = async (orderId) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        products: {
          include: {
            product: {
              select: { name: true, price_selling: true, imgUrl: true },
            },
          },
        },
        company: { select: { name: true } },
      },
    });

    if (!order) {
      throw new Error(`La orden con ID ${orderId} no existe.`);
    }

    return order;
  } catch (error) {
    console.error("❌ Error en getOrderDetailService:", error.message);
    throw new Error("No se pudo obtener el detalle de la orden.");
  }
};

export const getOrdersByCompanyService = async (companyId) => {
  try {
    const orders = await prisma.order.findMany({
      where: { companyId },
      include: {
        products: {
          include: {
            product: { select: { name: true, price_selling: true } }
          }
        }
      },
      orderBy: { createAt: "desc" }
    });
    return orders;
  } catch (error) {
    console.error("❌ Error en getOrdersByCompanyService:", error.message);
    throw new Error("No se pudieron obtener las órdenes de la compañía.");
  }
};

export const updateOrderStatusService = async (orderId, status) => {
  try {
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        products: {
          include: {
            product: { select: { name: true } },
          },
        },
      },
    });
    return updatedOrder;
  } catch (error) {
    console.error("❌ Error en updateOrderStatusService:", error.message);
    throw new Error("No se pudo actualizar el estado de la orden.");
  }
};
