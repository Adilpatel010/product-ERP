import { updateWorking, getWorkingById, deleteWorking } from "@/services/molding/working.service";
import { getUserFromRequest } from "@/lib/auth";

export default async function handler(req, res) {
    try {
        const user = getUserFromRequest(req);
        if (!user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const { id } = req.query;

        if (req.method === "GET") {
            const data = await getWorkingById({ id });
            return res.status(200).json({
                success: true,
                message: "Working fetched successfully",
                data
            });
        }

        if (req.method === "PUT") {
            const result = await updateWorking({
                id,
                ...req.body,
                userId: user.id,
            });

            return res.status(200).json({
                success: true,
                message: "Working updated successfully",
                // id: result,
            });
        }

        if (req.method === "DELETE") {
            await deleteWorking({ id, userId: user.id });
            return res.status(200).json({
                success: true,
                message: "Working deleted"
            });
        }

        return res.status(405).json({ success: false, message: "Method not allowed" });
    } catch (err) {
        console.error("Working API error:", err);
        return res.status(err.status || 500).json({
            success: false,
            message: err.message || "Server error",
        });
    }
}
