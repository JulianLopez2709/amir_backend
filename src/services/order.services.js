import prisma from "../config/db.js";

/**
 * Crea una nueva orden con sus productos asociados y las variales seleccionadas
 * Crea una orden luego los producto luego hace el subtotal del producto y extra
 * NOTA: se le disminuye stock si tiene la variable stock_manage en true 
 * y se sigue disminuyendo aunq tenga 0 de stock
 * NOTA: Lo que devueve son los datos de la orden y los snapshop de los producto
 */
export const createOrderService = async ({ companyId, products, detail }) => {
  try {
    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) throw new Error("La empresa no existe.");

    let totalPrice = 0;

    // 1️⃣ Crear la orden principal
    const newOrder = await prisma.order.create({
      data: {
        companyId,
        detail,
        status: "new",
        total_price: 0, // provisional
      },
    });

    // 2️⃣ Crear los productos de la orden y actualizar stock
    for (const item of products) {
      const { productId, quantity, selectedOptions = [] } = item;

      const product = await prisma.product.findFirst({
        where: { id: productId, companyId },
        include: {
          variants: {
            include: { options: true }
          }
        }
      });

      if (!product) {
        throw new Error(`El producto con ID ${productId} no existe o no pertenece a la empresa.`);
      }


      let subtotal = product.price_selling * quantity;

      // 4️⃣ Calcular extra de variantes
      let extraTotal = 0;

      const variantOptions = await prisma.variantOption.findMany({
        where: { id: { in: selectedOptions } }
      });

      for (const opt of variantOptions) {
        extraTotal += opt.extraPrice * quantity;
      }

      subtotal += extraTotal;

      // Sumamos al total general
      totalPrice += subtotal;

      // 5️⃣ Crear snapshot del producto
      const snapshot = {
        id: product.id,
        name: product.name,
        price: product.price_selling,
        optionsSelected: selectedOptions,
        timestamp: new Date().toISOString(),
      };


      // 6️⃣ Crear ProductOrder
      const productOrder = await prisma.productOrder.create({
        data: {
          orderId: newOrder.id,
          productId,
          quantity,
          status: "pending",
          notes: item.notes || "",
          product_snapshot: snapshot,
          subtotal,
        },
      });


      // 7️⃣ Crear opciones seleccionadas
      for (const optionId of selectedOptions) {
        await prisma.productOrderVariantOption.create({
          data: {
            productOrderId: productOrder.id,
            variantOptionId: optionId
          }
        });
      }

      // Actualizar el stock (decrementar cantidad)
      if (product.manage_stock) {//falta condicionar mas 
        const stock = await prisma.stock.findUnique({
          where: { productId }
        });

        if (!stock) {
          throw new Error(`No existe stock registrado para el producto ${productId}`);
        }

        await prisma.stock.update({
          where: { productId },
          data: {
            quantity: stock.quantity -= quantity,
          },
        });
      }
    }

    const updatedOrder = await prisma.order.update({
      where: { id: newOrder.id },
      data: { total_price: totalPrice },
      include: {
        products: {
          include: {
            selectedOptions: true
          }
        }
      }
    });
    return updatedOrder;
  } catch (error) {
    console.error("❌ Error en createOrderService:", error.message);
    throw new Error("No se pudo crear la orden. Verifica los datos enviados.");
  }
};

/**
 * Obtiene el detalle completo de una orden
 * NOTA: Deberia devolver los datos de la orden y los snapshops de los productos,
 * no deberia hacer peticiones con coneccion al producto por que este puede ser actulizado
 */
export const getOrderDetailService = async (orderId) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        products: {
          include: {
            product: {
              select: { name: true, price_selling: true, imgUrl: true },
            },
          },
        },
        company: { select: { name: true } },
      },
    });

    if (!order) {
      throw new Error(`La orden con ID ${orderId} no existe.`);
    }

    return order;
  } catch (error) {
    console.error("❌ Error en getOrderDetailService:", error.message);
    throw new Error("No se pudo obtener el detalle de la orden.");
  }
};

