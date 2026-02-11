import { prisma } from "@/lib/prisma";

/* =================  CREATE RAW INWARD  ================= */
export const createRawInward = async ({
    supplier_id,
    inward_date,
    remark,
    products,
    userId,
}) => {
    return prisma.$transaction(async (tx) => {
        const rawInward = await tx.rawInward.create({
            data: {
                supplier_id,
                inward_date: inward_date ? new Date(inward_date) : undefined,
                remark,
                created_by: userId,
                updated_by: userId,
                products: {
                    create: products.map((item) => ({
                        product_id: item.product_id,
                        qty: item.qty,
                        unit: item.unit,
                        rate: item.rate,
                        total: Number(item.qty) * Number(item.rate),
                    })),
                },
            },
        });

        for (const item of products) {
            const currentProduct = await tx.rawProduct.findUnique({
                where: { id: item.product_id },
                select: { current_stock: true }
            });

            const beforeStock = currentProduct?.current_stock || 0;
            const afterStock = beforeStock + Number(item.qty);

            await tx.rawProduct.update({
                where: { id: item.product_id },
                data: {
                    current_stock: {
                        increment: Number(item.qty) 
                    }
                }
            });

            await tx.stockDetails.create({
                data: {
                    supplier_id,
                    raw_product_id: item.product_id,
                    action_date: inward_date ? new Date(inward_date) : new Date(),
                    action_type: "raw_inward",
                    before_stock: beforeStock,
                    after_stock: afterStock,
                    created_by: userId,
                    updated_by: userId,
                }
            });
        }

        return rawInward;
    });
};
 
