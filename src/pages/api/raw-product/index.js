import { getUserFromRequest } from "@/lib/auth";
import {
    getRawProducts,
    createRawProduct,
} from "@/services/rawProduct.service";

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

        /* ================= GET RAW PRODUCT ================= */
        if (req.method === "GET") {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const search = (req.query.search || "").trim();

            const result = await getRawProducts({
                page,
                limit,
                search,
            });

            return res.status(200).json({
                success: true,
                message: "Raw products fetched successfully",
                data: result.response,
                pagination: result.pagination,
            });
        }

        /* ================= ADD RAW PRODUCT ================= */
        if (req.method === "POST") {
            const rawProduct = await createRawProduct({
                ...req.body,
                userId: user.id,
            });
            
            return res.status(201).json({
                success: true,
                message: "Raw product created successfully",
                data: rawProduct,
            });
        }

    } catch (err) {
        console.error("Raw product API error:", err);

        return res.status(err.status || 500).json({
            success: false,
            message: err.message || "Internal server error",
        });
    }
}
