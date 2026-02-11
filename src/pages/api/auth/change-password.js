import cookie from "cookie";
import jwt from "jsonwebtoken";
import { changePassword } from "@/services/auth.service";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }
        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters",
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        const cookies = cookie.parse(req.headers.cookie || "");
        const token = cookies.auth_token;

        if (!token) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        // Verify token to get user ID and role
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Call service to change password
        const result = await changePassword({
            userId: decoded.id,
            role: decoded.role,
            currentPassword,
            newPassword,
        });

        return res.status(200).json(result);
    } catch (err) {
        const status = err.status || 500;
        const message = err.message || "Server error";

        // Only log actual server errors, not client errors like 400/401/404
        if (status >= 500) {
            console.error("CHANGE PASSWORD ERROR:", err);
        }

        return res.status(status).json({ message });
    }
}
