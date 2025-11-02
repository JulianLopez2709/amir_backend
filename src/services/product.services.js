import prisma from "../config/db.js";

/**
 * 🔹 Crea un nuevo producto y su registro de stock inicial.
 */
export const createProductService = async ({
    name,
    barcode,
    description,
    imgUrl,
    price_cost,
    price_selling,
    stock = 0,
    available = true,
    detail = {},
    companyId,
    type = "general",
    unit = "unidad"
}) => {
    try {
        // 🧩 1. Crear el producto
        const newProduct = await prisma.product.create({
            data: {
                name,
                barcode,
                description,
                imgUrl,
                price_cost,
                price_selling,
                available,
                detail,
                type,
                unit,
                company: {
                    connect: { id: companyId }, // ✅ Relación con la compañía
                },
            },
            include: {
                company: {
                    select: { name: true }, // ✅ Retorna nombre de la compañía
                },
            },
        });

        // 🧩 2. Crear registro de stock inicial (relación 1:1)
        await prisma.stock.create({
            data: {
                productId: newProduct.id,
                quantity: stock,
                type: "Inicial",
                reference: "Registro inicial de inventario",
            },
        });

        return newProduct;

    } catch (error) {
        console.error("❌ Error al crear producto:", error.message);
        throw new Error("No se pudo crear el producto. Verifica los datos enviados.");
    }
};


/**
 * 🔹 Obtiene todos los productos de una compañía.
 */
export const getProductsByCompanyService = async (companyId) => {
    try {
        const products = await prisma.product.findMany({
            where: { companyId },
            include: {
                stock_records: true, // ✅ Incluye el registro de stock (relación 1:1)
                company: {
                    select: { name: true },
                },
            },
            orderBy: {
                createAt: "desc", // ✅ Campo correcto según tu schema
            },
        });

        return products;

    } catch (error) {
        console.error("❌ Error al obtener productos:", error.message);
        throw new Error("No se pudieron obtener los productos.");
    }
};


