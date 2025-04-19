import { createOrderService, getOrdersByCompanyService } from "../services/order.services.js"

export const createOrder = async (req, res) => {
    const { companyId, total_price, products } = req.body
    try {
        const newOrder = await createOrderService(companyId, total_price, products)
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