import prisma from "../config/db.js"


export const createProductService = async ({name, barcode, description, imgUrl, price_cost, price_selling, stock_minimo, stock, avaliable, detail, companyId}) => {
    try {
        const newProduct = await prisma.product.create({
            data: {
                name, barcode, description, imgUrl, price_cost, price_selling, stock_minimo, stock, avaliable, detail,
                company: {
                    connect: { id: companyId }
                }
            },
        })
        return newProduct
    } catch (error) {
        console.log(error)
        throw error
        
    }
}

export const getProductsByCompanyService = async (companyId) => {
    try {
        const products = await prisma.product.findMany({
            where: {
                company: {
                    id: companyId,
                },
            },
        })
        return products
    } catch (error) {
        throw error
    }
}