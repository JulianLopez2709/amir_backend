import { 
  createVariantService, 
  getVariantsByProductService, 
  updateVariantService, 
  deleteVariantService 
} from "../services/variant.services.js";

/**
 * 🧩 Crear una nueva variante
 */
export const createVariant = async (req, res) => {
  try {
    const { productId, name, type, options = [] } = req.body;

    if (!productId || !name || !type) {
      return res.status(400).json({ message: "productId, name y type son obligatorios" });
    }

    const variant = await createVariantService({ productId, name, type, options });

    return res.status(201).json({
      message: "Variante creada correctamente",
      data: variant,
    });
  } catch (error) {
    console.error("❌ Error al crear variante:", error);
    return res.status(500).json({
      message: "Error interno al crear la variante",
      error: error.message,
    });
  }
};

/**
 * 🧩 Obtener todas las variantes de un producto
 */
export const getVariantsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({ message: "El productId es obligatorio" });
    }

    const variants = await getVariantsByProductService(productId);

    if (!variants || variants.length === 0) {
      return res.status(404).json({ message: "No se encontraron variantes para este producto" });
    }

    return res.status(200).json({
      message: "Variantes obtenidas correctamente",
      data: variants,
    });
  } catch (error) {
    console.error("❌ Error al obtener variantes:", error);
    return res.status(500).json({
      message: "Error interno al obtener las variantes",
      error: error.message,
    });
  }
};

/**
 * 🧩 Actualizar una variante y sus opciones
 */
export const updateVariant = async (req, res) => {
  try {
    const { variantId } = req.params;
    const { name, type, options } = req.body;

    if (!variantId) {
      return res.status(400).json({ message: "El ID de la variante es obligatorio" });
    }

    const updatedVariant = await updateVariantService(variantId, { name, type, options });

    return res.status(200).json({
      message: "Variante actualizada correctamente",
      data: updatedVariant,
    });
  } catch (error) {
    console.error("❌ Error al actualizar la variante:", error);
    return res.status(500).json({
      message: "Error interno al actualizar la variante",
      error: error.message,
    });
  }
};

/**
 * 🧩 Eliminar una variante
 */
export const deleteVariant = async (req, res) => {
  try {
    const { variantId } = req.params;

    if (!variantId) {
      return res.status(400).json({ message: "El ID de la variante es obligatorio" });
    }

    await deleteVariantService(variantId);

    return res.status(200).json({
      message: "Variante eliminada correctamente",
    });
  } catch (error) {
    console.error("❌ Error al eliminar la variante:", error);
    return res.status(500).json({
      message: "Error interno al eliminar la variante",
      error: error.message,
    });
  }
};

