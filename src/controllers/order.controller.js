import { createOrderService, getOrdersByCompanyService, updateOrderStatusService } from "../services/order.services.js"
import io from '../server.js'

export const createOrder = async (req, res) => {
    const { companyId, total_price, products } = req.body
    try {
        const newOrder = await createOrderService(companyId, total_price, products)
        if (newOrder) {
            io.to(companyId).emit("newOrder", newOrder)
        }
        res.status(201).send(newOrder)
    } catch (error) {
        res.status(400).send(error.message)
    }
}

export const getOrdesByCompany = async (req, res) => {
    const { companyId } = req.params
    try {
        const orders = await getOrdersByCompanyService(companyId)
        res.status(200).send(orders)
    } catch (error) {
        res.status(400).send(error.message)
    }
}


export const updateOrderStatus = async (req, res) => {
    const { orderId } = req.params;
    const { status, paymentMethod } = req.body;
    const companyId = req.companyId;

    if (!status) {
        return res.status(400).send('Faltan los campos "status" y "companyId"');
    }

    try {
        const updatedOrder = await updateOrderStatusService(orderId, status);

        io.to(companyId).emit('orderStatusChanged', updatedOrder);

        res.status(200).send(updatedOrder);

    } catch (error) {
        res.status(404).send({ message: error.message });
    }
};