// import { getUserFromRequest } from "@/lib/auth";
// import { createUser, getAllUsers } from "@/services/user.service";

// export const config = {
//     api: { bodyParser: true },
// };

// export default async function handler(req, res) {
//     try {
//         const allowedMethods = ["GET", "POST"];
//         if (!allowedMethods.includes(req.method)) {
//             return res.status(405).json({ success: false, message: "Method not allowed" });
//         }

//         /* ===== AUTH (SAFE) ===== */
//         let authUser;
//         try {
//             authUser = getUserFromRequest(req);
//         } catch (err) {
//             console.error("Auth error:", err);
//             return res.status(401).json({ success: false, message: "Unauthorized" });
//         }

//         if (!authUser || !authUser.id) {
//             return res.status(401).json({ success: false, message: "Unauthorized" });
//         }

//         /* ===== GET USERS ===== */
//         if (req.method === "GET") {
//             const page = Number(req.query.page) || 1;
//             const limit = Number(req.query.limit) || 10;
//             const search = (req.query.search || "").trim();

//             const result = await getAllUsers({ page, limit, search });

//             return res.status(200).json({
//                 success: true,
//                 message: "Users fetched successfully",
//                 data: result.response,
//                 pagination: result.pagination,
//             });
//         }

//         /* ===== CREATE USER ===== */
//         if (req.method === "POST") {
//             const { user_name, password, permitted_modules } = req.body;

//             const newUser = await createUser({
//                 user_name: user_name.trim(),
//                 password,
//                 permitted_modules,
//                 userId: authUser.id,
//             });

//             return res.status(201).json({
//                 success: true,
//                 message: "User created successfully",
//                 data: newUser,
//             });
//         }
//     } catch (err) {
//         console.error("User API error:", err);
//         return res.status(err.status || 500).json({
//             success: false,
//             message: err.message || "Internal server error",
//         });
//     }
// }


import { getUserFromRequest } from "@/lib/auth";
import { createUser, getAllUsers, getUserByPermission } from "@/services/user.service";

export const config = {
  api: { bodyParser: true },
};

export default async function handler(req, res) {
  try {
    const allowedMethods = ["GET", "POST"];
    if (!allowedMethods.includes(req.method)) {
      return res.status(405).json({
        success: false,
        message: "Method not allowed",
      });
    }

    /* ===== AUTH ===== */
    let authUser;
    try {
      authUser = getUserFromRequest(req);
    } catch {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!authUser?.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    /* ===========================
       GET
       =========================== */
    if (req.method === "GET") {
      const type = req.query.type || "";

      if (type === "permission") {
        const users = await getUserByPermission();

        return res.status(200).json({
          success: true,
          message: "Permission users fetched successfully",
          data: users,
        });
      }

      // normal user list
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const search = (req.query.search || "").trim();

      const result = await getAllUsers({
        page,
        limit,
        search,
        userId: authUser.id,
        userRole: authUser.role,
      });

      return res.status(200).json({
        success: true,
        message: "Users fetched successfully",
        data: result.response,
        pagination: result.pagination,
      });
    }

    /* ===========================
       POST
       =========================== */
    if (req.method === "POST") {
      const { user_name, password, permitted_modules } = req.body;

      const newUser = await createUser({
        user_name: user_name.trim(),
        password,
        permitted_modules,
        userId: authUser.id,
      });

      return res.status(201).json({
        success: true,
        message: "User created successfully",
        data: newUser,
      });
    }
  } catch (err) {
    console.error("User API error:", err);

    return res.status(err.status || 500).json({
      success: false,
      message: err.message || "Internal server error",
    });
  }
}
