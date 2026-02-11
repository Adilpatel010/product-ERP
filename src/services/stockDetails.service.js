import { prisma } from "@/lib/prisma";

export const getAllStockDetails = async ({ page, limit, search }) => {
  const skip = (page - 1) * limit;

  const whereCondition = {
    is_deleted: false,
    ...(search && {
      OR: [
        {
          raw_product: {
            product_name: { contains: search },
          },
        },
      ],
    }),
  };

  // Parallel fetching for performance
  const [data, total] = await Promise.all([
    prisma.stockDetails.findMany({
      where: whereCondition,
      orderBy: { created_at: "desc" },
      skip,
      take: limit,
      include: {
        raw_product: {
          select: { id: true, product_name: true, unit: true },
        },
        supplier: {
          select: { id: true, supplier_name: true },
        },
      },
    }),
    prisma.stockDetails.count({ where: whereCondition }),
  ]);

  const userIds = [
    ...new Set(
      data.flatMap((row) => [row.created_by, row.updated_by]).filter(Boolean),
    ),
  ];

  const [auditUsers, auditSuperUsers] = await Promise.all([
    prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, user_name: true, role: true },
    }),
    prisma.superUser.findMany({
      where: { id: { in: userIds } },
      select: { id: true, username: true, role: true },
    }),
  ]);

  const userMap = {};
  auditUsers.forEach((u) => {
    userMap[u.id] = { username: u.user_name, role: u.role };
  });
  auditSuperUsers.forEach((u) => {
    userMap[u.id] = { username: u.username, role: u.role };
  });

  // Format Response
  const response = data.map((row) => ({
    id: row.id,
    action_date: row.action_date,
    action_type: row.action_type,
    before_stock: row.before_stock,
    after_stock: row.after_stock,
    change_qty: row.after_stock - row.before_stock,
    product: row.raw_product,
    supplier: row.supplier,
    created_by: userMap[row.created_by] || null,
    updated_by: userMap[row.updated_by] || null,
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
