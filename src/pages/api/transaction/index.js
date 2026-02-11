import { getUserFromRequest } from "@/lib/auth";
import { getAllTransactions } from "@/services/transaction.service";

export default async function handler(req, res) {
    try {
        const user = getUserFromRequest(req);
        if (!user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        /* ================= GET ALL STOCK DETAILS ================= */
        if (req.method === "GET") {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const from_date = req.query.from_date || "";
            const to_date = req.query.to_date || "";
            const user_id = req.query.user_id || "";

            const result = await getAllTransactions({
                page,
                limit,
                user_id,
                from_date,
                to_date
            });

            return res.status(200).json({
                success: true,
                message: "Transaction fetched successfully",
                data: result.response,
                pagination: result.pagination,
            });
        } else {
            return res.status(405).json({ success: false, message: "Method not allowed" });
        }

    } catch (err) {
        console.error("TRANSACTION API ERROR:", err);
        return res.status(err.status || 500).json({
            success: false,
            message: err.message || "Internal server error",
        });
    }
}