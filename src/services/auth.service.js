import { compare, hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { generateToken } from "@/utils/jwt";

/* ================= LOGIN ================= */
export const loginUser = async ({ username, password }) => {
  if (!username || !password) {
    throw { status: 400, message: "Username and password are required" };
  }

  /* ===== SUPER ADMIN ===== */
  const superUser = await prisma.superUser.findUnique({
    where: { username },
  });

  if (superUser) {
    const isMatch = await compare(password, superUser.password_hash);

    if (!isMatch) {
      throw { status: 401, message: "Invalid username or password" };
    }

    const token = generateToken({
      id: superUser.id,
      role: "superAdmin",
      username: superUser.username,
      permitted_modules: ["*"],
    });

    return {
      user: {
        id: superUser.id,
        username: superUser.username,
        role: "superAdmin",
        permitted_modules: ["*"],
      },
      token,
    };




    // return {
    //   user: {
    //     id: superUser.id,
    //     username: superUser.username,
    //     role: "superAdmin",
    //     permitted_modules: "ALL",
    //   },
    //   token,
    // };
  }

  /* ===== NORMAL USER ===== */
  const user = await prisma.user.findFirst({
    where: {
      user_name: username,
      is_deleted: false,
    },
  });

  if (!user) {
    throw { status: 401, message: "Invalid username or password" };
  }

  const isMatch = await compare(password, user.password_hash);

  if (!isMatch) {
    throw { status: 401, message: "Invalid username or password" };
  }


  const token = generateToken({
    id: user.id,
    role: "user",
    username: user.user_name,
    permitted_modules: JSON.parse(user.permitted_modules || "[]"),
  });

  return {
    user: {
      id: user.id,
      username: user.user_name,
      role: "user",
      permitted_modules: JSON.parse(user.permitted_modules || "[]"),
    },
    token,
  };

  // const token = generateToken({
  //   id: user.id,
  //   role: "user",
  // });

  // return {
  //   user: {
  //     id: user.id,
  //     username: user.user_name,
  //     role: "user",
  //     permitted_modules: JSON.parse(user.permitted_modules || "[]"),
  //   },
  //   token,
  // };
};

/* ================= REGISTER ================= */
export const registerUser = async ({ username, password }) => {
  if (!username || !password) {
    throw { status: 400, message: "Username and password are required" };
  }



  const existingUser = await prisma.superUser.findUnique({
    where: { username },
  });

  if (existingUser) {
    throw { status: 409, message: "Username already exists" };
  }

  const password_hash = await hash(password, 10);

  return prisma.superUser.create({
    data: {
      username,
      password_hash,
    },
  });
};

/* ================= CHANGE PASSWORD ================= */
export const changePassword = async ({ userId, role, currentPassword, newPassword }) => {
  let user = null;
  let isSuperAdmin = false;

  // Check if user is SuperAdmin or regular User
  if (role === "superAdmin") {
    isSuperAdmin = true;
    user = await prisma.superUser.findUnique({
      where: { id: userId },
    });
  } else {
    user = await prisma.user.findUnique({
      where: { id: userId },
    });
  }

  if (!user) {
    throw { status: 404, message: "User not found" };
  }

  // Verify current (old) password
  const isMatch = await compare(currentPassword, user.password_hash);
  if (!isMatch) {
    throw { status: 401, message: "Current password incorrect" };
  }

  // Hash new password
  const hashedPassword = await hash(newPassword, 10);

  // Update password in the correct table
  if (isSuperAdmin) {
    await prisma.superUser.update({
      where: { id: user.id },
      data: { password_hash: hashedPassword },
    });
  } else {
    await prisma.user.update({
      where: { id: user.id },
      data: { password_hash: hashedPassword },
    });
  }

  return { message: "Password updated successfully" };
};
