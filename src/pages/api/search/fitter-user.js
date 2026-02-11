// pages/api/search/fitter-user.js
import { getUserFromRequest } from "@/lib/auth";
import { searchPackingUser } from "@/services/packingOutward.service";

export default async function handler(req, res) {
  try {
    const { search = "" } = req.query;

    const user = getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const users = await searchPackingUser(search, user);

    return res.status(200).json({
      success: true,
      data: users.map(u => ({
        id: u.id,
        name: u.user_name,
      })),
    });
  } catch (err) {
    console.log("Fitter search error:", err);
    return res.status(500).json({
      success: false,
      data: [],
    });
  }
}
