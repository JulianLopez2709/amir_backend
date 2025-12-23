import { createOrderService, getOrderDetailService, getOrdersByCompanyService, updateOrderStatusService, updateOrderService } from "../services/order.services.js";

/**
 * Crea una nueva orden 
 */
export const createOrder = async (req, res) => {
  try {
    const { companyId, products, detail } = req.body;

    if (!companyId || !products || products.length === 0) {
      return res.status(400).json({ message: "Faltan datos obligatorios en la solicitud." });
    }

    const newOrder = await createOrderService({ companyId, products, detail });
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

/**
 * Obtiene todas las órdenes de una compañía
 */
export const getOrdersByCompany = async (req, res) => {
  try {
    const { companyId, } = req.params;
    const {
      startDate,
      endDate,
      status,
      minPrice,
      maxPrice,
      page,
      limit
    } = req.query;

    if (!companyId) {
      return res.status(400).json({ message: "Debe proporcionar un ID de compañía válido." });
    }

    const filters = {
      startDate,
      endDate,
      status,
      minPrice,
      maxPrice,
      page,
      limit,
    };

    const orders = await getOrdersByCompanyService(parseInt(companyId), filters);
    if (!orders || orders.data.length === 0) {
      return res.status(404).json({ message: "No se encontraron órdenes para esta compañía." });
    }


    return res.status(200).json(orders);
  } catch (error) {
    console.error("❌ Error en getOrdersByCompany:", error.message);
    return res.status(500).json({ message: "Error al obtener las órdenes", error: error.message });
  }
};


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
      updatedOrder,
    });
  } catch (error) {
    console.error("❌ Error en updateOrderStatus:", error.message);
    return res.status(500).json({ message: "Error al actualizar la orden", error: error.message });
  }
};

export const updateOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const data = req.body;

    if (!orderId || !data) {
      return res.status(400).json({ message: "Faltan datos obligatorios en la solicitud." });
    }

    const orders = await updateOrderService(orderId, data);

    return res.status(200).json(orders);

  } catch (error) {
    return res.status(500).json({ message: "Error al obtener las órdenes", error: error.message });

  }
}
