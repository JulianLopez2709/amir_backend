import {
  getStockByProductService,
  updateStockService,
  getStockByCompanyService,
} from "../services/stock.services.js";

/**
 * 🔹 Obtener stock por ID de producto
 */
export const getStockByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const stock = await getStockByProductService(productId);

    if (!stock) {
      return res.status(404).json({ message: "No se encontró stock para este producto" });
    }

    return res.status(200).json(stock);
  } catch (error) {
    console.error("❌ Error al obtener el stock:", error);
    return res.status(500).json({
      message: "Error interno al obtener el stock",
      error: error.message,
    });
  }
};

/**
 * 🔹 Actualizar stock (por venta, devolución o ajuste)
 */
export const updateStock = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity, type = "Ajuste", reference = "Actualización manual" } = req.body;

    const updatedStock = await updateStockService(productId, quantity, type, reference);

    return res.status(200).json(updatedStock);
  } catch (error) {
    console.error("❌ Error al actualizar el stock:", error);
    return res.status(500).json({
      message: "Error interno al actualizar el stock",
      error: error.message,
    });
  }
};

/**
 * 🔹 Obtener stock de todos los productos de una compañía
 */
export const getStockByCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const stock = await getStockByCompanyService(parseInt(companyId));

    if (!stock || stock.length === 0) {
      return res.status(404).json({ message: "No se encontraron registros de stock para esta compañía" });
    }

    return res.status(200).json(stock);
  } catch (error) {
    console.error("❌ Error al obtener stock por compañía:", error);
    return res.status(500).json({
      message: "Error interno al obtener stock por compañía",
      error: error.message,
    });
  }
};
