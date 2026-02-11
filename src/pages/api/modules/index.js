import { getUserFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const user = getUserFromRequest(req);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  try {
    let modules = [];

    // ================= SUPER ADMIN =================
    if (user.role === "superAdmin") {
      modules = await prisma.module.findMany({
        select: {
          id: true,
          module_key: true,
          module_name: true,
        },
        orderBy: {
          module_name: "asc",
        },
      });
    }

    // ================= NORMAL USER =================
    else {
      modules = await prisma.module.findMany({
        where: {
          module_key: {
            in: (user.permitted_modules || []).filter(
              (key) => key !== "user" 
            ),
          },
        },
        select: {
          id: true,
          module_key: true,
          module_name: true,
        },
        orderBy: {
          module_name: "asc",
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: modules,
    });

  } catch (error) {
    console.error("Get Modules Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch modules",
    });
  }
}
