import { prisma } from "@/lib/prisma";

// ================= GET ALL PRODUCTS =================
export const getAllProducts = async ({ page, limit, search }) => {
    const skip = (page - 1) * limit;

    const whereCondition = {
        is_deleted: false,
        ...(search && {
            OR: [
                {
                    product_name: {
                        contains: search,
                    },
                },
                {
                    color: {
                        contains: search,
                    },
                },
            ],
        }),
    };

    const total = await prisma.product.count({
        where: whereCondition,
    });

    const data = await prisma.product.findMany({
        where: whereCondition,
        orderBy: { created_at: "desc" },
        skip,
        take: limit,

        include: {
            productBoms: {
                include: {
                    raw_product: {
                        select: {
                            id: true,
                            product_name: true,
                        },
                    },
                },
            },
        },
    });

    /* ================= USER MAP ================= */

    const userIds = [
        ...new Set(
            data.flatMap(r => [r.created_by, r.updated_by]).filter(Boolean)
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

    const response = data.map(row => ({
        id: row.id,
        product_name: row.product_name,
        color_type: row.color_type,
        color: row.color,

        pcs_in_gurus: row.pcs_in_gurus,
        gurus_weight_gm: row.gurus_weight_gm,
        lot_in_bag: row.lot_in_bag,
        bag_weight_kg: row.bag_weight_kg,
        lot_in_kg: row.lot_in_kg,
        total_gurus_lot: row.total_gurus_lot,

        bom: row.productBoms.map(bom => ({
            id: bom.id,
            raw_product_id: bom.raw_product_id,
            raw_product_name: bom.raw_product.product_name,
            qty: bom.qty,
        })),

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

// ================= CREATE PRODUCT =================
export const createProduct = async ({ body, userId }) => {
    return await prisma.$transaction(async (tx) => {

        const inputColor =
            body.color?.trim().toLowerCase() || null;

        /* ================= FETCH EXISTING ================= */
        const existingProducts = await tx.product.findMany({
            where: {
                product_name: body.product_name.trim(),
                is_deleted: false,
            },
            select: {
                color_type: true,
                color: true,
            },
        });

        const hasAllColor = existingProducts.some(
            (p) => p.color_type === "all"
        );

        const hasSameCustomColor = existingProducts.some(
            (p) =>
                p.color_type === "custom" &&
                p.color &&
                p.color.trim().toLowerCase() === inputColor
        );

        /* ================= VALIDATIONS ================= */

        // Rule 1: ALL exists → block everything
        if (hasAllColor) {
            const error = new Error(
                "This product already exists with all colors."
            );
            error.status = 409;
            throw error;
        }

        // Rule 2: Custom exists → block ALL
        if (
            body.color_type === "all" &&
            existingProducts.length > 0
        ) {
            const error = new Error(
                "Custom colors already exist. All color is not allowed."
            );
            error.status = 409;
            throw error;
        }

        // Rule 3: Duplicate custom color
        if (
            body.color_type === "custom" &&
            hasSameCustomColor
        ) {
            const error = new Error(
                "This color already exists."
            );
            error.status = 409;
            throw error;
        }

        /* ================= CREATE PRODUCT ================= */

        const product = await tx.product.create({
            data: {
                product_name: body.product_name.trim(),
                color_type: body.color_type,
                color:
                    body.color_type === "custom"
                        ? body.color?.trim()
                        : null,

                pcs_in_gurus: body.pcs_in_gurus,
                gurus_weight_gm: body.gurus_weight_gm,
                lot_in_bag: body.lot_in_bag,
                bag_weight_kg: body.bag_weight_kg,
                lot_in_kg: body.lot_in_kg,
                total_gurus_lot: body.total_gurus_lot,

                created_by: userId,
                updated_by: userId,

                productBoms: body.bom?.length
                    ? {
                        create: body.bom.map((bom) => ({
                            raw_product_id: bom.raw_product_id,
                            qty: bom.qty,
                        })),
                    }
                    : undefined,
            },
        });

        return product;
    });
};

// ================= GET PRODUCT BOM BY ID =================
export const getProductBomByProductId = async ({ product_id }) => {

    const whereCondition = {};

    if (product_id) {
        whereCondition.product_id = product_id;
    }


    const boms = await prisma.productBom.findMany({
        where: whereCondition,
        select: {
            id: true,
            qty: true,

            raw_product: {
                select: {
                    id: true,
                    product_name: true,
                    unit: true,
                },
            },
        },
        orderBy: {
            product_id: "asc",
        },
    });

    if (!boms.length) {
        const error = new Error("No product BOM found");
        error.status = 404;
        throw error;
    }

    return boms;
};

// ================= DELETE PRODUCT =================
export const deleteProduct = async ({ id, userId }) => {

    const product = await prisma.product.findUnique({
        where: { id },
    });

    if (!product) {
        throw {
            status: 404,
            message: "Product not found",
        };
    }

    return prisma.product.update({
        where: { id },
        data: {
            is_deleted: true,
            deleted_by: userId,
            deleted_at: new Date(),
            updated_by: userId,
        },
    });
};

// ================= UPDATE PRODUCT =================
export const updateProduct = async ({ id, body, userId }) => {
    if (!id) {
        const error = new Error("Product id is required");
        error.status = 400;
        throw error;
    }

    return await prisma.$transaction(async (tx) => {

        const product = await tx.product.findFirst({
            where: {
                id,
                is_deleted: false,
            },
        });

        if (!product) {
            const error = new Error("Product not found");
            error.status = 404;
            throw error;
        }
        const duplicate = await tx.product.findMany({
            where: {
                product_name: body.product_name,
                is_deleted: false,
                NOT: { id },
            },
            select: {
                color_type: true,
                color: true,
            },
        });

        const inputColor = body.color?.trim()?.toLowerCase() || null;

        const hasAllColor = duplicate.some(
            (p) => p.color_type === "all"
        );

        const hasSameCustomColor = duplicate.some(
            (p) =>
                p.color_type === "custom" &&
                p.color?.trim()?.toLowerCase() === inputColor
        );

        if (hasAllColor) {
            throw new Error("This product already exists with ALL colors.");
        }

        if (body.color_type === "all" && duplicate.length > 0) {
            throw new Error("Custom colors already exist. ALL color is not allowed.");
        }

        if (body.color_type === "custom" && hasSameCustomColor) {
            throw new Error("This custom color already exists.");
        }

        await tx.product.update({
            where: { id },
            data: {
                product_name: body.product_name.trim(),
                color_type: body.color_type,
                color:
                    body.color_type === "custom"
                        ? body.color?.trim()
                        : null,

                pcs_in_gurus: body.pcs_in_gurus,
                gurus_weight_gm: body.gurus_weight_gm,
                lot_in_bag: body.lot_in_bag,
                bag_weight_kg: body.bag_weight_kg,
                lot_in_kg: body.lot_in_kg,
                total_gurus_lot: body.total_gurus_lot,

                updated_by: userId,
            },
        });

        await tx.productBom.deleteMany({
            where: {
                product_id: id,
            },
        });

        if (body.bom?.length > 0) {
            await tx.productBom.createMany({
                data: body.bom.map((bom) => ({
                    product_id: id,
                    raw_product_id: bom.raw_product_id,
                    qty: bom.qty,
                })),
            });
        }

        return product;
    });
};

// ================= GET PRODUCT BY ID =================
export const getProductById = async ({ id }) => {
    if (!id) {
        const error = new Error("Product id is required");
        error.status = 400;
        throw error;
    }

    const product = await prisma.product.findFirst({
        where: {
            id,
            is_deleted: false,
        },

        include: {
            productBoms: {
                include: {
                    raw_product: {
                        select: {
                            id: true,
                            product_name: true,
                        },
                    },
                },
            },
        },
    });

    if (!product) {
        const error = new Error("Product not found");
        error.status = 404;
        throw error;
    }

    // response
    const response = {
        id: product.id,
        product_name: product.product_name,
        color_type: product.color_type,
        color: product.color,
        pcs_in_gurus: product.pcs_in_gurus,
        gurus_weight_gm: product.gurus_weight_gm,
        lot_in_bag: product.lot_in_bag,
        bag_weight_kg: product.bag_weight_kg,
        lot_in_kg: product.lot_in_kg,
        total_gurus_lot: product.total_gurus_lot,

        bom: product.productBoms.map((bom) => ({
            id: bom.id,
            raw_product_id: bom.raw_product_id,
            raw_product_name: bom.raw_product.product_name,
            qty: Number(bom.qty),
        })),
    };

    return response;
};

/* ================= SEARCH PRODUCT ================= */
export const searchProduct = async (search) => {
    return prisma.product.findMany({
        where: {
            ...(search && {
                OR: [
                    {
                        product_name: {
                            contains: search,
                        },
                    },
                    {
                        color: {
                            contains: search,
                        },
                    },
                ],
            }),
            is_deleted: false,
        },
        select: {
            id: true,
            product_name: true,
            color: true,
            total_gurus_lot: true
        },
        orderBy: {
            product_name: "asc",
        },
    });
};