import { loginUser } from "@/services/auth.service";
import { setAuthCookie } from "@/utils/cookies";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ message: "Method not allowed" });
    }

    try {
        const { username, password_hash } = req.body || {};
        const { user, token } = await loginUser({
            username,
            password: password_hash,
        });

        res.setHeader("Set-Cookie", setAuthCookie(token));

        return res.status(200).json({
            message: "Login successful",
            user: {
                id: user.id,
                username: user.username,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
            token,
        });
    } catch (err) {
        return res.status(err.status || 500).json({
            message: err.message || "Server error",
        });
    }
}
