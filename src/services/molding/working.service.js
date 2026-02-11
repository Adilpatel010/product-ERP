import { prisma } from "@/lib/prisma";

/* ================= CREATE WORKING ================= */
export const createWorking = async ({
    machine_id,
    date,
    description,
    items,
    userId,
}) => {
    if (!machine_id) {
        throw { status: 400, message: "Machine is required" };
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
        throw { status: 400, message: "At least one product is required" };
    }

    return prisma.$transaction(async (tx) => {
        /* ================= CREATE WORKING ================= */
        const working = await tx.working.create({
            data: {
                machine_id,
                date: new Date(date),
                description,
                created_by: userId,
                updated_by: userId,
            },
        });

        /* ================= CREATE ITEMS ================= */
        const workingItemsData = items.map((item) => {
            if (!item.product_id) {
                throw { status: 400, message: "Product is required" };
            }

            if (!item.qty_in_bag || item.qty_in_bag <= 0) {
                throw { status: 400, message: "Qty in bag must be greater than 0" };
            }

            const qtyKg = Number(item.qty_in_kg || 0);
            const total = qtyKg;

            return {
                working_id: working.id,
                product_id: item.product_id,
                qty_in_bag: Number(item.qty_in_bag),
                qty_in_kg: qtyKg,
                electricity_unit: item.electricity_unit,
                total: Number(item.qty_in_bag) * Number(item.qty_in_kg),
            };
        });

        await tx.workingItem.createMany({
            data: workingItemsData,
        });

        return working;
    });
};

/* ================= GET ALL WORKING ================= */
export const getAllWorking = async ({ page, limit, search }) => {
    const skip = (page - 1) * limit;

    const where = {
        is_deleted: false,
        ...(search && {
            OR: [
                {
                    machine: {
                        name: {
                            contains: search,
                        },
                    },
                },
                {
                    description: {
                        contains: search,
                    },
                },
            ],
        }),
    };

    /* ================= FETCH WORKING ================= */
    const [rows, total] = await Promise.all([
        prisma.working.findMany({
            where,
            skip,
            take: limit,
            orderBy: { created_at: "desc" },
            select: {
                id: true,
                date: true,
                created_by: true,
                updated_by: true,

                machine: {
                    select: {
                        name: true,
                    },
                },

                _count: {
                    select: {
                        items: true
                    },
                },
            },
        }),

        prisma.working.count({ where }),
    ]);

    const userIds = [
        ...new Set(
            rows.flatMap((r) => [r.created_by, r.updated_by]).filter(Boolean)
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
        machine_name: row.machine?.name || "-",
        date: row.date,
        total_products: row._count.items,

        created_by: userMap[row.created_by] || null,
        updated_by: userMap[row.updated_by] || null,
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

/* ================= GET WORKING BY ID ================= */
export const getWorkingById = async ({ id }) => {

    if (!id) {
        throw {
            status: 400,
            message: "Working id is required",
        };
    }

    /* ================= FETCH WORKING ================= */
    const working = await prisma.working.findFirst({
        where: {
            id,
            is_deleted: false,
        },
        select: {
            id: true,
            date: true,
            description: true,
            created_by: true,
            updated_by: true,

            machine: {
                select: {
                    id: true,
                    name: true,
                },
            },

            items: {
                select: {
                    id: true,
                    qty_in_bag: true,
                    qty_in_kg: true,
                    electricity_unit: true,
                    total: true,
                    product: {
                        select: {
                            id: true,
                            product_name: true,
                            color: true,
                        },
                    },
                },
            },
        },
    });

    /* ================= NOT FOUND ================= */
    if (!working) {
        throw {
            status: 404,
            message: "Working not found",
        };
    }

    /* ================= FORMAT RESPONSE ================= */
    return {
        id: working.id,
        date: working.date,
        description: working.description,

        machine: {
            id: working.machine.id,
            name: working.machine.name,
        },

        products: working.items.map((i) => ({
            id: i.id,
            product_id: i.product.id,
            product_name: i.product.product_name,
            color: i.product.color ? i.product.color : "All Color",
            qty_in_bag: i.qty_in_bag,
            qty_in_kg: i.qty_in_kg,
            electricity_unit: i.electricity_unit,
            total: i.total,
        })),

        total_products: working.items.length,
    };
};

/* ================= DELETE WORKING ================= */
export const deleteWorking = async ({ id, userId }) => {
    if (!id) {
        throw {
            status: 400,
            message: "Working id is required",
        };
    }

    /* ===== CHECK EXISTS ===== */
    const working = await prisma.working.findFirst({
        where: {
            id,
            is_deleted: false,
        },
    });

    if (!working) {
        throw {
            status: 404,
            message: "Working not found",
        };
    }

    /* ===== TRANSACTION ===== */
    await prisma.$transaction([
        prisma.working.update({
            where: { id },
            data: {
                is_deleted: true,
                deleted_by: userId,
                deleted_at: new Date(),
            },
        }),
    ]);

    return { success: true };
};

// ================= UPDATE WORKING =================
export const updateWorking = async ({
    id,
    machine_id,
    date,
    description,
    items = [],
    userId,
}) => {
    if (!id) throw { status: 400, message: "Working id is required" };
    if (!userId) throw { status: 401, message: "User id is required" };
    if (!Array.isArray(items)) throw { status: 400, message: "Products must be an array" };

    return prisma.$transaction(async (tx) => {

        /* ===== UPDATE MASTER ===== */
        await tx.working.update({
            where: { id },
            data: {
                machine_id,
                date: date ? new Date(date) : working.date,
                description,
                updated_by: userId,
                updated_at: new Date(),
            },
        });

        await tx.workingItem.deleteMany({
            where: { working_id: id },
        });

        const workingItemsData = items.map((item) => {
            if (!item.product_id) {
                throw { status: 400, message: "Product is required" };
            }

            if (!item.qty_in_bag || item.qty_in_bag <= 0) {
                throw { status: 400, message: "Qty in bag must be greater than 0" };
            }

            const qtyKg = Number(item.qty_in_kg || 0);
            const total = qtyKg;

            return {
                working_id: id,
                product_id: item.product_id,
                qty_in_bag: Number(item.qty_in_bag),
                qty_in_kg: qtyKg,
                electricity_unit: item.electricity_unit || 0,
                total: Number(item.qty_in_bag) * Number(item.qty_in_kg),
            };
        });

        await tx.workingItem.createMany({
            data: workingItemsData,
        });

    }, { timeout: 15000 });
};






