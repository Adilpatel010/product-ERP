import { getUserFromRequest } from "@/lib/auth";
import {
    deleteRawProduct,
    getRawProductById,
    updateRawProduct,
} from "@/services/rawProduct.service";

export default async function handler(req, res) {
    try {
        /* ================= METHOD CHECK ================= */
        const allowedMethods = ["GET", "PUT", "DELETE"];

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

        const { id } = req.query;

        /* ================= GET BY ID ================= */
        if (req.method === "GET") {
            const rawProduct = await getRawProductById({ id });

            return res.status(200).json({
                success: true,
                message: "Raw product fetched successfully",
                data: rawProduct,
            });
        }

        /* ================= DELETE ================= */
        if (req.method === "DELETE") {
            await deleteRawProduct({ id, userId: user.id });

            return res.status(200).json({
                success: true,
                message: "Raw product deleted successfully",
                id,
            });
        }

        /* ================= UPDATE ================= */
        if (req.method === "PUT") {
            const updatedProduct = await updateRawProduct({
                id,
                ...req.body,
                userId: user.id,
            });

            return res.status(200).json({
                success: true,
                message: "Raw product updated successfully",
                data: updatedProduct,
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
