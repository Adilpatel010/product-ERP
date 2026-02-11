import { prisma } from "@/lib/prisma";

/* ================= GET RAW PRODUCTS ================= */
export const getRawProducts = async ({ page, limit, search }) => {
  const skip = (page - 1) * limit;

  const whereCondition = {
    is_deleted: false,
    is_active: true,
    ...(search && {
      OR: [
        {
          product_name: {
            contains: search,
          },
        },
        {
          sku: {
            contains: search,
          },
        },
      ],
    }),
  };

  const total = await prisma.rawProduct.count({
    where: whereCondition,
  });

  const data = await prisma.rawProduct.findMany({
    where: whereCondition,
    orderBy: { created_at: "desc" },
    skip,
    take: limit,
  });

  const userIds = [
    ...new Set(
      data.flatMap((r) => [r.created_by, r.updated_by]).filter(Boolean),
    ),
  ];

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
  const response = data.map((row) => ({
    id: row.id,
    product_name: row.product_name,
    unit: row.unit,
    current_stock: row.current_stock,
    sku: row.sku,
    description: row.description || null,
    opening_stock: row.opening_stock,
    rate: row.rate,

    created_by: userMap[row.created_by] || null,
    updated_by: userMap[row.updated_by] || null,

    created_at: row.created_at,
    updated_at: row.updated_at,
  }));

  return {
    response,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/* ================= CREATE RAW PRODUCT ================= */
export const createRawProduct = async ({
  product_name,
  sku,
  unit,
  current_stock,
  description,
  opening_stock,
  rate,
  userId,
}) => {
  if (!product_name || !sku) {
    throw {
      status: 400,
      message: "product_name and sku are required",
    };
  }

  const exists = await prisma.rawProduct.findUnique({
    where: { sku },
  });

  if (exists) {
    throw {
      status: 409,
      message: "SKU already exists",
    };
  }

  const rawProduct = await prisma.rawProduct.create({

    data: {
      product_name,
      sku,
      unit,
      current_stock: Number(current_stock) || 0,
      description: description || null,
      opening_stock: Number(opening_stock) || 0,
      rate: Number(rate) || 0,
      created_by: userId,
      updated_by: userId,
    },
  });
  return rawProduct;
};

/* ================= DELETE RAW PRODUCT  ================= */
export const deleteRawProduct = async ({ id, userId }) => {
  if (!id) {
    throw {
      status: 400,
      message: "Raw product id is required",
    };
  }

  const rawProduct = await prisma.rawProduct.findUnique({
    where: { id },
  });

  if (!rawProduct) {
    throw {
      status: 404,
      message: "Raw product not found",
    };
  }

  await prisma.rawProduct.update({
    where: { id },
    data: {
      is_deleted: true,
      is_active: false,
      deleted_at: new Date(),
      deleted_by: userId,
    },
  });

  return id;
};

/* ================= UPDATE RAW PRODUCT ================= */
export const updateRawProduct = async ({
  id,
  product_name,
  sku,
  unit,
  current_stock,
  description,
  opening_stock,
  rate,
  userId,
}) => {
  if (!id) {
    throw {
      status: 400,
      message: "Raw product id is required",
    };
  }

  const rawProduct = await prisma.rawProduct.findUnique({
    where: { id },
  });

  if (!rawProduct) {
    throw {
      status: 404,
      message: "Raw product not found",
    };
  }

  /* ===== SKU UNIQUENESS CHECK (IGNORE CURRENT) ===== */
  if (sku) {
    const skuExists = await prisma.rawProduct.findFirst({
      where: {
        sku,
        id: { not: id },
      },
    });

    if (skuExists) {
      throw {
        status: 409,
        message: "SKU already exists",
      };
    }
  }

  /* ===== UPDATE RAW PRODUCT ===== */
  const updatedProduct = await prisma.rawProduct.update({
    where: { id },
    data: {
      ...(product_name && { product_name }),
      ...(sku && { sku }),
      ...(unit !== undefined && { unit }),
      current_stock: Number(current_stock),
      ...(description !== undefined && { description }),
      ...(opening_stock !== undefined && {
        opening_stock: Number(opening_stock),
      }),
      ...(rate !== undefined && {
        rate: Number(rate),
      }),
      updated_by: userId,
    },
  });

  return updatedProduct;
};

/* ================= GET RAW PRODUCT BY ID ================= */
export const getRawProductById = async ({ id }) => {
  if (!id) {
    throw {
      status: 400,
      message: "Raw product id is required",
    };
  }

  const rawProduct = await prisma.rawProduct.findFirst({
    where: {
      id,
      is_deleted: false,
      is_active: true,
    },
  });

  if (!rawProduct) {
    throw {
      status: 404,
      message: "Raw product not found",
    };
  }

  return rawProduct;
};

/* ================= SEARCH RAW PRODUCTS ================= */
export const searchRawProduct = async (search) => {
  return prisma.rawProduct.findMany({
    where: {
      is_deleted: false,
      is_active: true,
      ...(search && {
        OR: [
          {
            product_name: {
              contains: search,
            },
          },
        ],
      }),
    },
    select: {
      id: true,
      product_name: true,
      rate: true,
      unit: true,
    },

    orderBy: {
      product_name: "asc",
    },
  });
};
