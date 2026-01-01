import { 
  createOrUpdateStockService, 
  getStockByProductService, 
  adjustStockService 
} from "../services/stock.services.js";

/**
 * 🔹 Crear o actualizar stock
 */
export const createOrUpdateStock = async (req, res) => {
  try {
    const { productId, quantity, type, reference } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "El productId es obligatorio" });
    }

    const stock = await createOrUpdateStockService({ productId, quantity, type, reference });
    res.status(201).json({ message: "Stock actualizado correctamente", data: stock });
  } catch (error) {
    res.status(500).json({ message: "Error al crear o actualizar el stock", error: error.message });
  }
};

/**
 * 🔹 Obtener stock por producto
 */
export const getStockByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const stock = await getStockByProductService(productId);
    res.status(200).json(stock);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

/**
 * 🔹 Ajustar stock (incrementar/disminuir)
 */
export const adjustStock = async (req, res) => {
  try {
    const { productId, quantityChange, reference } = req.body;
    if (!productId || typeof quantityChange !== "number") {
      return res.status(400).json({ message: "productId y quantityChange son obligatorios" });
    }

    const updatedStock = await adjustStockService(productId, quantityChange, reference);
    res.status(200).json({ message: "Stock ajustado correctamente", data: updatedStock });
  } catch (error) {
    res.status(500).json({ message: "Error al ajustar el stock", error: error.message });
  }
};

