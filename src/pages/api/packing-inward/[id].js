// import { getUserFromRequest } from "@/lib/auth";
// import {
//   getPackingProductByFitterId,
//   getPackingInwardById,
//   deletePackingInward,
//   updatePackingInward,
// } from "@/services/packingInward.service";

// export default async function handler(req, res) {
//   try {
//     const user = getUserFromRequest(req);

//     if (!user) {
//       return res.status(401).json({
//         success: false,
//         message: "Unauthorized",
//       });
//     }

//     const { id } = req.query;

//     if (!id) {
//       return res.status(400).json({
//         success: false,
//         message: "Id is required",
//       });
//     }

//     if (req.method === "GET") {

//       // try inward first
//       const inward = await getPackingInwardById(id).catch(() => null);

//       if (inward) {
//         return res.status(200).json({
//           success: true,
//           data: inward,
//         });
//       }

//       const outward = await getPackingProductByFitterId(id);

//       return res.status(200).json({
//         success: true,
//         data: outward,
//       });
//     }


//     if (req.method === "DELETE") {
//       const deleted = await deletePackingInward({
//         id,
//         userId: user.id,
//       });

//       return res.status(200).json({
//         success: true,
//         message: "Packing inward deleted successfully",
//         // data: deleted,
//       });
//     }

//     return res.status(405).json({
//       success: false,
//       message: "Method not allowed",
//     });
//   } catch (error) {
//     console.log("Packing inward API error:", error);

//     return res.status(error.status || 500).json({
//       success: false,
//       message: error.message || "Server error",
//     });
//   }
// }

import { getUserFromRequest } from "@/lib/auth";
import {
  getPackingProductByFitterId,
  getPackingInwardById,
  deletePackingInward,
  updatePackingInwardData,
} from "@/services/packingInward.service";

export default async function handler(req, res) {
  try {
    const user = getUserFromRequest(req);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Id is required",
      });
    }

    if (req.method === "GET") {

      // try inward first
      const inward = await getPackingInwardById(id).catch(() => null);

      if (inward) {
        return res.status(200).json({
          success: true,
          data: inward,
        });
      }

      // fallback outward
      const outward = await getPackingProductByFitterId(id);

      return res.status(200).json({
        success: true,
        data: outward,
      });
    }


    if (req.method === "PUT") {
      const updated = await updatePackingInwardData({
        body: {
          ...req.body,
          packing_id: id,
        },
        userId: user.id,
        userRole: user.role,

      });

      return res.status(200).json({
        success: true,
        message: "Packing inward updated successfully",
        data: updated,
      });
    }

    //  ============== DELETE ===============
    if (req.method === "DELETE") {
      await deletePackingInward({
        id,
        userId: user.id,
      });

      return res.status(200).json({
        success: true,
        message: "Packing inward deleted successfully",
      });
    }

    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });

  } catch (error) {
    console.log("Packing inward API error:", error);

    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
}
