// import jwt from "jsonwebtoken";

// export const generateToken = (user) => {
//     return jwt.sign(
//         {
//             id: user.id,
//             role: user.role,
//             username: user.username,
//         },
//         process.env.JWT_SECRET,
//         {
//             expiresIn: process.env.JWT_EXPIRES_IN || "7d",
//         }
//     );
// };



import jwt from "jsonwebtoken";

export const generateToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );
};

