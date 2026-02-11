import jwt from "jsonwebtoken";

export function getUserFromRequest(req) {
    const token = req.cookies?.auth_token;

    if (!token) return null;

    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        return null;
    }
}
