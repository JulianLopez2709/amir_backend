import prisma from "../config/db.js";

/**
 * 🧩 Crear una nueva variante con sus opciones (colores, tallas, etc.)
 */
export const createVariantService = async ({ productId, name, type = "select", options = [] }) => {
  try {
    // ✅ Verificar que el producto exista
    const productExists = await prisma.product.findUnique({ where: { id: productId } });
    if (!productExists) throw new Error("El producto asociado no existe.");

    // ✅ Crear variante y sus opciones
    const variant = await prisma.variant.create({
      data: {
        productId,
        name,
        type,
        options: {
          create: options.map(opt => ({
            name: opt.name,
            extraPrice: opt.extraPrice || 0
          })),
        },
      },
      include: { options: true },
    });

    return variant;
  } catch (error) {
    console.error("❌ Error al crear la variante:", error.message);
    throw new Error("No se pudo crear la variante. Verifica los datos enviados.");
  }
};

/**
 * 🧩 Obtener todas las variantes de un producto
 */
export const getVariantsByProductService = async (productId) => {
  try {
    const variants = await prisma.variant.findMany({
      where: { productId },
      include: { options: true },
      orderBy: { id: "asc" },
    });

    return variants;
  } catch (error) {
    console.error("❌ Error al obtener variantes:", error.message);
    throw new Error("No se pudieron obtener las variantes del producto.");
  }
};

/**
 * 🧩 Actualizar una variante y sus opciones
 */
export const updateVariantService = async (variantId, { name, type, options = [] }) => {
  try {
    // ✅ Verificar que la variante exista
    const existingVariant = await prisma.variant.findUnique({ where: { id: parseInt(variantId) } });
    if (!existingVariant) throw new Error("La variante no existe.");

    // ✅ Actualizar la variante principal
    await prisma.variant.update({
      where: { id: parseInt(variantId) },
      data: { name, type },
    });

    // ✅ Actualizar o crear opciones
    for (const opt of options) {
      if (opt.id) {
        await prisma.variantOption.update({
          where: { id: opt.id },
          data: {
            name: opt.name,
            extraPrice: opt.extraPrice || 0,
          },
        });
      } else {
        await prisma.variantOption.create({
          data: {
            name: opt.name,
            extraPrice: opt.extraPrice || 0,
            variantId: parseInt(variantId),
          },
        });
      }
    }

    // ✅ Retornar la variante actualizada con todas sus opciones
    return await prisma.variant.findUnique({
      where: { id: parseInt(variantId) },
      include: { options: true },
    });
  } catch (error) {
    console.error("❌ Error en updateVariantService:", error.message);
    throw new Error("No se pudo actualizar la variante. Verifica los datos enviados.");
  }
};

/**
 * 🧩 Eliminar una variante y sus opciones asociadas
 */
export const deleteVariantService = async (variantId) => {
  try {
    const id = parseInt(variantId);

    // ✅ Eliminar primero las opciones
    await prisma.variantOption.deleteMany({ where: { variantId: id } });

    // ✅ Luego eliminar la variante
    await prisma.variant.delete({ where: { id } });

    return { success: true, message: "Variante eliminada correctamente." };
  } catch (error) {
    console.error("❌ Error en deleteVariantService:", error.message);
    throw new Error("No se pudo eliminar la variante. Verifica los datos enviados.");
  }
};



