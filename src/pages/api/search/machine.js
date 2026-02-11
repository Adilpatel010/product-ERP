import { searchMachine } from "@/services/machine.service";


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

        const machine = await searchMachine(search);

        /* ================= RESPONSE ================= */
        return res.status(200).json({
            success: true,
            message: "Machine fetched successfully",
            data: machine,
        });

    } catch (error) {
        console.error("Machine Search Error:", error);

        return res.status(500).json({
            success: false,
            message: "Server error",
            data: [],
        });
    }
}
