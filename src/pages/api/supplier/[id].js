import { getUserFromRequest } from "@/lib/auth";
import { deleteSupplier, getSupplierById, updateSupplier } from "@/services/supplier.service";

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
            const supplier = await getSupplierById({ id });

            return res.status(200).json({
                success: true,
                message: "Supplier fetched successfully",
                data: supplier,
            });
        }

        /* ================= DELETE ================= */
        if (req.method === "DELETE") {
            await deleteSupplier({ id, userId: user.id });

            return res.status(200).json({
                success: true,
                message: "Supplier deleted successfully",
                id,
            });
        }

        /* ================= UPDATE ================= */
        if (req.method === "PUT") {
            const supplier = await updateSupplier({
                id,
                ...req.body,
                userId: user.id,
            });

            return res.status(200).json({
                success: true,
                message: "Supplier updated successfully",
                data: supplier,
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
