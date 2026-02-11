import { prisma } from "@/lib/prisma";

/* ===== CREATE MACHINE ===== */
export const createMachine = async ({
  name,
  description,
  status,
  created_by,
}) => {
  return prisma.machine.create({
    data: {
      name,
      description,
      status,
      created_by,
    },
  });
};


/* ===== GET ALL MACHINES ===== */
export const getAllMachines = async ({ page, limit, search }) => {
  const skip = (page - 1) * limit;

  const where = {
    is_deleted: false,
    ...(search && {
      name: {
        contains: search,
      },
    }),
  };

  const [data, total] = await Promise.all([
    prisma.machine.findMany({
      where,
      skip,
      take: limit,
      orderBy: { created_at: "desc" },
    }),
    prisma.machine.count({ where }),
  ]);

  return {
    data,
    pagination: {
      total,
      totalPages: Math.ceil(total / limit),
      page,
      limit,
    },
  };
};


// ===========deleteMachine============

export const deleteMachine = async ({ id, userId }) => {
  return prisma.machine.update({
    where: { id },
    data: {
      is_deleted: true,
      deleted_by: userId,
      deleted_at: new Date(),
    },
  });
};



export const getMachineById = async ({ id }) => {
  return prisma.machine.findFirst({
    where: { id, is_deleted: false },
  });
};


export const updateMachine = async ({ id, name, description, userId }) => {
  return prisma.machine.update({
    where: { id },
    data: {
      name,
      description,
      updated_by: userId,
    },
  });
};


export const toggleMachineStatus = async ({ id, userId }) => {
  const machine = await prisma.machine.findUnique({ where: { id } });

  if (!machine) throw new Error("Machine not found");

  return prisma.machine.update({
    where: { id },
    data: {
      status: machine.status === "active" ? "inactive" : "active",
      updated_by: userId,
    },
  });
};


export const searchMachine = async (search) => {
  return prisma.machine.findMany({
    where: {
      is_deleted: false,
      status: "active",

      ...(search && {
        name: {
          contains: search,   // MySQL case-insensitive if collation = utf8mb4_general_ci
        },
      }),
    },
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });
};

