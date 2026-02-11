import { getUserFromRequest } from "@/lib/auth";
import {
    getUserById,
    updateUser,
    deleteUser,
} from "@/services/user.service";

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

        /* ================= GET USER BY ID ================= */
        if (req.method === "GET") {
            const result = await getUserById({ id });

            return res.status(200).json({
                success: true,
                message: "User fetched successfully",
                data: result,
            });
        }

        /* ================= UPDATE USER ================= */
        if (req.method === "PUT") {
            const updatedUser = await updateUser({
                id,
                ...req.body,
                userId: user.id,
            });


            return res.status(200).json({
                success: true,
                message: "User updated successfully",
                data: updatedUser,
            });
        }

        /* ================= DELETE USER (SOFT) ================= */
        if (req.method === "DELETE") {
            await deleteUser({
                id,
                userId: user.id,
            });

            return res.status(200).json({
                success: true,
                message: "User deleted successfully",
                id,
            });
        }

    } catch (err) {
        console.error("User API error:", err);

        return res.status(err.status || 500).json({
            success: false,
            message: err.message || "Internal server error",
        });
    }
}
