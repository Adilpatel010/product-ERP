import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = "admin123";

  const hashedPassword = await bcrypt.hash(password, 10);

  const superAdmin = await prisma.superUser.upsert({
    where: {
      username: "admin",
    },
    update: {
      password_hash: hashedPassword,
      isActive: true,
      role: "superAdmin",
    },
    create: {
      username: "admin",
      password_hash: hashedPassword,
      role: "superAdmin",
      isActive: true,
    },
  });

  console.log("✅ Super admin seeded:", superAdmin.username);

  /* ================= MODULES ================= */
  const modules = [
    {
      module_key: "dashboard",
      module_name: "Dashboard",
    },
    {
      module_key: "supplier",
      module_name: "Supplier",
    },
    {
      module_key: "raw-product",
      module_name: "Raw Product",
    },
    {
      module_key: "raw-inward",
      module_name: "Raw Inward",
    },
    {
      module_key: "raw-outward",
      module_name: "Raw Outward",
    },
    {
      module_key: "molding",
      module_name: "Molding",
    },
    {
      module_key: "user",
      module_name: "User Management",
    },
    {
      module_key: "product",
      module_name: "Product",
    },
    {
      module_key: "packing-inward",
      module_name: "Packing Inward",
    },
    {
      module_key: "packing-outward",
      module_name: "Packing Outward",
    },
    {
      module_key: "packing-fitter",
      module_name: "Packing Fitter",
    },
  ];

  for (const module of modules) {
    await prisma.module.upsert({
      where: {
        module_key: module.module_key,
      },
      update: {
        module_name: module.module_name,
      },
      create: {
        module_key: module.module_key,
        module_name: module.module_name,
      },
    });
  }

  console.log("✅ Modules seeded successfully");

}

main()
  .catch((e) => {
    console.error("❌ Seeder error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
