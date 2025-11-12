import prisma from "../config/db.js";

/**
 * 🔹 Crea un nuevo producto con soporte para variantes y stock opcional.
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
  unit = "unidad",
  variants = [],
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
          connect: { id: companyId },
        },
      },
    });

    // 🧩 2. Crear registro de stock solo si hay cantidad
    if (stock && stock > 0) {
      await prisma.stock.create({
        data: {
          productId: newProduct.id,
          quantity: stock,
          type: "Inicial",
          reference: "Registro inicial de inventario",
        },
      });
    }

    // 🧩 3. Crear variantes y sus opciones
    if (Array.isArray(variants) && variants.length > 0) {
      for (const variant of variants) {
        const newVariant = await prisma.variant.create({
          data: {
            name: variant.name,
            type: variant.type || "selección",
            productId: newProduct.id,
          },
        });

        // Crear opciones si existen
        if (Array.isArray(variant.options) && variant.options.length > 0) {
          const optionsData = variant.options.map((option) => ({
            name: option.name,
            extraPrice: option.extraPrice || 0,
            variantId: newVariant.id,
          }));

          await prisma.variantOption.createMany({
            data: optionsData,
          });
        }
      }
    }

    return newProduct;
  } catch (error) {
    console.error("❌ Error al crear producto:", error.message);
    throw new Error("No se pudo crear el producto. Verifica los datos enviados.");
  }
};

/**
 * 🔹 Obtiene todos los productos de una compañía (sin incluir información de la compañía).
 */
export const getProductsByCompanyService = async (companyId) => {
  try {
    const products = await prisma.product.findMany({
      where: { companyId },
      include: {
        stock_records: true,
        variants: {
          include: {
            options: true,
          },
        },
      },
      orderBy: { createAt: "desc" },
    });

    return products;
  } catch (error) {
    console.error("❌ Error al obtener productos:", error.message);
    throw new Error("No se pudieron obtener los productos.");
  }
};

export const updateProductService = async (productId, data) => {
    try {
        // Verificar si el producto existe
        const existingProduct = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (!existingProduct) {
            throw new Error("El producto no existe");
        }

        // Actualizar producto con los datos recibidos
        const updatedProduct = await prisma.product.update({
            where: { id: productId },
            data: {
                name: data.name || existingProduct.name,
                barcode: data.barcode ?? existingProduct.barcode,
                description: data.description ?? existingProduct.description,
                imgUrl: data.imgUrl ?? existingProduct.imgUrl,
                price_cost: data.price_cost ?? existingProduct.price_cost,
                price_selling: data.price_selling ?? existingProduct.price_selling,
                available: data.available ?? existingProduct.available,
                detail: data.detail ?? existingProduct.detail,
                type: data.type ?? existingProduct.type,
                unit: data.unit ?? existingProduct.unit,
            },
        });

        return updatedProduct;
    } catch (error) {
        console.error("❌ Error en updateProductService:", error);
        throw new Error("No se pudo actualizar el producto");
    }
};


