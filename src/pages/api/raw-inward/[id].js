import { getUserFromRequest } from "@/lib/auth";
import {
    getRawInwardById,
    updateRawInward,
    deleteRawInward,
} from "@/services/rawInward.service";

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

        /* ================= GET ================= */
        if (req.method === "GET") {
            const data = await getRawInwardById({ id });

            return res.status(200).json({
                success: true,
                message: "Raw inward fetched successfully",
                data,
            });
        }

        /* ================= UPDATE ================= */
        if (req.method === "PUT") {
            const updatedId = await updateRawInward({
                id,
                ...req.body,
                userId: user.id || user.userId,
            });

            return res.status(200).json({
                success: true,
                message: "Raw inward updated successfully",
                id: updatedId,
            });
        }

        /* ================= DELETE ================= */
        if (req.method === "DELETE") {
            await deleteRawInward({
                id,
                userId: user.id || user.userId,
            });

            return res.status(200).json({
                success: true,
                message: "Raw inward deleted successfully",
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
