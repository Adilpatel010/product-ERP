import { prisma } from "@/lib/prisma";

/* ================= GET SUPPLIERS ================= */
export const getAllSupplier = async ({ page, limit, search }) => {
    const skip = (page - 1) * limit;

    const whereCondition = {
        is_deleted: false,
        is_active: true,
        ...(search && {
            OR: [
                {
                    supplier_name: {
                        contains: search,
                    },
                },
                {
                    contact: {
                        contains: search,
                    },
                },
            ],
        }),
    };

    const total = await prisma.supplier.count({
        where: whereCondition,
    });

    const data = await prisma.supplier.findMany({
        where: whereCondition,
        orderBy: { created_at: "desc" },
        skip,
        take: limit,
    });

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
    const response = data.map(row => ({
        id: row.id,
        supplier_name: row.supplier_name,
        contact: row.contact,
        address: row.address,

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

/* ================= CREATE SUPPLIER ================= */
export const createSupplier = async ({
    supplier_name,
    contact,
    address,
    userId,
}) => {
    /* ===== BASIC VALIDATION ===== */
    if (!supplier_name || !supplier_name.trim()) {
        throw {
            status: 400,
            message: "Supplier name is required",
        };
    }

    if (!/^\d{10}$/.test(contact)) {
        throw {
            status: 400,
            message: "Contact must be exactly 10 digits",
        };
    }

    /* ===== CHECK CONTACT ALREADY EXISTS ===== */
    const existingSupplier = await prisma.supplier.findFirst({
        where: {
            contact: contact,
            is_deleted: false,
        },
    });

    if (existingSupplier) {
        throw {
            status: 409,
            message: "Contact number already exists",
        };
    }

    /* ===== CREATE SUPPLIER ===== */
    const supplier = await prisma.supplier.create({
        data: {
            supplier_name: supplier_name.trim(),
            contact,
            address: address?.trim() || null,
            created_by: userId,
            updated_by: userId,
        },
    });
    return supplier;
};

/* ================= DELETE SUPPLIER  ================= */
export const deleteSupplier = async ({ id, userId }) => {
    if (!id) {
        throw {
            status: 400,
            message: "Supplier id is required",
        };
    }

    const supplier = await prisma.supplier.findUnique({
        where: { id },
    });

    if (!supplier) {
        throw {
            status: 404,
            message: "Supplier not found",
        };
    }

    await prisma.supplier.update({
        where: { id },
        data: {
            is_deleted: true,
            is_active: false,
            deleted_at: new Date(),
            deleted_by: userId,
        },
    });

    return id;
};

/* ================= UPDATE SUPPLIER ================= */
export const updateSupplier = async ({
    id,
    supplier_name,
    contact,
    address,
    userId,
}) => {
    /* ===== ID REQUIRED ===== */
    if (!id) {
        throw {
            status: 400,
            message: "Supplier id is required",
        };
    }

    const supplier = await prisma.supplier.findUnique({
        where: { id },
    });

    if (!supplier || supplier.is_deleted) {
        throw {
            status: 404,
            message: "Supplier not found",
        };
    }

    if (contact) {
        const contactExists = await prisma.supplier.findFirst({
            where: {
                contact: contact.trim(),
                id: { not: id },
                is_deleted: false,
            },
        });

        if (contactExists) {
            throw {
                status: 409,
                message: "Contact already exists",
            };
        }
    }

    /* ===== UPDATE SUPPLIER ===== */
    const updatedSupplier = await prisma.supplier.update({
        where: { id },
        data: {
            ...(supplier_name && { supplier_name: supplier_name.trim() }),
            ...(contact !== undefined && { contact: contact?.trim() || null }),
            ...(address !== undefined && { address: address?.trim() || null }),
            updated_by: userId,
        },
    });

    return updatedSupplier;
};

/* ================= GET SUPPLIER BY ID ================= */
export const getSupplierById = async ({ id }) => {
    if (!id) {
        throw {
            status: 400,
            message: "Supplier id is required",
        };
    }

    const supplier = await prisma.supplier.findFirst({
        where: {
            id,
            deleted_at: null
        },
    });

    if (!supplier) {
        throw {
            status: 404,
            message: "Supplier not found",
        };
    }

    return supplier;
};

// ================= SEARCH SUPPLIER =================
export const searchSupplier = async (search) => {
    return prisma.supplier.findMany({
        where: {
            is_deleted: false,
            is_active: true,
            ...(search && {
                supplier_name: {
                    contains: search,
                },
            }),
        },
        select: {
            id: true,
            supplier_name: true,
        },

        orderBy: {
            supplier_name: "asc",
        },
    });
};

