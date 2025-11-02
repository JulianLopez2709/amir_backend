import { createOrderService, getOrderDetailService } from "../services/order.services.js";

/**
 * Crea una nueva orden
 */
export const createOrder = async (req, res) => {
  try {
    const { companyId, total_price, products, detail } = req.body;

    if (!companyId || !total_price || !products || products.length === 0) {
      return res.status(400).json({ message: "Faltan datos obligatorios en la solicitud." });
    }

    const newOrder = await createOrderService({ companyId, total_price, products, detail });
    return res.status(201).json({ message: "Orden creada correctamente", order: newOrder });
  } catch (error) {
    console.error("❌ Error en createOrder:", error.message);
    return res.status(500).json({ message: "Error al crear la orden", error: error.message });
  }
};

/**
 * Obtiene el detalle completo de una orden
 */
export const getOrderDetail = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({ message: "Debe proporcionar un ID de orden válido." });
    }

    const order = await getOrderDetailService(orderId);
    return res.status(200).json(order);
  } catch (error) {
    console.error("❌ Error en getOrderDetail:", error.message);
    return res.status(500).json({ message: "Error al obtener el detalle de la orden", error: error.message });
  }
};

import { getOrdersByCompanyService } from "../services/order.services.js";

/**
 * Obtiene todas las órdenes de una compañía
 */
export const getOrdersByCompany = async (req, res) => {
  try {
    const { companyId } = req.params;

    if (!companyId) {
      return res.status(400).json({ message: "Debe proporcionar un ID de compañía válido." });
    }

    const orders = await getOrdersByCompanyService(parseInt(companyId));

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No se encontraron órdenes para esta compañía." });
    }

    return res.status(200).json(orders);
  } catch (error) {
    console.error("❌ Error en getOrdersByCompany:", error.message);
    return res.status(500).json({ message: "Error al obtener las órdenes", error: error.message });
  }
};

import { updateOrderStatusService } from "../services/order.services.js";

/**
 * 🔹 Actualiza el estado de una orden
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!orderId || !status) {
      return res.status(400).json({ message: "Debe enviar el ID de la orden y el nuevo estado." });
    }

    const updatedOrder = await updateOrderStatusService(orderId, status);

    return res.status(200).json({
      message: "Estado de la orden actualizado correctamente",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("❌ Error en updateOrderStatus:", error.message);
    return res.status(500).json({ message: "Error al actualizar la orden", error: error.message });
  }
};
