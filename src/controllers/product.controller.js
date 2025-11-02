import { createProductService, getProductsByCompanyService } from "../services/product.services.js";
import io from "../server.js";

export const createProduct = async (req, res) => {
    try {
        const {
            name,
            barcode = "",
            description = "",
            imgUrl = "",
            price_cost = 0,
            price_selling = 0,
            stock = 0,
            available = true,
            detail = {},
            companyId,
            type = "general",   // ✅ campo obligatorio en tu esquema Prisma
            unit = "unidad"     // ✅ campo obligatorio en tu esquema Prisma
        } = req.body;

        // 🔹 Validación básica
        if (!name || !companyId) {
            return res.status(400).json({ message: "El nombre y el companyId son obligatorios" });
        }

        // 🔹 Convertimos los valores a sus tipos correctos
        const parsedCompanyId = parseInt(companyId);
        const parsedPriceCost = parseFloat(price_cost);
        const parsedPriceSelling = parseFloat(price_selling);
        const parsedStock = parseInt(stock);

        // Validamos valores numéricos
        if (isNaN(parsedCompanyId) || isNaN(parsedPriceCost) || isNaN(parsedPriceSelling)) {
            return res.status(400).json({ message: "Los campos numéricos deben ser válidos" });
        }

        // 🔹 Creamos el producto mediante el service
        const newProduct = await createProductService({
            name,
            barcode,
            description,
            imgUrl,
            price_cost: parsedPriceCost,
            price_selling: parsedPriceSelling,
            stock: parsedStock,
            available,
            detail,
            companyId: parsedCompanyId,
            type,
            unit
        });

        // 🔹 Emitimos el evento socket solo si se creó correctamente
        io.to(parsedCompanyId).emit("newProduct", newProduct);

        return res.status(201).json(newProduct);

    } catch (error) {
        console.error("❌ Error al crear el producto:", error);
        return res.status(500).json({
            message: "Error interno al crear el producto",
            error: error.message
        });
    }
};

export const getProductsByCompany = async (req, res) => {
    try {
        const { companyId } = req.params;
        const parsedCompanyId = parseInt(companyId);

        if (isNaN(parsedCompanyId)) {
            return res.status(400).json({ message: "El companyId debe ser un número válido" });
        }

        const products = await getProductsByCompanyService(parsedCompanyId);

        if (!products || products.length === 0) {
            return res.status(404).json({ message: "No se encontraron productos para esta compañía" });
        }

        return res.status(200).json(products);

    } catch (error) {
        console.error("❌ Error al obtener los productos:", error);
        return res.status(500).json({
            message: "Error interno al obtener los productos",
            error: error.message
        });
    }
};


