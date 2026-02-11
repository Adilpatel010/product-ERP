// import { getUserFromRequest } from "@/lib/auth";
// import {
//     getMapperById,
//     updateMapper,
//     deleteMapper,
// } from "@/services/mapper.service";

// export default async function handler(req, res) {
//     try {

//         const allowedMethods = ["GET", "PUT", "DELETE"];

//         if (!allowedMethods.includes(req.method)) {
//             return res.status(405).json({
//                 success: false,
//                 message: "Method not allowed",
//             });
//         }

//         // ---------------- AUTH ----------------
//         const user = getUserFromRequest(req);

//         if (!user) {
//             return res.status(401).json({
//                 success: false,
//                 message: "Unauthorized",
//             });
//         }

//         const { id } = req.query;

//         /* ================= GET BY ID ================= */
//         if (req.method === "GET") {
//             const mapper = await getMapperById(id);

//             return res.status(200).json({
//                 success: true,
//                 message: "Mapper fetched successfully",
//                 data: mapper,
//             });
//         }

//         /* ================= UPDATE ================= */
//         if (req.method === "PUT") {
//             const mapper = await updateMapper({
//                 id,
//                 userId: user.id,
//                 body: req.body,
//             });

//             return res.status(200).json({
//                 success: true,
//                 message: "Mapper updated successfully",
//                 data: mapper,
//             });
//         }

//         /* ================= DELETE ================= */
//         if (req.method === "DELETE") {
//             await deleteMapper({
//                 id,
//                 userId: user.id,
//             });

//             return res.status(200).json({
//                 success: true,
//                 message: "Mapper deleted successfully",
//             });
//         }

//     } catch (err) {
//         console.error("Mapper id API error:", err);

//         return res.status(err.status || 500).json({
//             success: false,
//             message: err.message || "Internal server error",
//         });
//     }
// }


import { getUserFromRequest } from "@/lib/auth";
import {
    getMapperById,
    updateMapper,
    deleteMapper,
    getMapperRateByProductAndUser,
} from "@/services/mapper.service";

export default async function handler(req, res) {
    try {
        const allowedMethods = ["GET", "PUT", "DELETE"];

        if (!allowedMethods.includes(req.method)) {
            return res.status(405).json({
                success: false,
                message: "Method not allowed",
            });
        }

        // ---------------- AUTH ----------------
        const user = getUserFromRequest(req);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const { id } = req.query;
   

        /* ================= GET MAPPER BY ID ================= */
        if (req.method === "GET") {
            const mapper = await getMapperById(id);

            return res.status(200).json({
                success: true,
                message: "Mapper fetched successfully",
                data: mapper,
            });
        }

        /* ================= UPDATE ================= */
        if (req.method === "PUT") {
            const mapper = await updateMapper({
                id,
                userId: user.id,
                body: req.body,
            });

            return res.status(200).json({
                success: true,
                message: "Mapper updated successfully",
                data: mapper,
            });
        }

        /* ================= DELETE ================= */
        if (req.method === "DELETE") {
            await deleteMapper({
                id,
                userId: user.id,
            });

            return res.status(200).json({
                success: true,
                message: "Mapper deleted successfully",
            });
        }
    } catch (err) {
        console.error("Mapper id API error:", err);

        return res.status(err.status || 500).json({
            success: false,
            message: err.message || "Internal server error",
        });
    }
}
