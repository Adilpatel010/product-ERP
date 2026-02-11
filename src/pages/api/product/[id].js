import { getUserFromRequest } from "@/lib/auth";
import { deleteProduct, getProductById, updateProduct } from "@/services/product.service";

export default async function handler(req, res) {
    try {
        const allowedMethods = ["GET", "PUT", "DELETE"];

        if (!allowedMethods.includes(req.method)) {
            return res.status(405).json({
                success: false,
                message: "Method not allowed",
            });
        }

        const user = getUserFromRequest(req);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const { id } = req.query;

        if (req.method === "GET") {
            const product = await getProductById({ id });

            return res.status(200).json({
                success: true,
                message: "Product fetched successfully",
                data: product,
            });
        }

        if (req.method === "DELETE") {
            await deleteProduct({
                id,
                userId: user.id,
            });

            return res.status(200).json({
                success: true,
                message: "Product deleted successfully",
            });
        }

        /* ================= UPDATE ================= */
        if (req.method === "PUT") {
            const product = await updateProduct({
                id: req.query.id,
                body: req.body,
                userId: user.id,
            });

            return res.status(200).json({
                success: true,
                message: "Product updated successfully",
                data: product,
            });
        }
    } catch (err) {
        console.error("Product API error:", err);

        return res.status(err.status || 500).json({
            success: false,
            message: err.message || "Internal server error",
        });
    }
}
