import { searchSupplier } from "@/services/supplier.service";

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

        /* ================= FETCH SUPPLIERS ================= */
        const suppliers = await searchSupplier(search);

        /* ================= RESPONSE ================= */
        return res.status(200).json({
            success: true,
            message: "Suppliers fetched successfully",
            data: suppliers,
        });

    } catch (error) {
        console.error("Supplier Search Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error",
            data: [],
        });
    }
}
