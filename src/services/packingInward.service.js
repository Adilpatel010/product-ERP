import { prisma } from "@/lib/prisma";
import { PackingProdStatus } from "@prisma/client";

// ================= GET ALL PACKING INWARD =================
export const getAllPackingInward = async ({ page, limit, search, userId, userRole }) => {
    const skip = (page - 1) * limit;
    const whereCondition = {
        is_deleted: false,
        ...(userRole !== "superAdmin" && {
            created_by: userId,
        }),
        ...(search && {
            OR: [
                {
                    product: {
                        product_name: { contains: search },
                    },
                },
                {
                    packing_users: {
                        user_name: { contains: search },
                    },
                }
            ],
        }),
    };

    const [data, total] = await Promise.all([
        prisma.packingInward.findMany({
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
                        exp_gurus: true,
                    },
                },
            },
        }),
        prisma.packingInward.count({
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
    users.forEach(u => {
        userMap[u.id] = { username: u.user_name, role: u.role };
    });
    superUsers.forEach(u => {
        userMap[u.id] = { username: u.username, role: u.role };
    });

    const response = data.map(row => ({
        id: row.id,
        inward_date: row.packing_inward_date,
        product: row.product,
        amount: row.amount,
        rate: row.rate,
        fitter: row.packing_users,
        exp_gurus: row.packingOutward?.exp_gurus ?? 0,
        receive_gurus: row.receive_gurus,

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

// ================= CREATE PACKING INWARD =================
// export const createPackingInward = async ({ body, userId, userRole }) => {
//     return await prisma.$transaction(async (tx) => {

//         // ---------------- FIND OUTWARD RECORD ----------------
//         const packing = await tx.packingOutward.findFirst({
//             where: {
//                 product_id: body.product_id,
//                 fitter_id: body.fitter_id,
//                 is_deleted: false,
//             },
//             orderBy: {
//                 packing_outward_date: "desc",
//             },
//         });
//         console.log(packing)
//         if (!packing) {
//             throw {
//                 status: 404,
//                 message: "Outward record not found for inward",
//             };
//         }

//         const receiveGurus = Number(body.receive_gurus || 0);
//         const amount = Number(body.amount || 0);
//         const rate = Number(body.rate || packing.rate);

//         if (receiveGurus <= 0) {
//             throw {
//                 status: 400,
//                 message: "Receive gurus must be greater than zero",
//             };
//         }

//         if (amount <= 0) {
//             throw {
//                 status: 400,
//                 message: "Invalid amount received",
//             };
//         }

//         // ---------------- CREATE PACKING INWARD ----------------
//         const inward = await tx.packingInward.create({
//             data: {

//                 packing_outward_id: packing.id,
//                 product_id: packing.product_id,
//                 fitter_id: packing.fitter_id,

//                 packing_inward_date: body.packing_inward_date
//                     ? new Date(body.packing_inward_date)
//                     : new Date(),

//                 receive_gurus: receiveGurus,
//                 amount: amount,
//                 rate: rate,
//                 remark: body.remark || null,

//                 created_by: userId,
//                 updated_by: userId,
//             },
//         });
//         console.log(inward)
//         // ---------------- CREATE TRANSACTION ENTRY ----------------
//         await tx.transaction.create({
//             data: {
//                 user_id: userRole === "superAdmin" ? null : userId,
//                 packing_inward_id: inward.id,
//                 transaction_date: inward.packing_inward_date,
//                 transaction_type: "credit",
//                 amount: amount,
//                 created_by: userId,
//                 updated_by: userId,
//             },
//         });

//         return inward;
//     });
// };

export const createPackingInward = async ({ body, userId, userRole }) => {
    return await prisma.$transaction(async (tx) => {

        // ---------------- FIND OUTWARD ----------------
        const packing = await tx.packingOutward.findFirst({
            where: {
                product_id: body.product_id,
                fitter_id: body.fitter_id,
                is_deleted: false,
            },
            orderBy: {
                packing_outward_date: "desc",
            },
        });

        if (!packing) {
            throw {
                status: 404,
                message: "Outward record not found for inward",
            };
        }

        const receiveGurus = Number(body.receive_gurus || 0);
        const amount = Number(body.amount || 0);
        const rate = Number(body.rate || 0);

        if (receiveGurus <= 0) {
            throw {
                status: 400,
                message: "Receive Gross must be greater than zero",
            };
        }

        if (amount <= 0) {
            throw {
                status: 400,
                message: "Invalid amount received",
            };
        }

        // ---------------- CREATE PACKING INWARD ----------------
        const inward = await tx.packingInward.create({
            data: {
                packing_outward_id: packing.id,
                product_id: packing.product_id,
                fitter_id: packing.fitter_id,

                packing_inward_date: body.packing_inward_date
                    ? new Date(body.packing_inward_date)
                    : new Date(),

                receive_gurus: receiveGurus,
                amount,
                rate,
                remark: body.remark || null,

                created_by: userId,
                updated_by: userId,
            },
        });

        // ---------------- CREATE TRANSACTION ----------------
        await tx.transaction.create({
            data: {
                user_id: userRole === "superAdmin" ? null : userId,
                packing_inward_id: inward.id,
                transaction_date: inward.packing_inward_date,
                transaction_type: "credit", amount: amount,
                created_by: userId, updated_by: userId,
            },
        });

        // ---------------- UPDATE EXPECTATION ----------------
        const expectation = await tx.expectation.findFirst({
            where: {
                packing_outward_id: packing.id,
                is_deleted: false,
            },
        });

        if (!expectation) {
            throw {
                status: 404,
                message: "Expectation record not found",
            };
        }

        const newDeliveredQty =
            Number(expectation.delivered_qty || 0) + receiveGurus;

        const newPendingQty =
            Number(expectation.exp_gurus || 0) - newDeliveredQty;

        if (newPendingQty < 0) {
            throw {
                status: 400,
                message: "Received gross exceed expected gross",
            };
        }

        await tx.expectation.update({
            where: { id: expectation.id },
            data: {
                delivered_qty: newDeliveredQty,
                pending_qty: newPendingQty,
                updated_by: userId,
            },
        });

        return inward;
    });
};

// export const updatePackingInwardData = async ({ body, userId, userRole }) => {
//     return await prisma.$transaction(async (tx) => {

//         // ---------------- FIND PACKING INWARD ----------------
//         const inward = await tx.packingInward.findFirst({
//             where: {
//                 id: body.packing_inward_id,
//                 is_deleted: false,
//             },
//         });

//         if (!inward) {
//             throw {
//                 status: 404,
//                 message: "Packing inward record not found",
//             };
//         }

//         const receiveGurus = Number(body.receive_gurus || inward.receive_gurus || 0);
//         const amount = Number(body.amount || inward.amount || 0);
//         const rate = Number(body.rate || inward.rate || 0);

//         if (receiveGurus <= 0) {
//             throw {
//                 status: 400,
//                 message: "Receive gurus must be greater than 0",
//             };
//         }

//         if (amount <= 0) {
//             throw {
//                 status: 400,
//                 message: "Invalid amount",
//             };
//         }

//         // ---------------- UPDATE PACKING INWARD ----------------
//         const updatedInward = await tx.packingInward.update({
//             where: {
//                 id: inward.id,
//             },
//             data: {
//                 packing_inward_date: body.packing_inward_date
//                     ? new Date(body.packing_inward_date)
//                     : inward.packing_inward_date,

//                 receive_gurus: receiveGurus,
//                 amount: amount,
//                 rate: rate,
//                 remark: body.remark || inward.remark,

//                 updated_by: userId,
//             },
//         });

//         // ---------------- UPDATE TRANSACTION ----------------
//         await tx.transaction.updateMany({
//             where: {
//                 packing_inward_id: inward.id,
//                 transaction_type: "credit",
//                 is_deleted: false,
//             },
//             data: {
//                 user_id: userRole === "superAdmin" ? null : userId,
//                 amount: amount,
//                 transaction_date: body.packing_inward_date
//                     ? new Date(body.packing_inward_date)
//                     : updatedInward.packing_inward_date,
//                 updated_by: userId,
//             },
//         });

//         return updatedInward;
//     });
// };

// ================= UPDATE PACKING INWARD =================


export const updatePackingInwardData = async ({ body, userId, userRole }) => {
    return await prisma.$transaction(async (tx) => {

        // ---------------- FIND PACKING INWARD ----------------
        const inward = await tx.packingInward.findFirst({
            where: {
                id: body.packing_inward_id,
                is_deleted: false,
            },
        });

        if (!inward) {
            throw {
                status: 404,
                message: "Packing inward record not found",
            };
        }

        const oldReceive = Number(inward.receive_gurus || 0);
        const newReceive = Number(body.receive_gurus ?? inward.receive_gurus ?? 0);

        const amount = Number(body.amount ?? inward.amount ?? 0);
        const rate = Number(body.rate ?? inward.rate ?? 0);

        if (newReceive <= 0) {
            throw {
                status: 400,
                message: "Receive gross must be greater than 0",
            };
        }

        if (amount <= 0) {
            throw {
                status: 400,
                message: "Invalid amount",
            };
        }

        // ---------------- FIND EXPECTATION ----------------
        const expectation = await tx.expectation.findFirst({
            where: {
                packing_outward_id: inward.packing_outward_id,
                is_deleted: false,
            },
        });

        if (!expectation) {
            throw {
                status: 404,
                message: "Expectation record not found",
            };
        }

        // ---------------- CALCULATE DIFFERENCE ----------------
        const diff = newReceive - oldReceive;

        const newDeliveredQty =
            Number(expectation.delivered_qty || 0) + diff;

        const newPendingQty =
            Number(expectation.exp_gurus || 0) - newDeliveredQty;

        if (newPendingQty < 0) {
            throw {
                status: 400,
                message:
                    "Updated receive gross exceed expected gross",
            };
        }

        // ---------------- UPDATE PACKING INWARD ----------------
        const updatedInward = await tx.packingInward.update({
            where: {
                id: inward.id,
            },
            data: {
                packing_inward_date: body.packing_inward_date
                    ? new Date(body.packing_inward_date)
                    : inward.packing_inward_date,

                receive_gurus: newReceive,
                amount,
                rate,
                remark: body.remark ?? inward.remark,

                updated_by: userId,
            },
        });

        // ---------------- UPDATE TRANSACTION ----------------
        await tx.transaction.updateMany({
            where: {
                packing_inward_id: inward.id,
                transaction_type: "credit",
                is_deleted: false,
            },
            data: {
                user_id: userRole === "superAdmin" ? null : userId,
                amount,
                transaction_date: body.packing_inward_date
                    ? new Date(body.packing_inward_date)
                    : updatedInward.packing_inward_date,
                updated_by: userId,
            },
        });

        // ---------------- UPDATE EXPECTATION ----------------
        await tx.expectation.update({
            where: { id: expectation.id },
            data: {
                delivered_qty: newDeliveredQty,
                pending_qty: newPendingQty,
                updated_by: userId,
            },
        });

        return updatedInward;
    });
};

export const getPackingInwardById = async (id) => {
    if (!id) {
        throw {
            status: 400,
            message: "Packing inward id is required",
        };
    }

    // ---------------- FIND PACKING INWARD ----------------
    const row = await prisma.packingInward.findFirst({
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
            packing_users: {
                select: {
                    id: true,
                    user_name: true,
                },
            },
            packingOutward: {
                select: {
                    id: true,
                    exp_gurus: true,
                    outward_lot_qty: true,
                    packing_outward_date: true,

                    expectations: {
                        select: {
                            exp_gurus: true,
                            delivered_qty: true,
                            pending_qty: true,
                        },
                    },
                },
            },
        },
    });

    if (!row) {
        throw {
            status: 404,
            message: "Packing inward not found",
        };
    }

    // ---------------- LOAD CREATED / UPDATED BY ----------------
    const userIds = [row.created_by, row.updated_by].filter(Boolean);

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

    const exp = row.packingOutward?.expectations?.[0];

    // ---------------- RESPONSE ----------------
    return {
        id: row.id,
        inward_date: row.packing_inward_date,

        product: row.product,
        fitter: row.packing_users,

        outward: {
            id: row.packingOutward?.id,
            exp_gurus: row.packingOutward?.exp_gurus,
            outward_lot_qty: row.packingOutward?.outward_lot_qty,
            outward_date: row.packingOutward?.packing_outward_date,

            expectation: {
                exp_gurus: exp?.exp_gurus || 0,
                delivered_qty: exp?.delivered_qty || 0,
                pending_qty: exp?.pending_qty || 0,
            },
        },

        receive_gurus: row.receive_gurus,
        amount: row.amount,
        rate: row.rate,
        remark: row.remark,

        created_by: userMap[row.created_by] || null,
        updated_by: userMap[row.updated_by] || null,

        created_at: row.created_at,
        updated_at: row.updated_at,
    };
};

export const deletePackingInward = async ({ id, userId }) => {
    return await prisma.$transaction(async (tx) => {

        if (!id) {
            throw {
                status: 400,
                message: "Packing inward id is required",
            };
        }

        const packing = await tx.packingProduct.findFirst({
            where: {
                id,
                is_deleted: false,
            },
        });

        if (!packing) {
            throw {
                status: 404,
                message: "Packing inward not found",
            };
        }

        if (packing.packing_status !== PackingProdStatus.inward) {
            throw {
                status: 400,
                message: "Only inward records can be deleted",
            };
        }

        const deleted = await tx.packingProduct.update({
            where: { id },
            data: {
                is_deleted: true,
                deleted_at: new Date(),
                deleted_by: userId,
            },
        });

        return deleted;
    });
};

// export const getPackingProductByFitterId = async (fitter_id) => {
//     return prisma.packingOutward.findMany({

//         where: {
//             fitter_id,
//             OR: [
//                 { is_deleted: false },
//             ],
//         },

//         select: {
//             id: true,
//             exp_gurus: true,
//             product: {
//                 select: {
//                     id: true,
//                     product_name: true,
//                     color: true,
//                 },
//             },
//         },
//     });
// };

export const getPackingProductByFitterId = async (fitter_id) => {
    if (!fitter_id) {
        throw {
            status: 400,
            message: "fitter_id is required",
        };
    }

    return await prisma.packingOutward.findMany({
        where: {
            fitter_id,
            is_deleted: false,
        },

        orderBy: {
            packing_outward_date: "desc",
        },

        select: {
            id: true, // outward_id

            product: {
                select: {
                    id: true,
                    product_name: true,
                    color: true,
                },
            },

            expectations: {
                select: {
                    exp_gurus: true,
                    delivered_qty: true,
                    pending_qty: true,
                },
            },
        },
    });
};
