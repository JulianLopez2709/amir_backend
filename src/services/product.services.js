import prisma from "../config/db.js";
import { emitProductNew } from "../sockets/emitters/product.emit.js";

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

    emitProductNew(companyId, newProduct);

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

        // Si data.detail existe y es objeto, lo mezclamos con el existente
        // Ojo: prisma solo hace replace del JSON, no merge profundo por defecto
        let newDetail = existingProduct.detail;
        if (data.detail) {
            newDetail = data.detail; // Asignamos directamente lo nuevo
        }

        // Preparamos el objeto updateData solo con los campos definidos
        // Esto evita asignar "undefined" o usar lógica compleja con ??
        const updateData = {};
        if (data.name !== undefined) updateData.name = data.name;
        if (data.barcode !== undefined) updateData.barcode = data.barcode;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.imgUrl !== undefined) updateData.imgUrl = data.imgUrl;
        if (data.price_cost !== undefined) updateData.price_cost = data.price_cost;
        if (data.price_selling !== undefined) updateData.price_selling = data.price_selling;
        if (data.available !== undefined) updateData.available = data.available;
        if (data.detail !== undefined) updateData.detail = newDetail;
        if (data.type !== undefined) updateData.type = data.type;
        if (data.unit !== undefined) updateData.unit = data.unit;

        // Actualizar producto
        const updatedProduct = await prisma.product.update({
            where: { id: productId },
            data: updateData,
        });

        return updatedProduct;
    } catch (error) {
        console.error("❌ Error en updateProductService:", error);
        throw error; // Re-lanzar el error original para ver qué pasa
    }
};


