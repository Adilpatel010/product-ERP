import { searchRawProduct } from "@/services/rawProduct.service";

export default async function handler(req, res) {
    try {
        /* ================= METHOD CHECK ================= */
        if (req.method !== "GET") {
            return res.status(405).json({
                success: false,
                message: "Method not allowed",
                data: [],
            });
        }

        /* ================= QUERY ================= */
        const search = (req.query.search || "").trim();

        const products = await searchRawProduct(search);

        /* ================= RESPONSE ================= */
        return res.status(200).json({
            success: true,
            message: "Raw products fetched successfully",
            data: products,
        });

    } catch (error) {
        console.error("Raw Product Search Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error",
            data: [],
        });
    }
}
