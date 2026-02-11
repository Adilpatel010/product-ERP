import { getUserFromRequest } from "@/lib/auth";
import { createPackingPayment, getAllPackingPayment } from "@/services/packingPayment.service";

export default async function handler(req, res) {
    try {
        const user = getUserFromRequest(req);
        if (!user) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        /* ================= GET ALL PACKING PAYMENTS ================= */
        if (req.method === "GET") {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const search = (req.query.search || "").trim();
            const fromDate = req.query.fromDate || "";
            const toDate = req.query.toDate || "";

            const result = await getAllPackingPayment({
                page,
                limit,
                search,
                fromDate,
                toDate
            });

            return res.status(200).json({
                success: true,
                message: "Payments fetched successfully",
                data: result.response,
                pagination: result.pagination,
            });
        }
        /* ================= CREATE PACKING PAYMENT (POST) ================= */
        if (req.method === "POST") {
            const payment = await createPackingPayment({
                body: req.body,
                userId: user.id,
            });

            return res.status(201).json({
                success: true,
                message: "Payment created successfully",
                data: payment,
            });
        }

    } catch (err) {
        console.error("API ERROR:", err);
        return res.status(err.status || 500).json({
            success: false,
            message: err.message || "Internal server error",
        });
    }
}