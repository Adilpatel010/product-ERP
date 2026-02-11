import { getUserFromRequest } from "@/lib/auth";
import { searchUser } from "@/services/packingPayment.service";

export default async function handler(req, res) {
  try {
    const { search = "" } = req.query;

    const currentUser = getUserFromRequest(req);
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const users = await searchUser(search, currentUser);

    return res.status(200).json({
      success: true,
      data: users.map((u) => ({
        id: u.id,
        name: u.user_name,
      })),
    });
  } catch (err) {
    console.error("User search error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      data: [],
    });
  }
}