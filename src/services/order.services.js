import prisma from "../config/prisma.js"

export const createOrderService = async (companyId, total_price, products) => {
    try {
        const newOrder = await prisma.order.create({
            data: {
                total_price,
                companyId,
                products: {
                    create: products.map(product => ({
                        productId: product.productId,
                        quantity: product.quantity,
                        notes: product.notes,
                        status: product.status,
                    }))
                }
            },
            include: {
                products: true, // opcional, por si quieres devolver los productos también
            }
        });

        return newOrder;
    } catch (error) {
        throw error
    }
}

export const getOrdersByCompanyService = async (companyId) => {
    try {
        const orders = await prisma.order.findMany({
            where: {
                companyId: parseInt(companyId),
            },
            include: {
                products: {
                    include: {
                        product: true
                    }
                }
            }
        });

        if (orders.length === 0) {
            return [];
        }

        return orders;
    } catch (error) {
        throw error
    }
}

export const updateOrderStatusService = async (orderId, newStatus) => {
    try {
        const updatedOrder = await prisma.order.update({
            where: {
                id: orderId,
            },
            data: {
                status: newStatus,
            },
            include: {
                products: {
                    include: {
                        product: true
                    }
                }
            }
        });


        return updatedOrder;
    } catch (error) {
        if (error.code === 'P2025') {
            throw new Error('Orden no encontrada');
        }
        // Lanza otros errores para depuración
        throw error;
    }


}