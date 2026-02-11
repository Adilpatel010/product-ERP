import { getUserFromRequest } from "@/lib/auth";
import { createMachine, getAllMachines } from "@/services/machine.service";

export const config = {
  api: { bodyParser: true },
};

export default async function handler(req, res) {
  try {
    const allowedMethods = ["GET", "POST"];
    if (!allowedMethods.includes(req.method)) {
      return res
        .status(405)
        .json({ success: false, message: "Method not allowed" });
    }

    /* ===== AUTH ===== */
    const authUser = getUserFromRequest(req);
    if (!authUser?.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    /* ===== GET MACHINES ===== */
    if (req.method === "GET") {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const search = (req.query.search || "").trim();

      const result = await getAllMachines({ page, limit, search });

      return res.status(200).json({
        success: true,
        message: "Machines fetched successfully",
        data: result.data,
        pagination: result.pagination,
      });
    }

    /* ===== CREATE MACHINE ===== */
    if (req.method === "POST") {
      const { name, description, status } = req.body;

      const newMachine = await createMachine({
        name: name.trim(),
        description: description || null,
        status: status || "active",
        created_by: authUser.id,
      });

      return res.status(201).json({
        success: true,
        message: "Machine created successfully",
        data: newMachine,
      });
    }
  } catch (err) {
    console.error("Machine API error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
