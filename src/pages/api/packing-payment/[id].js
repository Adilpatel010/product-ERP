import { getUserFromRequest } from "@/lib/auth";
import {
  getPackingPaymentById,
  updatePackingPayment,
  deletePackingPayment,
} from "@/services/packingPayment.service";

export default async function handler(req, res) {
  try {
    const user = getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { id } = req.query;

    if (req.method === "GET") {
      const data = await getPackingPaymentById({ id });
      return res.status(200).json({ success: true, data });
    }

    if (req.method === "DELETE") {
      await deletePackingPayment({ id, userId: user.id });
      return res
        .status(200)
        .json({ success: true, message: "Payment deleted successfully" });
    }

    if (req.method === "PUT") {
      const updated = await updatePackingPayment({
        id,
        body: req.body,
        userId: user.id,
      });
      return res.status(200).json({
        success: true,
        message: "Payment updated successfully",
        data: updated,
      });
    }

    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  } catch (err) {
    console.error("API ERROR:", err);
    return res.status(err.status || 500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
}
