import { createProductService, getProductsByCompanyService } from "../services/product.services.js"
import io from '../server.js'
/*
interface ProductCreate {
    type: TypeProduct,
    name: string,
    description: string,
    price_selling: number,
    price_cost: number,
    stock?: number,
    imgUrl?: string,
    barcode?: number,
    stock_minimo?: number,
    avaliable?: boolean,
    is_favorite?: boolean,
    categoryId?: number,
    companyId: number

    //"detail" ?: {},
    //"createAt": "2025-04-19T01:43:38.083Z",

}*/
export const createProduct = async (req, res) => {
    try {
        const { name, barcode="", description, imgUrl = "", price_cost=0, price_selling=0, stock_minimo=0, stock = 0, avaliable = true, detail = {}, companyId } = req.body
        const newProduct = await createProductService({name, barcode, description, imgUrl, price_cost, price_selling, stock_minimo, stock, avaliable, detail, companyId})
        io.to(companyId).emit('newProduct', newProduct)
        res.status(201).send(newProduct)
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