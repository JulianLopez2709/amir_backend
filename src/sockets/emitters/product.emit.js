import io from "../../server.js";

/**
 * Producto creado
 */
export const emitProductNew = (companyId, product) => {
    io.to(companyId).emit("product:new", product);
};

/**
 * Stock actualizado
 */
export const emitProductStockUpdated = (companyId, payload) => {
    /**
     * payload ejemplo:
     * {
     *   productId,
     *   newStock
     * }
     */
    io.to(companyId).emit("product:stockUpdated", payload);
};
