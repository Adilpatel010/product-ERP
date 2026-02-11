import { getUserFromRequest } from "@/lib/auth";
import {
  getMachineById,
  updateMachine,
  deleteMachine,
  toggleMachineStatus,
} from "@/services/machine.service";

export default async function handler(req, res) {
  try {
    const allowedMethods = ["GET", "PUT", "DELETE", "PATCH"];
    if (!allowedMethods.includes(req.method)) {
      return res.status(405).json({ success: false, message: "Method not allowed" });
    }

    /* ===== AUTH ===== */
    const user = getUserFromRequest(req);
    if (!user || !user.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { id } = req.query;

    /* ===== GET MACHINE BY ID ===== */
    if (req.method === "GET") {
      const machine = await getMachineById({ id });

      return res.status(200).json({
        success: true,
        message: "Machine fetched successfully",
        data: machine,
      });
    }

    /* ===== UPDATE MACHINE ===== */
    if (req.method === "PUT") {
      const updated = await updateMachine({
        id,
        ...req.body, // name, description
        userId: user.id,
      });

      return res.status(200).json({
        success: true,
        message: "Machine updated successfully",
        data: updated,
      });
    }

    /* ===== TOGGLE STATUS ===== */
    if (req.method === "PATCH") {
      const updated = await toggleMachineStatus({
        id,
        userId: user.id,
      });

      

      return res.status(200).json({
        success: true,
        message: "Status updated successfully",
        data: updated,
      });
    }

    /* ===== DELETE MACHINE (SOFT) ===== */
    if (req.method === "DELETE") {
      await deleteMachine({
        id,
        userId: user.id,
      });

      return res.status(200).json({
        success: true,
        message: "Machine deleted successfully",
        id,
      });
    }
  } catch (err) {
    console.error("Machine API error:", err);

    return res.status(err.status || 500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
}
