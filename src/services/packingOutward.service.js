import { prisma } from "@/lib/prisma";

// ================= GET ALL PACKING OUTWARD =================
export const getAllPackingOutward = async ({ page, limit, search, userId, userRole }) => {
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

    // 1. Fetch main data and total count in parallel
    const [data, total] = await Promise.all([
        prisma.packingOutward.findMany({
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
                        user_name: true, // Matches your packingUser schema
                    },
                },
            },
        }),
        prisma.packingOutward.count({
            where: whereCondition,
        }),
    ]);

    // 2. Extract unique IDs for CreatedBy and UpdatedBy
    const userIds = [
        ...new Set(
            data
                .flatMap(row => [row.created_by, row.updated_by])
                .filter(Boolean)
        ),
    ];

    // 3. Fetch details from both User and SuperUser tables
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

    // 4. Create Unified User Map (fixes the 500 error on undefined users)
    const userMap = {};
    users.forEach(u => {
        userMap[u.id] = { username: u.user_name, role: u.role };
    });
    superUsers.forEach(u => {
        userMap[u.id] = { username: u.username, role: u.role };
    });

    // 5. Final Response Mapping
    const response = data.map(row => ({
        id: row.id,
        // Match these keys to what your Frontend table is calling
        outward_date: row.packing_outward_date,
        total_products: row.lot_qty,

        lot_qty: row.lot_qty,
        exp_delivery_date: row.exp_delivery_date,
        exp_qty: row.exp_qty,

        product: row.product,
        fitter: row.packing_users,

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
// export const createPackingOutward = async ({ body, userId }) => {

//     return await prisma.$transaction(async (tx) => {

//         const warnings = [];

//         // ================= PRODUCT =================
//         const product = await tx.product.findFirst({
//             where: {
//                 id: body.product_id,
//                 is_deleted: false,
//             },
//             include: {
//                 productBoms: {
//                     include: {
//                         raw_product: true,
//                     },
//                 },
//             },
//         });

//         if (!product) {
//             throw new Error("Product not found");
//         }

//         const totalGurusInLot = Number(product.total_gurus_lot || 0);

//         if (totalGurusInLot <= 0) {
//             throw new Error("Total gurus in lot not set in product");
//         }

//         // ================= FITTER =================
//         const fitter = await tx.packingUser.findFirst({
//             where: {
//                 id: body.fitter_id,
//                 is_deleted: false,
//             },
//         });

//         if (!fitter) {
//             throw new Error("Fitter not found");
//         }

//         // ================= PACKING OUTWARD =================
//         const packing = await tx.packingOutward.create({
//             data: {
//                 packing_outward_date: body.packing_outward_date
//                     ? new Date(body.packing_outward_date)
//                     : new Date(),

//                 product_id: body.product_id,
//                 fitter_id: body.fitter_id,

//                 outward_lot_qty: Number(body.outward_lot_qty || 0),
//                 exp_delivery_date: new Date(body.exp_delivery_date),
//                 exp_gurus: Number(body.exp_gurus || 0),

//                 created_by: userId,
//                 updated_by: userId,
//             },
//         });

//         // ================= RAW STOCK CONSUMPTION =================
//         for (const bom of product.productBoms) {

//             const rawProduct = bom.raw_product;

//             const qtyPerGuru = Number(bom.qty);
//             const totalConsumption = qtyPerGuru * totalGurusInLot;

//             const beforeStock = Number(rawProduct.current_stock);
//             const afterStock = beforeStock - totalConsumption;

//             if (afterStock < 0) {
//                 warnings.push(
//                     `${rawProduct.product_name} stock negative (${afterStock})`
//                 );
//             }

//             await tx.rawProduct.update({
//                 where: { id: rawProduct.id },
//                 data: {
//                     current_stock: afterStock,
//                 },
//             });

//             await tx.stockDetails.create({
//                 data: {
//                     raw_product_id: rawProduct.id,
//                     action_type: "packing_outward",
//                     action_date: new Date(),

//                     before_stock: beforeStock,
//                     after_stock: afterStock,

//                     created_by: userId,
//                     updated_by: userId,
//                 },
//             });
//         }

//         return {
//             packing,
//             warning: warnings.length ? warnings : null,
//         };

//     }, {
//         maxWait: 10000,
//         timeout: 10000,
//     });
// };

// ================= CREATE PACKING OUTWARD =================
export const createPackingOutward = async ({ body, userId }) => {
    return await prisma.$transaction(async (tx) => {

        const warnings = [];

        // ================= PRODUCT =================
        const product = await tx.product.findFirst({
            where: {
                id: body.product_id,
                is_deleted: false,
            },
            include: {
                productBoms: {
                    include: {
                        raw_product: true,
                    },
                },
            },
        });

        if (!product) {
            throw new Error("Product not found");
        }

        const totalGurusInLot = Number(product.total_gurus_lot || 0);

        if (totalGurusInLot <= 0) {
            throw new Error("Total gurus in lot not set in product");
        }

        // ================= FITTER =================
        const fitter = await tx.packingUser.findFirst({
            where: {
                id: body.fitter_id,
                is_deleted: false,
            },
        });

        if (!fitter) {
            throw new Error("Fitter not found");
        }

        // ================= PACKING OUTWARD =================
        const packing = await tx.packingOutward.create({
            data: {
                packing_outward_date: body.packing_outward_date
                    ? new Date(body.packing_outward_date)
                    : new Date(),

                product_id: body.product_id,
                fitter_id: body.fitter_id,

                outward_lot_qty: Number(body.outward_lot_qty || 0),
                exp_delivery_date: new Date(body.exp_delivery_date),
                exp_gurus: Number(body.exp_gurus || 0),

                created_by: userId,
                updated_by: userId,
            },
        });

        // ================= CREATE EXPECTATION =================
        await tx.expectation.create({
            data: {
                packing_outward_id: packing.id,
                packing_outward_date: packing.packing_outward_date,

                product_id: packing.product_id,
                fitter_id: packing.fitter_id,

                exp_delivery_date: packing.exp_delivery_date,
                exp_gurus: packing.exp_gurus,

                delivered_qty: 0,
                pending_qty: packing.exp_gurus,

                created_by: userId,
                updated_by: userId,
            },
        });

        // ================= RAW STOCK CONSUMPTION =================
        for (const bom of product.productBoms) {

            const rawProduct = bom.raw_product;

            const qtyPerGuru = Number(bom.qty);
            const totalConsumption = qtyPerGuru * totalGurusInLot;

            const beforeStock = Number(rawProduct.current_stock);
            const afterStock = beforeStock - totalConsumption;

            if (afterStock < 0) {
                warnings.push(
                    `${rawProduct.product_name} stock negative (${afterStock})`
                );
            }

            await tx.rawProduct.update({
                where: { id: rawProduct.id },
                data: {
                    current_stock: afterStock,
                },
            });

            await tx.stockDetails.create({
                data: {
                    raw_product_id: rawProduct.id,
                    action_type: "packing_outward",
                    action_date: new Date(),

                    before_stock: beforeStock,
                    after_stock: afterStock,

                    created_by: userId,
                    updated_by: userId,
                },
            });
        }

        return {
            packing,
            warning: warnings.length ? warnings : null,
        };

    }, {
        maxWait: 10000,
        timeout: 10000,
    });
};

// ================= UPDATE PACKING OUTWARD =================
// export const updatePackingOutward = async ({ id, body, userId }) => {
//     if (!id) {
//         const error = new Error("Id is required");
//         error.status = 400;
//         throw error;
//     }

//     const existing = await prisma.packingOutward.findFirst({
//         where: { id, is_deleted: false },
//     });

//     if (!existing) {
//         const error = new Error("Packing outward not found");
//         error.status = 404;
//         throw error;
//     }

//     // Validate product if provided
//     if (body.product_id) {
//         const product = await prisma.product.findFirst({
//             where: { id: body.product_id, is_deleted: false },
//         });
//         if (!product) {
//             const error = new Error("Product not found");
//             error.status = 404;
//             throw error;
//         }
//     }

//     // Validate fitter if provided
//     if (body.fitter_id) {
//         const fitter = await prisma.packingUser.findFirst({
//             where: { id: body.fitter_id, is_deleted: false },
//         });
//         if (!fitter) {
//             const error = new Error("Fitter not found");
//             error.status = 404;
//             throw error;
//         }
//     }

//     return prisma.packingOutward.update({
//         where: { id },
//         data: {
//             ...(body.packing_outward_date && {
//                 packing_outward_date: new Date(body.packing_outward_date),
//             }),
//             ...(body.product_id && { product_id: body.product_id }),
//             ...(body.fitter_id && { fitter_id: body.fitter_id }),
//             ...(body.outward_lot_qty !== undefined && { outward_lot_qty: Number(body.outward_lot_qty) }),
//             ...(body.exp_delivery_date && {
//                 exp_delivery_date: new Date(body.exp_delivery_date),
//             }),
//             ...(body.exp_gurus !== undefined && { exp_gurus: Number(body.exp_gurus) }),
//             updated_by: userId,
//         },

//     });
// };

// ================= UPDATE PACKING OUTWARD =================
export const updatePackingOutward = async ({ id, body, userId }) => {
    if (!id) {
        throw { status: 400, message: "Id is required" };
    }

    return await prisma.$transaction(async (tx) => {

        // ================= FIND OUTWARD =================
        const existing = await tx.packingOutward.findFirst({
            where: { id, is_deleted: false },
        });

        if (!existing) {
            throw { status: 404, message: "Packing outward not found" };
        }

        // ================= FIND EXPECTATION =================
        const expectation = await tx.expectation.findFirst({
            where: {
                packing_outward_id: existing.id,
                is_deleted: false,
            },
        });

        if (!expectation) {
            throw { status: 404, message: "Expectation not found" };
        }

        // ================= VALIDATE PRODUCT =================
        if (body.product_id) {
            const product = await tx.product.findFirst({
                where: { id: body.product_id, is_deleted: false },
            });
            if (!product) {
                throw { status: 404, message: "Product not found" };
            }
        }

        // ================= VALIDATE FITTER =================
        if (body.fitter_id) {
            const fitter = await tx.packingUser.findFirst({
                where: { id: body.fitter_id, is_deleted: false },
            });
            if (!fitter) {
                throw { status: 404, message: "Fitter not found" };
            }
        }

        // ================= EXPECTATION CALCULATION =================
        const deliveredQty = Number(expectation.delivered_qty || 0);

        const newExpGurus =
            body.exp_gurus !== undefined
                ? Number(body.exp_gurus)
                : Number(expectation.exp_gurus);

        const newPendingQty = newExpGurus - deliveredQty;

        if (newPendingQty < 0) {
            throw {
                status: 400,
                message:
                    "Cannot reduce expected gurus below delivered gurus",
            };
        }

        // ================= UPDATE OUTWARD =================
        const updatedOutward = await tx.packingOutward.update({
            where: { id },
            data: {
                ...(body.packing_outward_date && {
                    packing_outward_date: new Date(body.packing_outward_date),
                }),
                ...(body.product_id && { product_id: body.product_id }),
                ...(body.fitter_id && { fitter_id: body.fitter_id }),
                ...(body.outward_lot_qty !== undefined && {
                    outward_lot_qty: Number(body.outward_lot_qty),
                }),
                ...(body.exp_delivery_date && {
                    exp_delivery_date: new Date(body.exp_delivery_date),
                }),
                ...(body.exp_gurus !== undefined && {
                    exp_gurus: newExpGurus,
                }),
                updated_by: userId,
            },
        });

        // ================= UPDATE EXPECTATION =================
        await tx.expectation.update({
            where: { id: expectation.id },
            data: {
                ...(body.packing_outward_date && {
                    packing_outward_date: new Date(body.packing_outward_date),
                }),
                ...(body.product_id && { product_id: body.product_id }),
                ...(body.fitter_id && { fitter_id: body.fitter_id }),
                ...(body.exp_delivery_date && {
                    exp_delivery_date: new Date(body.exp_delivery_date),
                }),
                ...(body.exp_gurus !== undefined && {
                    exp_gurus: newExpGurus,
                    pending_qty: newPendingQty,
                }),
                updated_by: userId,
            },
        });

        return updatedOutward;

    });
};

// ================= GET PACKING OUTWARD BY ID =================
export const getPackingOutwardById = async ({ id }) => {
    if (!id) {
        const error = new Error("Id is required");
        error.status = 400;
        throw error;
    }

    const row = await prisma.packingOutward.findFirst({
        where: { id, is_deleted: false },
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
        },
    });

    if (!row) {
        const error = new Error("Packing outward not found");
        error.status = 404;
        throw error;
    }

    // Fetch created_by and updated_by user info
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
    users.forEach(u => {
        userMap[u.id] = { username: u.user_name, role: u.role };
    });
    superUsers.forEach(u => {
        userMap[u.id] = { username: u.username, role: u.role };
    });

    return {
        id: row.id,
        packing_outward_date: row.packing_outward_date,
        lot_qty: row.outward_lot_qty,
        exp_delivery_date: row.exp_delivery_date,
        exp_qty: row.exp_gurus,
        product: row.product,
        fitter: row.packing_users,
        created_by: userMap[row.created_by] || null,
        updated_by: userMap[row.updated_by] || null,
    };
};

// ================= DELETE PACKING OUTWARD =================
// export const deletePackingOutward = async ({ id, userId }) => {
//     const row = await prisma.packingOutward.findUnique({
//         where: { id },
//     });

//     if (!row) {
//         const error = new Error("Packing outward not found");
//         error.status = 404;
//         throw error;
//     }

//     return prisma.packingOutward.update({
//         where: { id },
//         data: {
//             is_deleted: true,
//             deleted_by: userId,
//             deleted_at: new Date(),
//             updated_by: userId,
//         },
//     });
// };

export const deletePackingOutward = async ({ id, userId }) => {

    const row = await prisma.packingOutward.findUnique({
        where: { id },
    });

    if (!row) {
        const error = new Error("Packing outward not found");
        error.status = 404;
        throw error;
    }
    
    await prisma.expectation.updateMany({
        where: {
            packing_outward_id: id,
            is_deleted: false,
        },
        data: {
            is_deleted: true,
            deleted_by: userId,
            deleted_at: new Date(),
            updated_by: userId,
        },
    });

    return prisma.packingOutward.update({
        where: { id },
        data: {
            is_deleted: true,
            deleted_by: userId,
            deleted_at: new Date(),
            updated_by: userId,
        },
    });
};


// ================= SEARCH FITTER =================
export const searchPackingUser = async (search, user) => {
    return prisma.PackingUser.findMany({
        where: {
            ...(search && {
                user_name: {
                    contains: search,
                },
            }),
            ...(user.role !== "superAdmin" && {
                created_by: user.id,
            }),
            is_deleted: false,

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


