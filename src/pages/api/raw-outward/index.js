import { getUserFromRequest } from "@/lib/auth";
import {
    createRawOutward,
    getAllRawOutward,
} from "@/services/rawOutward.service";

/* ================= RAW OUTWARD API ================= */
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

        /* ================= CREATE RAW OUTWARD ================= */
        if (req.method === "POST") {
            const { outward_date, remark, products } = req.body;

            const rawOutward = await createRawOutward({
                outward_date,
                remark,
                products,
                userId: user.id,
            });

            return res.status(201).json({
                success: true,
                message: "Raw outward created successfully",
                data: rawOutward,
            });
        }

        /* ================= GET ALL RAW OUTWARD ================= */
        if (req.method === "GET") {
            const page = Number(req.query.page || 1);
            const limit = Number(req.query.limit || 10);
            const search = (req.query.search || "").trim();

            const result = await getAllRawOutward({
                page,
                limit,
                search,
            });

            return res.status(200).json({
                success: true,
                message: "Raw outwards fetched successfully",
                ...result,
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
