import { prisma } from "@/lib/prisma";

/* ================= CREATE PACKING USER ================= */
export const createPackingUser = async ({ user_name, userId }) => {
    if (!user_name || !user_name.trim()) {
        throw {
            status: 400,
            message: "User name is required",
        };
    }

    const name = user_name.trim().toLowerCase();

    const existing = await prisma.packingUser.findFirst({
        where: {
            user_name: name,
            created_by: userId,
            is_deleted: false,
        },
    });

    if (existing) {
        throw {
            status: 409,
            message: "Packing user already exists",
        };
    }

    return await prisma.packingUser.create({
        data: {
            user_name: name,
            created_by: userId,
            updated_by: userId,
        },
    });
};

/* ================= GET ALL PACKING USERS ================= */
export const getAllPackingUsers = async ({
    page = 1,
    limit = 10,
    search = "",
    userId,
    userRole
}) => {
    const skip = (page - 1) * limit;
    /* ================= WHERE CONDITION ================= */
    const whereCondition = {
        is_deleted: false,
        ...(userRole !== "superAdmin" && {
            created_by: userId,
        }),

        ...(search && {
            user_name: {
                contains: search,
            },
        }),
    };

    /* ================= FETCH USERS ================= */
    const [packingUsers, total] = await Promise.all([
        prisma.packingUser.findMany({
            where: whereCondition,
            skip,
            take: limit,
            orderBy: { created_at: "desc" },
        }),
        prisma.packingUser.count({
            where: whereCondition,
        }),
    ]);

    /* ================= USER IDS MAP ================= */
    const userIds = [
        ...new Set(
            packingUsers
                .flatMap(u => [u.created_by, u.updated_by])
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
    const response = packingUsers.map(row => ({
        id: row.id,
        user_name: row.user_name,

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

/* ================= GET PACKING USER BY ID ================= */
export const getPackingUserById = async ({ id, userId, userRole }) => {

    if (!id) {
        throw {
            status: 400,
            message: "Packing user id is required",
        };
    }

    const packingUser = await prisma.packingUser.findFirst({
        where: {
            id,
            is_deleted: false,
            ...(userRole !== "superAdmin" && {
                created_by: userId,
            }),
        },
    });

    if (!packingUser) {
        throw {
            status: 404,
            message: "Packing user not found",
        };
    }

    /* ================= USER MAP ================= */
    const userIds = [
        packingUser.created_by,
        packingUser.updated_by,
    ].filter(Boolean);

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

    return {
        id: packingUser.id,
        user_name: packingUser.user_name,

        created_by: userMap[packingUser.created_by] || null,
        updated_by: userMap[packingUser.updated_by] || null,

        created_at: packingUser.created_at,
        updated_at: packingUser.updated_at,
    };
};

/* ================= DELETE PACKING USER ================= */
export const deletePackingUser = async ({ id, userId, userRole }) => {

    if (!id) {
        throw {
            status: 400,
            message: "Packing user id is required",
        };
    }
    const whereCondition =
        userRole === "superAdmin"
            ? { id, is_deleted: false }
            : { id, is_deleted: false, created_by: userId };

    const packingUser = await prisma.packingUser.findFirst({
        where: whereCondition,
    });

    if (!packingUser) {
        throw {
            status: 404,
            message: "Packing user not found",
        };
    }

    await prisma.packingUser.update({
        where: { id },
        data: {
            is_deleted: true,
            deleted_at: new Date(),
            deleted_by: userId,
            updated_by: userId,
        },
    });

    return true;
};

/* ================= UPDATE PACKING USER ================= */
export const updatePackingUser = async ({
    id,
    user_name,
    userId,
    userRole,
}) => {

    if (!id) {
        throw {
            status: 400,
            message: "Packing user id is required",
        };
    }

    if (!user_name || !user_name.trim()) {
        throw {
            status: 400,
            message: "User name is required",
        };
    }

    const name = user_name.trim().toLowerCase();

    /* ===== CHECK CURRENT USER ===== */

    const whereCondition =
        userRole === "superAdmin"
            ? { id, is_deleted: false }
            : { id, is_deleted: false, created_by: userId };

    const packingUser = await prisma.packingUser.findFirst({
        where: whereCondition,
    });

    if (!packingUser) {
        throw {
            status: 404,
            message: "Packing user not found",
        };
    }


    const existingActive = await prisma.packingUser.findFirst({
        where: {
            user_name: name,
            is_deleted: false,
            NOT: { id },
        },
    });

    if (existingActive) {
        throw {
            status: 409,
            message: "Packing user already exists",
        };
    }

    /* ===== CHECK DELETED RECORD ===== */
    const deletedUser = await prisma.packingUser.findFirst({
        where: {
            user_name: name,
            is_deleted: true,
        },
    });


    if (deletedUser) {
        // delete current record
        await prisma.packingUser.update({
            where: { id },
            data: {
                is_deleted: true,
                updated_by: userId,
            },
        });

        // restore old one
        return await prisma.packingUser.update({
            where: { id: deletedUser.id },
            data: {
                is_deleted: false,
                updated_by: userId,
            },
        });
    }

    /* ===== NORMAL UPDATE ===== */
    return await prisma.packingUser.update({
        where: { id },
        data: {
            user_name: name,
            updated_by: userId,
        },
    });
};

/* ================= SEARCH PACKING USER ================= */
export const searchPackingUser = async (search = "") => {

    const keyword = search.trim().toLowerCase();

    return prisma.packingUser.findMany({
        where: {
            is_deleted: false,

            ...(keyword && {
                user_name: {
                    contains: keyword,
                },
            }),
        },
        select: {
            id: true,
            user_name: true,
        },
        orderBy: {
            user_name: "asc",
        },
    });
};
