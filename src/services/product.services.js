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
  price_before_tax,
  iva_percent = 19,
  icui_percent = 0,
  inc_percent = 0,
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
        price_before_tax,
        iva_percent,
        icui_percent,
        inc_percent,
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

    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        variants: {
          include: {
            options: true,
          },
        },
      },
    });

    if (!existingProduct) {
      throw new Error("El producto no existe");
    }

    // =========================
    // SOLO CAMPOS ENVIADOS
    // =========================

    const updateData = {};

    const allowedFields = [
      "name",
      "barcode",
      "description",
      "imgUrl",
      "price_cost",
      "price_selling",
      "price_before_tax",
      "iva_percent",
      "icui_percent",
      "inc_percent",
      "available",
      "detail",
      "type",
      "unit",
      "manage_stock",
      "is_favorite",
    ];

    allowedFields.forEach((field) => {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    });

    // =========================
    // TRANSACCIÓN
    // =========================

    const updatedProduct = await prisma.$transaction(async (tx) => {

      // Actualizar producto
      const product = await tx.product.update({
        where: {
          id: productId,
        },
        data: updateData,
      });

      // =========================
      // VARIANTES
      // =========================

      /*if (data.variants) {

        // Borrar variantes viejas
        await tx.variantOption.deleteMany({
          where: {
            variant: {
              productId,
            },
          },
        });

        await tx.variant.deleteMany({
          where: {
            productId,
          },
        });

        // Crear nuevas
        for (const variant of data.variants) {

          const createdVariant = await tx.variant.create({
            data: {
              name: variant.name,
              type: variant.type || "select",
              productId,
            },
          });

          if (variant.options?.length) {

            await tx.variantOption.createMany({
              data: variant.options.map((option) => ({
                name: option.name,
                extraPrice: Number(option.extraPrice || 0),
                variantId: createdVariant.id,
              })),
            });

          }
        }
      }*/

      return product;
    });

    return updatedProduct;

  } catch (error) {
    console.error("❌ Error en updateProductService:", error);
    throw error;
  }
};


