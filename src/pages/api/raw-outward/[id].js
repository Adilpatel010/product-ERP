import { getUserFromRequest } from "@/lib/auth";
import {
    getRawOutwardById,
    updateRawOutward,
    deleteRawOutward,
} from "@/services/rawOutward.service";

/* ================= RAW OUTWARD BY ID API ================= */
export default async function handler(req, res) {
    try {
        /* ================= AUTH ================= */
        const user = await getUserFromRequest(req);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const { id } = req.query;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Raw outward id is required",
            });
        }

        /* ================= GET RAW OUTWARD BY ID ================= */
        if (req.method === "GET") {
            const data = await getRawOutwardById({ id });

            return res.status(200).json({
                success: true,
                message: "Raw outward fetched successfully",
                data,
            });
        }

        /* ================= UPDATE RAW OUTWARD ================= */
        if (req.method === "PUT") {
            const { outward_date, remark, products } = req.body;

            const result = await updateRawOutward({
                id,
                outward_date,
                remark,
                products,
                userId: user.id,
            });

            return res.status(200).json({
                success: true,
                message: "Raw outward updated successfully",
                data: result,
            });
        }

        /* ================= DELETE RAW OUTWARD ================= */
        if (req.method === "DELETE") {
            await deleteRawOutward({
                id,
                userId: user.id,
            });

            return res.status(200).json({
                success: true,
                message: "Raw outward deleted successfully",
            });
        }

        /* ================= METHOD NOT ALLOWED ================= */
        return res.status(405).json({
            success: false,
            message: "Method Not Allowed",
        });
    } catch (error) {
        console.error("RAW OUTWARD API ERROR:", error);

        return res.status(error.status || 500).json({
            success: false,
            message: error.message || "Internal Server Error",
        });
    }
}
