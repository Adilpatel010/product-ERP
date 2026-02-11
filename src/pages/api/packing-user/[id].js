import { getUserFromRequest } from "@/lib/auth";
import {
    getPackingUserById,
    updatePackingUser,
    deletePackingUser,
} from "@/services/packingUser.service";

export default async function handler(req, res) {
    try {
        const { id } = req.query;

        /* ================= AUTH ================= */
        const user = getUserFromRequest(req);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        /* ================= GET ================= */
        if (req.method === "GET") {
            const data = await getPackingUserById({
                id,
                userId: user.id,
                userRole: user.role,
            });

            return res.status(200).json({
                success: true,
                message: "Packing user fetched successfully",
                data,
            });
        }

        /* ================= UPDATE ================= */
        if (req.method === "PUT") {
            const { user_name } = req.body;

            const updatedUser = await updatePackingUser({
                id,
                user_name,
                userId: user.id,
                userRole: user.role,
            });

            return res.status(200).json({
                success: true,
                message: "Packing user updated successfully",
                data: updatedUser,
            });
        }

        /* ================= DELETE ================= */
        if (req.method === "DELETE") {
            await deletePackingUser({
                id,
                userId: user.id,
                userRole: user.role,
            });

            return res.status(200).json({
                success: true,
                message: "Packing user deleted successfully",
            });
        }

        return res.status(405).json({
            success: false,
            message: "Method not allowed",
        });

    } catch (error) {
        console.error("Packing user API error:", error);

        return res.status(error.status || 500).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
}
