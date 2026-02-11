import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

/* ================= GET USERS ================= */
export const getAllUsers = async ({ page, limit, search, userId, userRole }) => {
  const skip = (page - 1) * limit;

  const whereCondition = {
  
    ...(userRole === "user" && {
      created_by: userId,
    }),
    is_deleted: false,
    ...(search && {
      user_name: {
        contains: search,
      },
    }),
  };

  const total = await prisma.user.count({
    where: whereCondition,
  });

  const data = await prisma.user.findMany({
    where: whereCondition,
    orderBy: { created_at: "desc" },
    skip,
    take: limit,
    select: {
      id: true,
      user_name: true,
      role: true,
      permitted_modules: true,
      created_by: true,
      updated_by: true,
    },
  });

  /* ================= COLLECT USER IDS ================= */
  const userIds = [
    ...new Set(
      data.flatMap(r => [r.created_by, r.updated_by]).filter(Boolean)
    ),
  ];

  /* ================= FETCH USERS FROM BOTH TABLES ================= */
  const [users, superUsers] = await Promise.all([
    prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        user_name: true,
        role: true,
      },
    }),

    prisma.superUser.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        username: true,
        role: true,
      },
    }),
  ]);

  /* ================= MERGE USERS ================= */
  const userMap = {};

  users.forEach(u => {
    userMap[u.id] = {
      username: u.user_name,
      role: u.role,
      type: "user",
    };
  });

  superUsers.forEach(u => {
    userMap[u.id] = {
      username: u.username,
      role: u.role,
      type: "superuser",
    };
  });

  /* ================= FINAL RESPONSE ================= */
  const response = data.map(row => ({
    id: row.id,
    user_name: row.user_name,
    role: row.role,
    permitted_modules: row.permitted_modules,

    created_by: userMap[row.created_by] || null,
    updated_by: userMap[row.updated_by] || null,
  }));

  return {
    response,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/* ================= CREATE USER ================= */
export const createUser = async ({
  user_name,
  password,
  permitted_modules,
  userId,
}) => {

  /* ================= AUTH ================= */
  if (!userId) {
    throw { status: 401, message: "Unauthorized" };
  }

  const username = user_name?.trim().toLowerCase();

  if (!username) {
    throw { status: 400, message: "Username is required" };
  }

  if (!password) {
    throw { status: 400, message: "Password is required" };
  }

  if (password.length < 6) {
    throw {
      status: 400,
      message: "Password must be at least 6 characters",
    };
  }

  if (!Array.isArray(permitted_modules) || permitted_modules.length === 0) {
    throw {
      status: 400,
      message: "At least one module is required",
    };
  }

  /* ================= CHECK EXISTING ================= */
  const existingUser = await prisma.user.findFirst({
    where: {
      user_name: username,
    },
  });

  if (existingUser && existingUser.is_deleted === false) {
    throw {
      status: 409,
      message: "User already exists",
    };
  }

  if (existingUser && existingUser.is_deleted === true) {
    const password_hash = await bcrypt.hash(password, 10);

    return await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        password_hash,
        permitted_modules: JSON.stringify(permitted_modules),
        is_deleted: false,
        created_by: userId,
        updated_by: userId,
      },
    });
  }

  /* ================= CREATE NEW ================= */
  const password_hash = await bcrypt.hash(password, 10);

  return await prisma.user.create({
    data: {
      user_name: username,
      password_hash,
      permitted_modules: JSON.stringify(permitted_modules),
      created_by: userId,
      updated_by: userId,
    },
  });
};

