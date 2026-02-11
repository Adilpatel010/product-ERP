import { prisma } from "@/lib/prisma";

export const getAllExpectation = async ({
    page = 1,
    limit = 10,
    search,
    userId,
    userRole,
}) => {
    const skip = (page - 1) * limit;

    const whereCondition = {
        is_deleted: false,

        // Non-superAdmin can see only their created records
        ...(userRole !== "superAdmin" && {
            created_by: userId,
        }),

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
                    packing_users: {
                        user_name: {
                            contains: search,
                        },
                    },
                },
            ],
        }),
    };

    // ================= PARALLEL FETCH =================
    const [data, total] = await Promise.all([
        prisma.expectation.findMany({
            where: whereCondition,
            orderBy: { created_at: "desc" },
            skip,
            take: limit,
            include: {
                product: {
                    select: {
                        id: true,
                        product_name: true,
                        color: true,
                    },
                },
                packing_users: {
                    select: {
                        id: true,
                        user_name: true,
                    },
                },
                packingOutward: {
                    select: {
                        id: true,
                        packing_outward_date: true,
                        outward_lot_qty: true,
                        exp_gurus: true,
                    },
                },
            },
        }),
        prisma.expectation.count({
            where: whereCondition,
        }),
    ]);

    // ================= AUDIT USERS =================
    const userIds = [
        ...new Set(
            data
                .flatMap((row) => [row.created_by, row.updated_by])
                .filter(Boolean),
        ),
    ];

    const [users, superUsers] = await Promise.all([
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
    users.forEach((u) => {
        userMap[u.id] = { username: u.user_name, role: u.role };
    });
    superUsers.forEach((u) => {
        userMap[u.id] = { username: u.username, role: u.role };
    });

    // ================= FORMAT RESPONSE =================
    const response = data.map((row) => ({
        id: row.id,

        packing_outward_date: row.packing_outward_date,
        exp_delivery_date: row.exp_delivery_date,

        product: row.product,
        fitter: row.packing_users,

        exp_gurus: row.exp_gurus,
        delivered_qty: row.delivered_qty,
        pending_qty: row.pending_qty,

        outward: row.packingOutward,

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
