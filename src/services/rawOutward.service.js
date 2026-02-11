import { prisma } from "@/lib/prisma";

/* ================= CREATE RAW OUTWARD ================= */
export const createRawOutward = async ({
  outward_date,
  remark,
  products,
  userId,
}) => {
  /* ===== BASIC VALIDATION ===== */
  if (!products || !Array.isArray(products) || products.length === 0) {
    throw {
      status: 400,
      message: "At least one product is required",
    };
  }

  return prisma.$transaction(async (tx) => {
    const rawOutward = await tx.rawOutward.create({
      data: {
        outward_date: outward_date ? new Date(outward_date) : undefined,
        remark,
        created_by: userId,
        updated_by: userId,
        products: {
          create: products.map((item) => ({
            product_id: item.product_id,
            qty: Number(item.qty),
            unit: item.unit,
            rate: Number(item.rate),
            total: Number(item.qty) * Number(item.rate),
          })),
        },
      },
    });

    for (const item of products) {
      const currentProduct = await tx.rawProduct.findUnique({
        where: { id: item.product_id },
        select: { current_stock: true, product_name: true },
      });

      const beforeStock = currentProduct?.current_stock || 0;
      const outwardQty = Number(item.qty);

      if (beforeStock < outwardQty) {
        throw new Error(
          `Insufficient stock for ${currentProduct.product_name}. Available: ${beforeStock}`,
        );
      }

      const afterStock = beforeStock - outwardQty;

      await tx.rawProduct.update({
        where: { id: item.product_id },
        data: {
          current_stock: {
            decrement: outwardQty,
          },
        },
      });

      await tx.stockDetails.create({
        data: {
          raw_product_id: item.product_id,
          action_date: outward_date ? new Date(outward_date) : new Date(),
          action_type: "raw_outward",
          before_stock: beforeStock,
          after_stock: afterStock,
          created_by: userId,
          updated_by: userId,
        },
      });
    }

    return rawOutward;
  });
};
/* ================= GET ALL RAW OUTWARD ================= */
export const getAllRawOutward = async ({ page, limit, search }) => {
  const skip = (page - 1) * limit;

  const where = {
    is_deleted: false,
    ...(search && {
      products: {
        some: {
          product: {
            product_name: {
              contains: search,
            },
          },
        },
      },
    }),
  };

  /* ================= FETCH RAW OUTWARD ================= */
  const [rows, total] = await Promise.all([
    prisma.rawOutward.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        outward_date: true,
        created_by: true,
        updated_by: true,
        created_at: true,
        updated_at: true,

        _count: {
          select: {
            products: true,
          },
        },
      },
    }),

    prisma.rawOutward.count({ where }),
  ]);
  /* ================= COLLECT USER IDS ================= */
  const userIds = [
    ...new Set(
      rows.flatMap((r) => [r.created_by, r.updated_by]).filter(Boolean),
    ),
  ];

  /* ================= FETCH USERS FROM BOTH TABLES ================= */
  const [users, superUsers] = await Promise.all([
    prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        user_name: true,
        role: true,
      },
    }),

    prisma.superUser.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        username: true,
        role: true,
      },
    }),
  ]);

  /* ================= MERGE USERS ================= */
  const userMap = {};

  users.forEach((u) => {
    userMap[u.id] = {
      username: u.user_name,
      role: u.role,
      type: "user",
    };
  });

  superUsers.forEach((u) => {
    userMap[u.id] = {
      username: u.username,
      role: u.role,
      type: "superuser",
    };
  });

  /* ================= FINAL RESPONSE ================= */
  const data = rows.map((row) => ({
    id: row.id,
    outward_date: row.outward_date,
    total_products: row._count.products,

    created_by: userMap[row.created_by] || null,
    updated_by: userMap[row.updated_by] || null,

    created_at: row.created_at,
    updated_at: row.updated_at,
  }));

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/* ================= GET RAW OUTWARD BY ID ================= */
export const getRawOutwardById = async ({ id }) => {
  /* ================= VALIDATION ================= */
  if (!id) {
    throw {
      status: 400,
      message: "Raw outward id is required",
    };
  }

  /* ================= FETCH RAW OUTWARD ================= */
  const rawOutward = await prisma.rawOutward.findFirst({
    where: {
      id,
      is_deleted: false,
      is_active: true,
    },
    select: {
      id: true,
      outward_date: true,
      remark: true,
      created_by: true,
      updated_by: true,

      products: {
        select: {
          id: true,
          qty: true,
          unit: true,
          rate: true,
          total: true,
          product: {
            select: {
              id: true,
              product_name: true,
            },
          },
        },
      },
    },
  });

  /* ================= NOT FOUND ================= */
  if (!rawOutward) {
    throw {
      status: 404,
      message: "Raw outward not found",
    };
  }

  /* ================= FORMAT RESPONSE ================= */
  return {
    id: rawOutward.id,
    outward_date: rawOutward.outward_date,
    remark: rawOutward.remark,

    products: rawOutward.products.map((p) => ({
      id: p.id,
      product_id: p.product.id,
      product_name: p.product.product_name,
      qty: p.qty,
      unit: p.unit,
      rate: p.rate,
      total: p.total,
    })),

    total_products: rawOutward.products.length,
  };
};

