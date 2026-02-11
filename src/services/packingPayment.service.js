import { prisma } from "@/lib/prisma";

// ================= GET ALL PACKING PAYMENT =================
export const getAllPackingPayment = async ({ page, limit, search, fromDate, toDate }) => {
    const skip = (page - 1) * limit;

    const whereCondition = {
        is_deleted: false,
        ...(search && {
            OR: [
                {
                    users: {
                        user_name: { contains: search },
                    },
                },
            ],
        }),
        ...((fromDate || toDate) && {
            packing_payment_date: {
                ...(fromDate && { gte: new Date(fromDate) }),
                ...(toDate && { lte: new Date(toDate + "T23:59:59") }),
            },
        }),
    };

    // 1. Fetch main data and total count in parallel
    const [data, total] = await Promise.all([
        prisma.packingPayment.findMany({
            where: whereCondition,
            orderBy: { packing_payment_date: "desc" },
            skip,
            take: limit,
            include: {
                users: {
                    select: {
                        id: true,
                        user_name: true,
                    },
                },
            },
        }),
        prisma.packingPayment.count({
            where: whereCondition,
        }),
    ]);

    const userIds = [
        ...new Set(
            data
                .flatMap(row => [row.created_by, row.updated_by])
                .filter(Boolean)
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
    auditUsers.forEach(u => { userMap[u.id] = { username: u.user_name, role: u.role }; });
    auditSuperUsers.forEach(u => { userMap[u.id] = { username: u.username, role: u.role }; });

    const response = data.map(row => ({
        id: row.id,
        payment_date: row.packing_payment_date,
        amount: row.amount,
        description: row.description,
        user: row.users,

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

// ================= CREATE PACKING OUTWARD =================
// export const createPackingPayment = async ({ body, userId }) => {
//     return await prisma.$transaction(async (tx) => {
//         const checkUser = await tx.user.findFirst({
//             where: {
//                 id: body.user_id,
//                 is_deleted: false
//             },
//         });

//         if (!checkUser) {
//             const error = new Error("User not found");
//             error.status = 404;
//             throw error;
//         }

//         const payment = await tx.packingPayment.create({
//             data: {
//                 packing_payment_date: body.date ? new Date(body.date) : new Date(),
//                 user_id: body.user_id,
//                 amount: parseFloat(body.amount),
//                 description: body.description,
//                 created_by: userId,
//                 updated_by: userId,
//             },
//         });

//         return payment;
//     });
// };

// ================= CREATE PACKING PAYMENT =================
export const createPackingPayment = async ({ body, userId }) => {
    return await prisma.$transaction(async (tx) => {

        const checkUser = await tx.user.findFirst({
            where: {
                id: body.user_id,
                is_deleted: false,
            },
        });

        if (!checkUser) {
            const error = new Error("User not found");
            error.status = 404;
            throw error;
        }

        const payment = await tx.packingPayment.create({
            data: {
                packing_payment_date: body.date
                    ? new Date(body.date)
                    : new Date(),

                user_id: body.user_id,
                amount: Number(body.amount),
                description: body.description,

                created_by: userId,
                updated_by: userId,
            },
        });

        await tx.transaction.create({
            data: {
                user_id: body.user_id,
                payment_id: payment.id,

                transaction_date: body.date
                    ? new Date(body.date)
                    : new Date(),

                transaction_type: "debit",
                amount: Number(body.amount),

                created_by: userId,
                updated_by: userId,
            },
        });

        return payment;
    });
};

// ================= UPDATE PACKING PAYMENT =================
// export const updatePackingPayment = async ({ id, body, userId }) => {
//     const existing = await prisma.packingPayment.findFirst({
//         where: { id, is_deleted: false },
//     });

//     if (!existing) {
//         const error = new Error("Payment record not found");
//         error.status = 404;
//         throw error;
//     }

//     if (body.user_id) {
//         const userExists = await prisma.user.findFirst({
//             where: { id: body.user_id, is_deleted: false },
//         });
//         if (!userExists) {
//             const error = new Error("User not found");
//             error.status = 404;
//             throw error;
//         }
//     }

//     return prisma.packingPayment.update({
//         where: { id },
//         data: {
//             ...(body.date && { packing_payment_date: new Date(body.date) }),
//             ...(body.user_id && { user_id: body.user_id }),
//             ...(body.amount !== undefined && { amount: parseFloat(body.amount) }),
//             ...(body.description !== undefined && { description: body.description }),
//             updated_by: userId,
//         },
//     });
// };

// ================= UPDATE PACKING PAYMENT =================
export const updatePackingPayment = async ({ id, body, userId }) => {
    return await prisma.$transaction(async (tx) => {

        // ---------------- CHECK PAYMENT ----------------
        const existingPayment = await tx.packingPayment.findFirst({
            where: {
                id: id,
                is_deleted: false,
            },
        });

        if (!existingPayment) {
            const error = new Error("Payment record not found");
            error.status = 404;
            throw error;
        }

        // ---------------- CHECK USER ----------------
        const checkUser = await tx.user.findFirst({
            where: {
                id: body.user_id || existingPayment.user_id,
                is_deleted: false,
            },
        });

        if (!checkUser) {
            const error = new Error("User not found");
            error.status = 404;
            throw error;
        }

        // ---------------- UPDATE PAYMENT ----------------
        const updatedPayment = await tx.packingPayment.update({
            where: {
                id: id,
            },
            data: {
                packing_payment_date: body.date
                    ? new Date(body.date)
                    : existingPayment.packing_payment_date,

                user_id: body.user_id
                    ? body.user_id
                    : existingPayment.user_id,

                amount: body.amount !== undefined
                    ? Number(body.amount)
                    : existingPayment.amount,

                description: body.description !== undefined
                    ? body.description
                    : existingPayment.description,

                updated_by: userId,
            },
        });

        // ---------------- UPDATE TRANSACTION ----------------
        await tx.transaction.updateMany({
            where: {
                payment_id: id,
                transaction_type: "debit",
            },
            data: {
                user_id: body.user_id
                    ? body.user_id
                    : existingPayment.user_id,

                transaction_date: body.date
                    ? new Date(body.date)
                    : existingPayment.packing_payment_date,

                amount: body.amount !== undefined
                    ? Number(body.amount)
                    : existingPayment.amount,

                updated_by: userId,
            },
        });

        return updatedPayment;
    });
};


// ================= GET PACKING PAYMENT BY ID =================
export const getPackingPaymentById = async ({ id }) => {
    if (!id) {
        const error = new Error("Id is required");
        error.status = 400;
        throw error;
    }

    const row = await prisma.packingPayment.findFirst({
        where: { id, is_deleted: false },
        include: {
            users: {
                select: {
                    id: true,
                    user_name: true,
                },
            },
        },
    });

    if (!row) {
        const error = new Error("Packing payment not found");
        error.status = 404;
        throw error;
    }

    const userIds = [row.created_by, row.updated_by].filter(Boolean);
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
    auditUsers.forEach(u => { userMap[u.id] = { username: u.user_name, role: u.role }; });
    auditSuperUsers.forEach(u => { userMap[u.id] = { username: u.username, role: u.role }; });

    return {
        id: row.id,
        date: row.packing_payment_date,
        amount: row.amount,
        description: row.description,
        user: row.users,
        created_by: userMap[row.created_by] || null,
        updated_by: userMap[row.updated_by] || null,
    };
};

// ================= DELETE PACKING PAYMENT (Soft Delete) =================
export const deletePackingPayment = async ({ id, userId }) => {
    const existing = await prisma.packingPayment.findUnique({
        where: { id },
    });

    if (!existing) {
        const error = new Error("Payment record not found");
        error.status = 404;
        throw error;
    }

    return prisma.packingPayment.update({
        where: { id },
        data: {
            is_deleted: true,
            deleted_by: userId,
            deleted_at: new Date(),
            updated_by: userId,
        },
    });
};

// ================= SEARCH USER =================
export const searchUser = async (search, currentUser) => {
    return prisma.User.findMany({
        where: {
            is_deleted: false,
            ...(search && {
                user_name: {
                    contains: search,
                },
            }),
            ...(currentUser.role !== "superAdmin" && {
                created_by: currentUser.id,
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



