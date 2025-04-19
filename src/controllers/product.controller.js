import { createProductService, getProductsByCompanyService } from "../services/product.services.js"

export const createProduct = async (req, res) => {
    try {
        const { name, barcode, description, imgUrl, price_cost, price_selling, stock_minimo, stock, avaliable, detail, companyId } = req.body
        const newProduct = await createProductService(name, barcode, description, imgUrl, price_cost, price_selling, stock_minimo, stock, avaliable, detail, companyId)
        res.status(201).send(newProduct )
    } catch (error) {
        res.status(400).send(error.message)
        
    }
}


export const getProductsByCompany = async (req, res) => {
    try {
        const { companyId } = req.params
        const products = await getProductsByCompanyService(parseInt(companyId))
        if (products.length === 0) {
            return res.status(404).send({ message: "No se encontraron productos para esta company" })
        }
        res.status(200).send(products)
    } catch (error) {
        res.status(400).send({ message: "Error al obtener los productos", error : error.message })
    }
}