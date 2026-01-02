import io from "../../server.js";

/**
 * Orden actualizada (productos, notas, etc.)
 */
export const emitOrderUpdated = (companyId, order) => {
    io.to(companyId).emit("order:updated", order);
};

/**
 * Cambio de estado
 */
export const emitOrderStatusChanged = (companyId, payload) => {
    /**
     * payload ejemplo:
     * {
     *   orderId,
     *   status
     * }
     */
    io.to(companyId).emit("order:statusChanged", payload);
};

/**
 * Orden eliminada
 */
export const emitOrderDeleted = (companyId, orderId) => {
    io.to(companyId).emit("order:deleted", { orderId });
};


export const emitOrderCreated = (companyId, orderId) => {
    io.to(companyId).emit("order:created",  orderId);
};