export const getOrdersByCompanyService = async (companyId, filter) => {
  try {
    let {
      startDate,
      endDate,
      status,
      minPrice,
      maxPrice,
      page = 1,
      limit = 10
    } = filter;

    page = parseInt(page);
    limit = parseInt(limit);


    // Parseo seguro de fechas
    const today = new Date();
    const defaultStart = new Date(today);
    defaultStart.setHours(0, 0, 0, 0);
    const defaultEnd = new Date(today);
    defaultEnd.setHours(23, 59, 59, 999);

    let parsedStart = startDate ? new Date(startDate) : defaultStart;
    let parsedEnd = endDate ? new Date(endDate) : defaultEnd;

    // Si las fechas vienen inválidas, usar por defecto
    if (startDate && isNaN(parsedStart)) {
      console.warn("startDate inválida, usando defaultStart:", startDate);
      parsedStart = defaultStart;
    }
    if (endDate && isNaN(parsedEnd)) {
      console.warn("endDate inválida, usando defaultEnd:", endDate);
      parsedEnd = defaultEnd;
    }

    // Asegurar start <= end
    if (parsedStart > parsedEnd) {
      // intercambiar o ajustar end al mismo día de start (decisión de negocio)
      parsedEnd = new Date(parsedStart);
      parsedEnd.setHours(23, 59, 59, 999);
    }

    // Limitar rango a máximo 2 meses desde start
    const maxRange = new Date(parsedStart);
    maxRange.setMonth(maxRange.getMonth() + 2);
    if (parsedEnd > maxRange) {
      parsedEnd = maxRange;
    }

    // Construir where de forma condicional (evitar insertar objetos vacíos inválidos)
    const where = {
      companyId: Number(companyId)
    };

    // Sólo añadir createAt si al menos una fecha es válida
    if (!isNaN(parsedStart) || !isNaN(parsedEnd)) {
      where.createAt = {};
      if (!isNaN(parsedStart)) where.createAt.gte = parsedStart;
      if (!isNaN(parsedEnd)) where.createAt.lte = parsedEnd;
    }

    // Filtro por estado
    if (status) {
      where.status = status;
    }
    console.log("body where ", where)
    const example = await prisma.order.findMany({
      where
    })
    console.log("responde example", example)

    // Filtro por monto
    if (minPrice || maxPrice) {
      where.total_price = {};
      if (minPrice) where.total_price.gte = parseFloat(minPrice);
      if (maxPrice) where.total_price.lte = parseFloat(maxPrice);
    }

    // Query con includes completos
    const orders = await prisma.order.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createAt: "desc" },

      include: {
        products: {
          include: {
            product: true,
            selectedOptions: {
              include: {
                variantOption: true
              }
            }
          }
        }
      }
    });


    const total = await prisma.order.count({ where });

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data: orders
    };
  } catch (error) {
    console.error("❌ Error en getOrdersByCompanyService:", error.message);
    throw new Error("No se pudieron obtener las órdenes de la compañía.");
  }
};

// NOTA: Si el estado es cambiado a cancelado o finalizado los producto de la orden tambien deberia cambiar
// NOTA: si es cancelada se devuelve el stock
export const updateOrderStatusService = async (orderId, status) => {
  try {
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        products: {
          include: {
            product: { select: { name: true } },
          },
        },
      },
    });

    if (status == "confirmed" || status == "canceled") {

    }

    return updatedOrder;
  } catch (error) {
    console.error("❌ Error en updateOrderStatusService:", error.message);
    throw new Error("No se pudo actualizar el estado de la orden.");
  }
};

