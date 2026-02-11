import { getUserFromRequest } from "@/lib/auth";
import {
  getAllPackingOutward,
  createPackingOutward,
} from "@/services/packingOutward.service";

export default async function handler(req, res) {
  try {
    const allowedMethods = ["GET", "POST"];

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

    /* ================= GET ALL PACKING OUTWARD ================= */
    if (req.method === "GET") {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const search = (req.query.search || "").trim();

      const result = await getAllPackingOutward({
        page,
        limit,
        search,
        userId: user.id,
        userRole: user.role,
      });

      return res.status(200).json({
        success: true,
        message: "Packing outward fetched successfully",
        data: result.response,
        pagination: result.pagination,
      });
    }

    /* ================= CREATE PACKING OUTWARD ================= */
    if (req.method === "POST") {
      const packing = await createPackingOutward({
        body: req.body,
        userId: user.id,
      });

      return res.status(201).json({
        success: true,
        message: "Packing outward created successfully",
        data: packing,
      });
    }
  } catch (err) {
    console.error("PackingOutward API error:", err);

    return res.status(err.status || 500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
}
