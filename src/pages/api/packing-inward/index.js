import { getUserFromRequest } from "@/lib/auth";
import { createPackingInward, getAllPackingInward } from "@/services/packingInward.service";

export default async function handler(req, res) {
  try {
    const allowedMethods = ["GET", "POST", "PUT"];

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

      const result = await getAllPackingInward({
        page,
        limit,
        search,
        userId: user.id,
        userRole: user.role,
      });

      return res.status(200).json({
        success: true,
        message: "Packing inward fetched successfully",
        data: result.response,
        pagination: result.pagination,
      });
    }

    // update
    if (req.method === "PUT") {
      const packing = await createPackingInward({
        body: req.body,
        userId: user.id,
        userRole: user.role,
      });

      return res.status(201).json({
        success: true,
        message: "Packing inward updated successfully",
        data: packing,
      });
    }


  } catch (err) {
    console.error("Packing inward API error:", err);

    return res.status(err.status || 500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
}