//NOTA: el subtotal de cada producto en la orden no se actuliza
//NOTA: Si una variante permanece no es necesario eliminarla y volverla a crear.
//NOTA: El snapshop en la optiones de las variantes seleciones deberia mostrar el nombre opcion y vaiante   
//NOTA: La funcion deberia devolver los datos de la orden y los snapshop
export const updateOrderService = async (orderId, data) => {
  try {

    // 1. Validar que la orden exista
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        products: {
          include: {
            selectedOptions: {
              include: {
                variantOption: true
              }
            }
          }
        }
      }
    });

    if (!existingOrder) throw new Error("La orden no existe.");

    // 2. Obtener los productOrder existentes
    const existingItems = await prisma.productOrder.findMany({
      where: { orderId },
      include: {
        selectedOptions: {
          include: { variantOption: true }
        }
      }
    });

    // Mapa: productId → productOrder
    const existingMap = new Map(
      existingItems.map(item => [item.id, item])
    );

    // ============================================================
    // 3. RECORRER LOS PRODUCTOS QUE VIENEN DEL CLIENTE
    // ============================================================

    for (const product of data.products) {
      const { productId, quantity, notes, selectedOptions, id } = product;

      // Obtener el producto original para snapshot
      const original = await prisma.product.findUnique({
        where: { id: productId }
      });

      if (!original) {
        throw new Error(`Producto ${productId} no encontrado.`);
      }

      
      // ============================
      // CREAR SNAPSHOT COMPLETO
      // ============================
      /*const optionsSnapshot = original.variants.flatMap(variant =>
        variant.options
          .filter(opt => selectedOptions?.includes(opt.id))
          .map(opt => ({
            variantId: variant.id,
            variantName: variant.name,
            optionId: opt.id,
            optionName: opt.name,
            extraPrice: opt.extraPrice
          }))
      );*/

      // Crear el snapshot COMPLETO
      const snapshot = {
        id: original.id,
        name: original.name,
        price: original.price_selling,
        timestamp: new Date().toISOString(),
        optionsSelected: selectedOptions ?? []
      };

      // ------------------------------------------------------------
      // 3.1 PRODUCTO YA EXISTE → ACTUALIZAR
      // ------------------------------------------------------------
      if (existingMap.has(id)) {
        const productOrder = existingMap.get(id);

        await prisma.productOrder.update({
          where: { id: productOrder.id },
          data: {
            quantity,
            notes,
            product_snapshot: snapshot
          }
        });

        // Actualizar SELECT OPTIONS
        await prisma.productOrderVariantOption.deleteMany({
          where: { productOrderId: productOrder.id }
        });


        if (selectedOptions?.length > 0) {
          await prisma.productOrderVariantOption.createMany({
            data: selectedOptions.map(opt => ({
              productOrderId: productOrder.id,
              variantOptionId : opt
            }))
          });
        }

        // Quitar del map para identificar eliminados
        existingMap.delete(id);


      } else {
        // ------------------------------------------------------------
        // 3.2 PRODUCTO NUEVO → CREAR
        // ------------------------------------------------------------
        const newProductOrder = await prisma.productOrder.create({
          data: {
            status:"new",
            orderId,
            productId,
            quantity,
            notes,
            product_snapshot: snapshot
          }
        });

        // Insertar SELECT OPTIONS nuevas
        if (selectedOptions?.length > 0) {
          await prisma.productOrderVariantOption.createMany({
            data: selectedOptions.map(optionId => ({
              productOrderId: newProductOrder.id,
              variantOptionId: optionId
            }))
          });
        }
      }
    }

    // ============================================================
    // 4. ELIMINAR PRODUCTOS QUE YA NO ESTÁN EN LA ORDEN
    // ============================================================

    for (const leftover of existingMap.values()) {
      await prisma.productOrderVariantOption.deleteMany({
        where: { productOrderId: leftover.id }
      });

      await prisma.productOrder.delete({
        where: { id: leftover.id }
      });
    }

    // ============================================================
    // 5. VOLVER A TRAER PRODUCTOS PARA CALCULAR EL TOTAL
    // ============================================================

    const finalProducts = await prisma.productOrder.findMany({
      where: { orderId },
      include: {
        selectedOptions: {
          include: { variantOption: true }
        }
      }
    });

    // ============================================================
    // 6. CALCULAR TOTAL USANDO SNAPSHOT
    // ============================================================

    let total = 0;

    for (const item of finalProducts) {
      const snap = item.product_snapshot;

      if (!snap) continue;

      const base = snap.price * item.quantity;

      // Si las variantOptions tienen precio, también súmalas
      const optionsTotal = item.selectedOptions.reduce((acc, opt) => {
        return acc + (opt.variantOption?.extraPrice || 0);
      }, 0) * item.quantity;

      total += base + optionsTotal;

      /*await prisma.productOrder.update({
        where: { id: item.id },
        data: { subtotal }
      });*/
    }

    // ============================================================
    // 7. ACTUALIZAR ORDEN FINAL CON TOTAL
    // ============================================================

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        detail: data.detail,
        companyId: data.companyId,
        total_price: total
      },
      include: {
        products: {
          include: {
            selectedOptions: {
              include: {
                variantOption: true
              }
            }
          }
        }
      }
    });


    return updatedOrder;

  } catch (error) {
    console.error("Error actualizando la orden:", error);
    throw error;
  }
};

