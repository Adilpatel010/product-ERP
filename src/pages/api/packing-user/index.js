import { getUserFromRequest } from "@/lib/auth";
import {
    createPackingUser,
    getAllPackingUsers,
} from "@/services/packingUser.service";

export default async function handler(req, res) {
    try {
        /* ================= METHOD CHECK ================= */
        if (!["GET", "POST"].includes(req.method)) {
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

        /* ================= GET PACKING USERS ================= */
        if (req.method === "GET") {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const search = (req.query.search || "").trim();

            const result = await getAllPackingUsers({
                page,
                limit,
                search,
                userId: user.id,
                userRole: user.role,
            });

            return res.status(200).json({
                success: true,
                message: "Packing users fetched successfully",
                data: result.response,
                pagination: result.pagination,
            });
        }

        /* ================= CREATE PACKING USER ================= */
        if (req.method === "POST") {
            const { user_name } = req.body;

            const packingUser = await createPackingUser({
                user_name,
                userId: user.id,
            });

            return res.status(201).json({
                success: true,
                message: "Packing user created successfully",
                data: packingUser,
            });
        }

    } catch (error) {
        console.error("Packing user API error:", error);

        return res.status(error.status || 500).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
}
