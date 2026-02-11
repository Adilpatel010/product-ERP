import { getUserFromRequest } from "@/lib/auth";
import { getAllExpectation } from "@/services/expectation.service";

export default async function handler(req, res) {
  try {
    const user = getUserFromRequest(req);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (req.method === "GET") {
      const {
        page = 1,
        limit = 10,
        search = "",
      } = req.query;

      const result = await getAllExpectation({
        page: Number(page),
        limit: Number(limit),
        search,
        userId: user.id,
        userRole: user.role,
      });

      return res.status(200).json({
        success: true,
        message: "Expectation fetched successfully",
        data: result.response,
        pagination: result.pagination,
      });
    }

    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  } catch (error) {
    console.error("Expectation API error:", error);

    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
}