/* ================= UPDATE USER ================= */
export const updateUser = async ({
  id,
  user_name,
  password,
  permitted_modules,
  userId,
}) => {

  /* ================= AUTH ================= */
  if (!userId) {
    throw { status: 401, message: "Unauthorized" };
  }

  /* ================= ID ================= */
  if (!id) {
    throw { status: 400, message: "User id is required" };
  }

  if (!user_name || !user_name.trim()) {
    throw { status: 400, message: "Username is required" };
  }

  const username = user_name.trim().toLowerCase();

  /* ================= CURRENT USER ================= */
  const currentUser = await prisma.user.findFirst({
    where: {
      id,
      is_deleted: false,
    },
  });

  if (!currentUser) {
    throw { status: 404, message: "User not found" };
  }

  /* ================= ACTIVE DUPLICATE ================= */
  const activeUser = await prisma.user.findFirst({
    where: {
      user_name: username,
      is_deleted: false,
      NOT: { id },
    },
  });

  if (activeUser) {
    throw {
      status: 409,
      message: "Username already exists",
    };
  }

  /* ================= DELETED USER ================= */
  const deletedUser = await prisma.user.findFirst({
    where: {
      user_name: username,
      is_deleted: true,
    },
  });

  if (deletedUser) {
    // delete current user
    await prisma.user.update({
      where: { id },
      data: {
        is_deleted: true,
        updated_by: userId,
      },
    });

    // restore old user
    return await prisma.user.update({
      where: { id: deletedUser.id },
      data: {
        is_deleted: false,
        permitted_modules:
          permitted_modules !== undefined
            ? JSON.stringify(permitted_modules)
            : deletedUser.permitted_modules,
        updated_by: userId,
      },
    });
  }

  /* ================= NORMAL UPDATE ================= */
  const updateData = {
    user_name: username,
    updated_by: userId,
  };

  if (permitted_modules !== undefined) {
    if (!Array.isArray(permitted_modules) || permitted_modules.length === 0) {
      throw {
        status: 400,
        message: "At least one module is required",
      };
    }

    updateData.permitted_modules = JSON.stringify(permitted_modules);
  }

  if (password) {
    if (password.length < 6) {
      throw {
        status: 400,
        message: "Password must be at least 6 characters",
      };
    }

    updateData.password_hash = await bcrypt.hash(password, 10);
  }

  return await prisma.user.update({
    where: { id },
    data: updateData,
  });
};

/* ================= DELETE USER (SOFT DELETE) ================= */
export const deleteUser = async ({ id, userId }) => {
  if (!id) {
    throw {
      status: 400,
      message: "User id is required",
    };
  }

  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user || user.is_deleted) {
    throw {
      status: 404,
      message: "User not found",
    };
  }

  await prisma.user.update({
    where: { id },
    data: {
      is_deleted: true,
      deleted_by: userId,
    },
  });

  return id;
};

/* ================= GET USER BY ID ================= */
export const getUserById = async ({ id }) => {
  if (!id) {
    throw {
      status: 400,
      message: "User id is required",
    };
  }

  const user = await prisma.user.findFirst({
    where: {
      id,
      is_deleted: false,
    },
    select: {
      id: true,
      user_name: true,
      role: true,
      permitted_modules: true,
      created_at: true,
    },
  });

  if (!user) {
    throw {
      status: 404,
      message: "User not found",
    };
  }

  return user;
};

// REQUIRED MODULES
const REQUIRED_MODULES = [
  "packing-inward",
  "packing-outward",
  "packing-fitter",
];

export const getUserByPermission = async () => {
  const users = await prisma.user.findMany({
    where: {
      is_deleted: false,
    },
    select: {
      id: true,
      user_name: true,
      permitted_modules: true,
    },
  });

  const filteredUsers = users.filter((u) => {
    if (!u.permitted_modules) return false;

    let modules = [];

    try {
      modules = JSON.parse(u.permitted_modules);
    } catch {
      return false;
    }


    // ["packing-inward"] OR [{ module_key: "packing-inward" }]

    const moduleKeys = modules.map((m) =>
      typeof m === "string" ? m : m.module_key
    );

    // user must have ALL required modules
    return REQUIRED_MODULES.every((req) =>
      moduleKeys.includes(req)
    );
  });

  return filteredUsers.map((u) => ({
    id: u.id,
    name: u.user_name,
  }));
};

