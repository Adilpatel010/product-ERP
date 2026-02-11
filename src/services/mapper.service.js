import { prisma } from "@/lib/prisma";

// ================= CREATE MAPPER =================
export const createMapper = async ({ userId, mapper }) => {

  const created = [];

  for (const uid of mapper.user_ids) {

    // duplicate check PER USER
    const exists = await prisma.mapper.findFirst({
      where: {
        product_id: mapper.product_id,
        user_id: uid,
        is_deleted: false,
      },
    });

    if (exists) {
      const error = new Error(
        "Mapper already exists for selected product and user"
      );
      error.status = 400;
      throw error;
    }

    const data = await prisma.mapper.create({
      data: {
        product_id: mapper.product_id,
        user_id: uid,
        rate_per_gurus: mapper.rate_per_gurus,
        created_by: userId,
        updated_by: userId,
      },
    });

    created.push(data);
  }

  return created;
};

/* ================= GET ALL MAPPERS ================= */
export const getAllMappers = async ({ page, limit, search }) => {

  const skip = (page - 1) * limit;

  const where = {
    is_deleted: false,
    ...(search && {
      OR: [
        {
          product: {
            product_name: {
              contains: search,
            },
          },
        },
        {
          users: {
            user_name: {
              contains: search,
            },
          },
        },
      ],
    }),
  };

  /* ================= FETCH MAPPERS ================= */

  const data = await prisma.mapper.findMany({
    where,
    skip,
    take: limit,
    orderBy: { created_at: "desc" },

    include: {
      product: {
        select: {
          product_name: true,
        },
      },
      users: {
        select: {
          user_name: true,
        },
      },
    },
  });

  const total = await prisma.mapper.count({ where });

  /* ================= USER ID COLLECT ================= */

  const userIds = [
    ...new Set(
      data
        .flatMap(row => [row.created_by, row.updated_by])
        .filter(Boolean)
    ),
  ];

  /* ================= FETCH USERS ================= */

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

  /* ================= CREATE USER MAP ================= */

  const userMap = {};

  users.forEach(u => {
    userMap[u.id] = {
      username: u.user_name,
      role: u.role,
      type: "user",
    };
  });

  superUsers.forEach(u => {
    userMap[u.id] = {
      username: u.username,
      role: u.role,
      type: "superuser",
    };
  });

  /* ================= FINAL RESPONSE ================= */

  const response = data.map(item => ({
    id: item.id,

    product_id: item.product_id,
    product_name: item.product?.product_name,

    user_id: item.user_id,
    user_name: item.users?.user_name,

    rate_per_gurus: item.rate_per_gurus,

    created_by: userMap[item.created_by] || null,
    updated_by: userMap[item.updated_by] || null,

    created_at: item.created_at,
    updated_at: item.updated_at,
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

// ================= GET MAPPER BY ID =================
export const getMapperById = async (id) => {

  if (!id) {
    throw new Error("Mapper id is required");
  }

  const mapper = await prisma.mapper.findFirst({
    where: {
      id,
      is_deleted: false,
    },
    include: {
      product: {
        select: {
          id: true,
          product_name: true,
          color: true,
        },
      },
      users: {
        select: {
          id: true,
          user_name: true,
        },
      },
    },
  });

  if (!mapper) {
    throw new Error("Mapper not found");
  }

  // format response
  return {
    id: mapper.id,

    product_id: mapper.product_id,
    product_name: mapper.product?.product_name,
    color: mapper.product?.color,
    user_id: mapper.user_id,
    user_name: mapper.users?.user_name,

    rate_per_gurus: mapper.rate_per_gurus,

    created_at: mapper.created_at,
  };
};

/* ================= UPDATE MAPPER ================= */
export const updateMapper = async ({ id, userId, body }) => {

  if (!id) throw new Error("Mapper id is required");

  const mapper = await prisma.mapper.findFirst({
    where: {
      id,
      is_deleted: false,
    },
  });

  if (!mapper) {
    throw new Error("Mapper not found");
  }

  // optional duplicate check
  if (body.product_id && body.user_id) {
    const exists = await prisma.mapper.findFirst({
      where: {
        product_id: body.product_id,
        user_id: body.user_id,
        is_deleted: false,
        NOT: { id },
      },
    });

    if (exists) {
      throw new Error("Mapper already exists for this user and product");
    }
  }

  return await prisma.mapper.update({
    where: { id },
    data: {
      product_id: body.product_id,
      user_id: body.user_id,
      rate_per_gurus: body.rate_per_gurus,
      updated_by: userId,
    },
  });
};

/* ================= DELETE ================= */
export const deleteMapper = async ({ id, userId }) => {

  if (!id) throw new Error("Mapper id is required");

  const mapper = await prisma.mapper.findFirst({
    where: {
      id,
      is_deleted: false,
    },
  });

  if (!mapper) {
    throw new Error("Mapper not found");
  }

  return await prisma.mapper.update({
    where: { id },
    data: {
      is_deleted: true,
      deleted_at: new Date(),
      deleted_by: userId,
      updated_by: userId,
    },
  });
};

export const getMapperRateByProductAndUser = async ({
  product_id,
  user_id,
}) => {
  if (!product_id || !user_id) {
    throw new Error("product_id and user_id are required");
  }

  const mapper = await prisma.mapper.findFirst({
    where: {
      product_id,
      user_id,
      is_deleted: false,
    },
    select: {
      id: true,
      rate_per_gurus: true,
      product: {
        select: {
          product_name: true,
          color: true,
        },
      },
    },
  });

  if (!mapper) {
    return {
      rate_per_gurus: 0,
      message: "Rate not set for this user",
    };
  }

  return {
    mapper_id: mapper.id,
    product_id,
    user_id,
    rate_per_gurus: mapper.rate_per_gurus,
    product_name: mapper.product?.product_name,
  };
};
