import { registerUser } from "@/services/auth.service";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const { username, password_hash } = req.body || {};

    const user = await registerUser({
      username,
      password: password_hash,
    });

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        username: user.username,
      },
    });
  } catch (err) {
    return res.status(err.status || 500).json({
      message: err.message || "Server error",
    });
  }
}