/* ================= GET RAW INWARD ================= */
export const getAllRawInward = async ({ page, limit, search }) => {
    const skip = (page - 1) * limit;

    const where = {
        is_deleted: false,
        ...(search && {
            supplier: {
                supplier_name: {
                    contains: search,
                },
            },

        }),
    };

    /* ================= FETCH RAW INWARD ================= */
    const [rows, total] = await Promise.all([
        prisma.rawInward.findMany({
            where,
            skip,
            take: limit,
            orderBy: { created_at: "desc" },
            select: {
                id: true,
                inward_date: true,
                created_by: true,
                updated_by: true,

                supplier: {
                    select: {
                        supplier_name: true,
                    },
                },

                _count: {
                    select: {
                        products: true,
                    },
                },
            },
        }),

        prisma.rawInward.count({ where }),
    ]);

    /* ================= COLLECT USER IDS ================= */
    const userIds = [
        ...new Set(
            rows.flatMap(r => [r.created_by, r.updated_by]).filter(Boolean)
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
    const response = rows.map(row => ({
        id: row.id,
        supplier_name: row.supplier?.supplier_name || "-",
        inward_date: row.inward_date,
        total_products: row._count.products,

        created_by: userMap[row.created_by] || null,
        updated_by: userMap[row.updated_by] || null,
    }));

    return {
        response,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

/* ================= GET RAW INWARD BY ID ================= */
export const getRawInwardById = async ({ id }) => {
    /* ================= VALIDATION ================= */
    if (!id) {
        throw {
            status: 400,
            message: "Raw inward id is required",
        };
    }

    /* ================= FETCH RAW INWARD ================= */
    const rawInward = await prisma.rawInward.findFirst({
        where: {
            id,
            is_deleted: false,
            is_active: true,
        },
        select: {
            id: true,
            inward_date: true,
            remark: true,
            created_by: true,
            updated_by: true,

            supplier: {
                select: {
                    id: true,
                    supplier_name: true,
                },
            },

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
    if (!rawInward) {
        throw {
            status: 404,
            message: "Raw inward not found",
        };
    }
    /* ================= FORMAT RESPONSE ================= */
    return {
        id: rawInward.id,
        inward_date: rawInward.inward_date,
        remark: rawInward.remark,

        supplier: {
            id: rawInward.supplier.id,
            supplier_name: rawInward.supplier.supplier_name,
        },

        products: rawInward.products.map((p) => ({
            id: p.id,
            product_id: p.product.id,
            product_name: p.product.product_name,
            qty: p.qty,
            unit: p.unit,
            rate: p.rate,
            total: p.total,
        })),
        total_products: rawInward.products.length,
    };
};

/* ================= DELETE RAW INWARD ================= */
export const deleteRawInward = async ({ id, userId }) => {
    if (!id) {
        throw {
            status: 400,
            message: "Raw inward id is required",
        };
    }

    const rawInward = await prisma.rawInward.findUnique({
        where: { id },
    });

    if (!rawInward || rawInward.is_deleted) {
        throw {
            status: 404,
            message: "Raw inward not found",
        };
    }

    await prisma.rawInward.update({
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





export const updateRawInward = async ({
    id,
    supplier_id,
    inward_date,
    remark,
    products = [],
    userId,
}) => {
    return prisma.$transaction(async (tx) => {
        const oldInward = await tx.rawInward.findUnique({
            where: { id },
            include: { products: true }
        });

        if (!oldInward) throw { status: 404, message: "Raw inward not found" };

        const oldProductsMap = new Map(oldInward.products.map(p => [p.product_id, p.qty]));

        await tx.rawInward.update({
            where: { id },
            data: {
                supplier_id,
                inward_date: inward_date ? new Date(inward_date) : oldInward.inward_date,
                remark,
                updated_by: userId,
                updated_at: new Date(),
            },
        });

        await tx.rawInwardProducts.deleteMany({ where: { raw_inward_id: id } });

        for (const item of products) {
            const newQty = Number(item.qty);
            const oldQty = oldProductsMap.get(item.product_id) || 0;
            const difference = newQty - oldQty;

            await tx.rawInwardProducts.create({
                data: {
                    raw_inward_id: id,
                    product_id: item.product_id,
                    qty: newQty,
                    unit: item.unit,
                    rate: Number(item.rate),
                    total: newQty * Number(item.rate),
                }
            });

            if (difference !== 0) {
                const currentProduct = await tx.rawProduct.findUnique({
                    where: { id: item.product_id },
                    select: { current_stock: true }
                });

                const beforeStock = currentProduct?.current_stock || 0;
                const afterStock = beforeStock + difference;

                await tx.rawProduct.update({
                    where: { id: item.product_id },
                    data: { current_stock: { increment: difference } } 
                });

                await tx.stockDetails.create({
                    data: {
                        raw_product_id: item.product_id,
                        action_date: new Date(),
                        action_type: difference > 0 ? "raw_inward" : "raw_outward", 
                        before_stock: beforeStock,
                        after_stock: afterStock,
                        created_by: userId,
                        updated_by: userId,
                        supplier_id: supplier_id
                    }
                });
            }
            
            oldProductsMap.delete(item.product_id);
        }

        for (const [prodId, oldQty] of oldProductsMap) {
            const currentProduct = await tx.rawProduct.findUnique({
                where: { id: prodId },
                select: { current_stock: true }
            });

            const beforeStock = currentProduct?.current_stock || 0;
            const afterStock = beforeStock - oldQty;

            await tx.rawProduct.update({
                where: { id: prodId },
                data: { current_stock: { decrement: oldQty } }
            });

            await tx.stockDetails.create({
                data: {
                    raw_product_id: prodId,
                    action_date: new Date(),
                    action_type: "raw_outward",
                    before_stock: beforeStock,
                    after_stock: afterStock,
                    created_by: userId,
                    updated_by: userId,
                    supplier_id: supplier_id
                }
            });
        }

        return { success: true };
    }, { timeout: 20000 });
};


/* ================= UPDATE RAW INWARD ================= */
// export const updateRawInward = async ({
//     id,
//     supplier_id,
//     inward_date,
//     remark,
//     products = [],
//     userId,
// }) => {
//     if (!id) throw { status: 400, message: "Raw inward id is required" };
//     if (!userId) throw { status: 401, message: "User id is required" };
//     if (!Array.isArray(products)) throw { status: 400, message: "Products must be an array" };

//     return prisma.$transaction(async (tx) => {
//         const oldInward = await tx.rawInward.findUnique({
//             where: { id },
//             include: { products: true }
//         });

//         if (!oldInward) throw { status: 404, message: "Raw inward not found" };

//         for (const oldItem of oldInward.products) {
//             const product = await tx.rawProduct.findUnique({
//                 where: { id: oldItem.product_id },
//                 select: { current_stock: true }
//             });

//             const beforeStock = product?.current_stock || 0;
//             const afterStock = beforeStock - oldItem.qty;

//             await tx.rawProduct.update({
//                 where: { id: oldItem.product_id },
//                 data: { current_stock: { decrement: oldItem.qty } }
//             });

//             await tx.stockDetails.create({
//                 data: {
//                     raw_product_id: oldItem.product_id,
//                     action_date: new Date(),
//                     action_type: "raw_outward", 
//                     before_stock: beforeStock,
//                     after_stock: afterStock,
//                     created_by: userId,
//                     updated_by: userId,
//                     supplier_id: supplier_id 
//                 }
//             });
//         }

//         await tx.rawInward.update({
//             where: { id },
//             data: {
//                 supplier_id,
//                 inward_date: inward_date ? new Date(inward_date) : oldInward.inward_date,
//                 remark,
//                 updated_by: userId,
//                 updated_at: new Date(),
//             },
//         });

//         await tx.rawInwardProducts.deleteMany({
//             where: { raw_inward_id: id },
//         });

//         if (products.length > 0) {
//             for (const item of products) {
//                 await tx.rawInwardProducts.create({
//                     data: {
//                         raw_inward_id: id,
//                         product_id: item.product_id,
//                         qty: Number(item.qty),
//                         unit: item.unit,
//                         rate: Number(item.rate),
//                         total: Number(item.qty) * Number(item.rate),
//                     }
//                 });

//                 const currentProduct = await tx.rawProduct.findUnique({
//                     where: { id: item.product_id },
//                     select: { current_stock: true }
//                 });

//                 const beforeStock = currentProduct?.current_stock || 0;
//                 const afterStock = beforeStock + Number(item.qty);

//                 await tx.rawProduct.update({
//                     where: { id: item.product_id },
//                     data: { current_stock: { increment: Number(item.qty) } }
//                 });

//                 await tx.stockDetails.create({
//                     data: {
//                         raw_product_id: item.product_id,
//                         action_date: inward_date ? new Date(inward_date) : new Date(),
//                         action_type: "raw_inward",
//                         before_stock: beforeStock,
//                         after_stock: afterStock,
//                         created_by: userId,
//                         updated_by: userId,
//                         supplier_id: supplier_id
//                     }
//                 });
//             }
//         }

//         return { success: true };
//     }, { timeout: 20000 }); 
// };