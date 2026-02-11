import { getUserFromRequest } from "@/lib/auth";
import {
  getPackingOutwardById,
  deletePackingOutward,
  updatePackingOutward,
} from "@/services/packingOutward.service";

export default async function handler(req, res) {
  try {
    const allowedMethods = ["GET", "DELETE", "PUT"];

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

    /* ================= GET BY ID ================= */
    if (req.method === "GET") {
      const data = await getPackingOutwardById({ id });

      return res.status(200).json({
        success: true,
        message: "Packing outward fetched successfully",
        data,
      });
    }

    /* ================= UPDATE ================= */
    if (req.method === "PUT") {
      const data = await updatePackingOutward({
        id,
        body: req.body,
        userId: user.id,
      });

      return res.status(200).json({
        success: true,
        message: "Packing outward updated successfully",
        data,
      });
    }

    /* ================= DELETE ================= */
    if (req.method === "DELETE") {
      await deletePackingOutward({
        id,
        userId: user.id,
      });

      return res.status(200).json({
        success: true,
        message: "Packing outward deleted successfully",
      });
    }
  } catch (err) {
    console.error("PackingOutward [id] API error:", err);

    return res.status(err.status || 500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
}
