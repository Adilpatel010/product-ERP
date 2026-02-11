import { getUserFromRequest } from "@/lib/auth";
import { getAllStockDetails } from "@/services/stockDetails.service";


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
            const search = (req.query.search || "").trim();
             

            const result = await getAllStockDetails({
                page,
                limit,
                search,
            
            });

            return res.status(200).json({
                success: true,
                message: "Stock details fetched successfully",
                data: result.response,
                pagination: result.pagination,
            });
        } else {
            return res.status(405).json({ success: false, message: "Method not allowed" });
        }

    } catch (err) {
        console.error("STOCK API ERROR:", err);
        return res.status(err.status || 500).json({
            success: false,
            message: err.message || "Internal server error",
        });
    }
}