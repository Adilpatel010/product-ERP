import { getUserFromRequest } from "@/lib/auth";
import { createWorking, getAllWorking } from "@/services/molding/working.service";

export default async function handler(req, res) {
    try {
        const user = getUserFromRequest(req);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        /* ================= GET ================= */
        if (req.method === "GET") {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const search = (req.query.search || "").trim();

            const result = await getAllWorking({ page, limit, search });

            return res.status(200).json({
                success: true,
                message: "Working fetched successfully",
                ...result,
            });
        }

        /* ================= POST ================= */
        if (req.method === "POST") {
            const working = await createWorking({
                ...req.body,
                userId: user.id,
            });

            return res.status(201).json({
                success: true,
                message: "Working created successfully",
            });
        }

        return res.status(405).json({
            success: false,
            message: "Method not allowed",
        });
    } catch (error) {
        console.error(error);

        return res.status(error.status || 500).json({
            success: false,
            message: error.message || "Server error",
        });
    }
}
