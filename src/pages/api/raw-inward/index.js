import { getUserFromRequest } from "@/lib/auth";
import {
    getAllRawInward,
    createRawInward,
} from "@/services/rawInward.service";

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

        /* ================= GET RAW INWARD ================= */
        if (req.method === "GET") {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const search = (req.query.search || "").trim();

            const result = await getAllRawInward({
                page,
                limit,
                search,
            });

            return res.status(200).json({
                success: true,
                message: "Raw inward fetched successfully",
                data: result.response,
                pagination: result.pagination,
            });
        }

        /* ================= CREATE RAW INWARD ================= */
        if (req.method === "POST") {
            const {
                supplier_id,
                inward_date,
                remark,
                products,
            } = req.body;

            if (!supplier_id || !products?.length) {
                return res.status(400).json({
                    success: false,
                    message: "Supplier and products are required",
                });
            }

            const rawInward = await createRawInward({
                supplier_id,
                inward_date,
                remark,
                products,
                userId: user.id,
            });

            return res.status(201).json({
                success: true,
                message: "Raw inward created successfully",
                // data: rawInward,
            });
        }

    } catch (err) {
        console.error("Raw inward API error:", err);

        return res.status(err.status || 500).json({
            success: false,
            message: err.message || "Internal server error",
        });
    }
}