/* ================= DELETE RAW OUTWARD ================= */
export const deleteRawOutward = async ({ id, userId }) => {
  if (!id) {
    throw {
      status: 400,
      message: "Raw outward id is required",
    };
  }

  const rawOutward = await prisma.rawOutward.findUnique({
    where: { id },
  });

  if (!rawOutward || rawOutward.is_deleted) {
    throw {
      status: 404,
      message: "Raw outward not found",
    };
  }

  await prisma.rawOutward.update({
    where: { id },
    data: {
      is_deleted: true,
      is_active: false,
      deleted_by: userId,
      deleted_at: new Date(),
    },
  });

  return id;
};

/* ================= UPDATE RAW OUTWARD ================= */
export const updateRawOutward = async ({
  id,
  outward_date,
  remark,
  products = [],
  userId,
}) => {
  if (!id) throw { status: 400, message: "Raw outward id is required" };
  if (!userId) throw { status: 401, message: "User id is required" };
  if (!Array.isArray(products)) throw { status: 400, message: "Products must be an array" };

  return prisma.$transaction(
    async (tx) => {
      const oldOutward = await tx.rawOutward.findFirst({
        where: { id, is_deleted: false, is_active: true },
        include: { products: true },
      });

      if (!oldOutward) throw { status: 404, message: "Raw outward not found" };

      for (const oldItem of oldOutward.products) {
        const product = await tx.rawProduct.findUnique({
          where: { id: oldItem.product_id },
          select: { current_stock: true }
        });

        const beforeStock = product?.current_stock || 0;
        const afterStock = beforeStock + oldItem.qty;

        await tx.rawProduct.update({
          where: { id: oldItem.product_id },
          data: { current_stock: { increment: oldItem.qty } }
        });

        await tx.stockDetails.create({
          data: {
            raw_product_id: oldItem.product_id,
            action_date: new Date(),
            action_type: "raw_inward", 
            before_stock: beforeStock,
            after_stock: afterStock,
            created_by: userId,
            updated_by: userId,
          }
        });
      }

      await tx.rawOutward.update({
        where: { id },
        data: {
          outward_date: outward_date ? new Date(outward_date) : oldOutward.outward_date,
          remark,
          updated_by: userId,
          updated_at: new Date(),
        },
      });

      await tx.rawOutwardProducts.deleteMany({
        where: { raw_outward_id: id },
      });

      for (const item of products) {
        const qty = Number(item.qty);

        await tx.rawOutwardProducts.create({
          data: {
            raw_outward_id: id,
            product_id: item.product_id,
            qty: qty,
            unit: item.unit,
            rate: Number(item.rate),
            total: qty * Number(item.rate),
          },
        });

        const currentProduct = await tx.rawProduct.findUnique({
          where: { id: item.product_id },
          select: { current_stock: true, product_name: true }
        });

        const beforeStock = currentProduct?.current_stock || 0;

        if (beforeStock < qty) {
          throw new Error(`Insufficient stock for ${currentProduct.product_name}. Available: ${beforeStock}`);
        }

        const afterStock = beforeStock - qty;

        await tx.rawProduct.update({
          where: { id: item.product_id },
          data: { current_stock: { decrement: qty } }
        });

        await tx.stockDetails.create({
          data: {
            raw_product_id: item.product_id,
            action_date: outward_date ? new Date(outward_date) : new Date(),
            action_type: "raw_outward",
            before_stock: beforeStock,
            after_stock: afterStock,
            created_by: userId,
            updated_by: userId,
          }
        });
      }
    },
    { timeout: 20000 }
  );
};
