import { getUserFromRequest } from "@/lib/auth";
import {
    createSupplier,
    getAllSupplier,
} from "@/services/supplier.service";
import { prisma } from "@/lib/prisma";

export const config = {
    api: {
        bodyParser: true,
    },
};

export default async function handler(req, res) {
    try {
        /* ================= METHOD NOT ALLOWED (TOP) ================= */
        const allowedMethods = ["GET", "POST"];

        if (!allowedMethods.includes(req.method)) {
            return res.status(405).json({
                success: false,
                message: "Method not allowed",
            });
        }

        /* ================= AUTH ================= */
        const user = getUserFromRequest(req);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        /* ================= GET SUPPLIERS ================= */
        if (req.method === "GET") {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const search = (req.query.search || "").trim();

            const result = await getAllSupplier({
                page,
                limit,
                search,
            });

            return res.status(200).json({
                success: true,
                message: "Suppliers fetched successfully",
                data: result.response,
                pagination: result.pagination,
            });
        }
        /* ================= ADD SUPPLIER ================= */
        if (req.method === "POST") {
            const { supplier_name, contact, address } = req.body;

            /* ===== REQUIRED NAME CHECK ===== */
            if (!supplier_name || typeof supplier_name !== "string") {
                return res.status(400).json({
                    success: false,
                    message: "supplier_name is required",
                });
            }

            /* ===== CONTACT UNIQUE CHECK ===== */
            if (contact) {
                const existingContact = await prisma.supplier.findFirst({
                    where: {
                        contact: contact.trim(),
                        is_deleted: false,
                    },
                });

                if (existingContact) {
                    return res.status(409).json({
                        success: false,
                        message: "Contact number already exists",
                    });
                }
            }

            const supplier = await createSupplier({
                supplier_name: supplier_name.trim(),
                contact: contact?.trim() || null,
                address: address?.trim() || null,
                userId: user.id,
            });

            return res.status(201).json({
                success: true,
                message: "Supplier created successfully",
                data: supplier,
            });
        }

    } catch (err) {
        console.error("Supplier API error:", err);

        return res.status(err.status || 500).json({
            success: false,
            message: err.message || "Internal server error",
        });
    }
}
