// import { getUserFromRequest } from "@/lib/auth";
// import {
//   createMapper,
//   getAllMappers,
// } from "@/services/mapper.service";

// export default async function handler(req, res) {
//   try {

//     const allowedMethods = ["GET", "POST"];

//     if (!allowedMethods.includes(req.method)) {
//       return res.status(405).json({
//         success: false,
//         message: "Method not allowed",
//       });
//     }

//     // ---------------- AUTH ----------------
//     const user = getUserFromRequest(req);

//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         message: "Unauthorized",
//       });
//     }

//     /* ================= GET ALL MAPPERS ================= */
//     if (req.method === "GET") {

//       const page = Number(req.query.page) || 1;
//       const limit = Number(req.query.limit) || 10;
//       const search = (req.query.search || "").trim();

//       const result = await getAllMappers({
//         page,
//         limit,
//         search,
//       });

//       return res.status(200).json({
//         success: true,
//         message: "Mappers fetched successfully",
//         data: result.response,
//         pagination: result.pagination,
//       });
//     }

//     /* ================= CREATE MAPPER ================= */
//     if (req.method === "POST") {

//       const mapper = await createMapper({
//         userId: user.id,
//         mapper: req.body,
//       });

//       return res.status(201).json({
//         success: true,
//         message: "Mapper created successfully",
//         data: mapper,
//       });
//     }

//   } catch (err) {
//     console.error("Mapper API error:", err);

//     return res.status(err.status || 500).json({
//       success: false,
//       message: err.message || "Internal server error",
//     });
//   }
// }

import { getUserFromRequest } from "@/lib/auth";
import {
  createMapper,
  getAllMappers,
  getMapperRateByProduct,
  getMapperRateByProductAndUser,
} from "@/services/mapper.service";

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

    if (req.method === "GET" && req.query.product_id) {
      const { product_id } = req.query;

      const user = getUserFromRequest(req);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const data = await getMapperRateByProductAndUser({
        product_id,
        user_id: user.id,
      });

      return res.status(200).json({
        success: true,
        data,
      });
    }

    if (req.method === "GET") {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const search = (req.query.search || "").trim();

      const result = await getAllMappers({
        page,
        limit,
        search,
      });

      return res.status(200).json({
        success: true,
        message: "Mappers fetched successfully",
        data: result.response,
        pagination: result.pagination,
      });
    }

    /* ================== CREATE MAPPER ================== */
    if (req.method === "POST") {
      const mapper = await createMapper({
        userId: user.id,
        mapper: req.body,
      });

      return res.status(201).json({
        success: true,
        message: "Mapper created successfully",
        data: mapper,
      });
    }
  } catch (err) {
    console.error("Mapper API error:", err);

    return res.status(500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
}
