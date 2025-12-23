import {
  createProductService,
  getProductsByCompanyService,
  updateProductService
} from "../services/product.services.js";
import io from "../server.js";

/**
 * 🧩 Crear un nuevo producto (con soporte para variantes y stock opcional)
 */
export const createProduct = async (req, res) => {
  try {
    let {
      name,
      barcode = "",
      description = "",
      price_cost = 0,
      price_selling = 0,
      stock = 0,
      available = true,
      detail = {},
      companyId,
      type = "general",
      unit = "unidad",
      variants = [],
    } = req.body;

    // 🛑 Validación básica
    if (!name || !companyId) {
      return res.status(400).json({
        message: "El nombre y el companyId son obligatorios",
      });
    }

    // 🔹 Manejo de la imagen (Cloudinary)
    const imgUrl = req.file ? req.file.path : (req.body.imgUrl || "");

    // 🔹 Parseo de objetos complejos si vienen como strings (común en multipart/form-data)
    if (typeof detail === 'string') {
        try {
            detail = JSON.parse(detail);
        } catch (e) {
            console.error("Error parseando detail:", e);
            detail = {};
        }
    }

    if (typeof variants === 'string') {
        try {
            variants = JSON.parse(variants);
        } catch (e) {
            console.error("Error parseando variants:", e);
            variants = [];
        }
    }
    
    // Parseo de booleanos
    if (typeof available === 'string') {
        available = available === 'true';
    }

    // 🔹 Parseo de datos numéricos
    const parsedData = {
      companyId: parseInt(companyId),
      price_cost: parseFloat(price_cost),
      price_selling: parseFloat(price_selling),
      stock: parseInt(stock),
    };

    // 🔹 Verificar que los datos numéricos sean válidos
    if (Object.values(parsedData).some((v) => isNaN(v))) {
      return res.status(400).json({
        message: "Uno o más campos numéricos no son válidos.",
      });
    }

    // 🔹 Crear producto
    const newProduct = await createProductService({
      name,
      barcode,
      description,
      imgUrl,
      price_cost: parsedData.price_cost,
      price_selling: parsedData.price_selling,
      stock: parsedData.stock,
      available,
      detail,
      companyId: parsedData.companyId,
      type,
      unit,
      variants,
    });

    // 🔹 Emitir evento en tiempo real (solo si se crea correctamente)
    io.to(parsedData.companyId).emit("newProduct", newProduct);

    return res.status(201).json({
      message: "✅ Producto creado correctamente",
      product: newProduct,
    });
  } catch (error) {
    console.error("❌ Error al crear el producto:", error);
    return res.status(500).json({
      message: "Error interno al crear el producto",
      error: error.message,
    });
  }
};

/**
 * 🧩 Obtener todos los productos de una compañía (sin incluir info redundante)
 */
export const getProductsByCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const parsedCompanyId = parseInt(companyId);

    if (isNaN(parsedCompanyId)) {
      return res.status(400).json({ message: "El companyId debe ser un número válido." });
    }

    const products = await getProductsByCompanyService(parsedCompanyId);

    if (!products?.length) {
      return res.status(404).json({ message: "No se encontraron productos para esta compañía." });
    }

    return res.status(200).json(products);
  } catch (error) {
    console.error("❌ Error al obtener los productos:", error);
    return res.status(500).json({
      message: "Error interno al obtener los productos",
      error: error.message,
    });
  }
};


export const updateProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        
        if (!productId) {
            return res.status(400).json({ message: "El ID del producto es obligatorio" });
        }

        const updateData = { ...req.body };

        // Si se subió una imagen, actualizamos la URL
        if (req.file) {
            updateData.imgUrl = req.file.path;
        }

        // Conversión EXPLÍCITA de tipos (necesario para multipart/form-data)
        if (updateData.price_cost !== undefined) updateData.price_cost = parseFloat(updateData.price_cost);
        if (updateData.price_selling !== undefined) updateData.price_selling = parseFloat(updateData.price_selling);
        if (updateData.stock !== undefined) updateData.stock = parseInt(updateData.stock);
        
        if (updateData.available === 'true') updateData.available = true;
        if (updateData.available === 'false') updateData.available = false;

        const updatedProduct = await updateProductService(productId, updateData);

        // Notificar cambio
        io.emit("productUpdated", updatedProduct);

        return res.status(200).json({
            message: "Producto actualizado correctamente",
            product: updatedProduct,
        });
    } catch (error) {
        console.error("Error updating product:", error);
        return res.status(500).json({
            message: "Error al actualizar el producto",
            error: error.message,
        });
    }
};