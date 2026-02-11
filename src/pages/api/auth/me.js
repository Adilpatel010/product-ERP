export const runtime = "nodejs";

import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import cookie from "cookie";

export default async function handler(req, res) {
  try {
    const cookies = cookie.parse(req.headers.cookie || "");
    const token = cookies.auth_token;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded?.id || !decoded?.role) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    /* ================= SUPER ADMIN ================= */
    if (decoded.role === "superAdmin") {
      const superUser = await prisma.superUser.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          username: true,
        },
      });

      if (!superUser) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.status(200).json({
        user: {
          ...superUser,
          role: "superAdmin",
          permitted_modules: null,
        },
      });
    }

    /* ================= NORMAL USER ================= */
    if (decoded.role === "user") {
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          user_name: true,
          permitted_modules: true,
        },
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.status(200).json({
        user: {
          id: user.id,
          username: user.user_name,
          role: "user",
          permitted_modules: JSON.parse(user.permitted_modules || "[]"),
        },
      });
    }

    return res.status(401).json({ message: "Invalid role" });
  } catch (err) {
    console.error("AUTH ERROR =>", err);
    return res.status(401).json({ message: "Invalid token" });
  }
}