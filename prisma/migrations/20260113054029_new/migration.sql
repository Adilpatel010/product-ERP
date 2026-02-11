-- CreateTable
CREATE TABLE `super_user` (
    `id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `password_hash` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'superAdmin',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `super_user_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(36) NOT NULL,
    `user_name` VARCHAR(100) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `permitted_modules` LONGTEXT NULL,
    `role` VARCHAR(200) NOT NULL DEFAULT 'user',
    `created_by` VARCHAR(36) NOT NULL,
    `updated_by` VARCHAR(36) NOT NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `deleted_by` VARCHAR(36) NULL,

    UNIQUE INDEX `users_user_name_key`(`user_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `modules` (
    `id` VARCHAR(36) NOT NULL,
    `module_key` VARCHAR(100) NOT NULL,
    `module_name` VARCHAR(255) NOT NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    UNIQUE INDEX `module_key`(`module_key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `supplier` (
    `id` VARCHAR(191) NOT NULL,
    `supplier_name` VARCHAR(191) NOT NULL,
    `contact` VARCHAR(191) NOT NULL,
    `address` VARCHAR(255) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `created_by` VARCHAR(36) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_by` VARCHAR(36) NULL,
    `updated_at` DATETIME(3) NOT NULL,
    `deleted_by` VARCHAR(36) NULL,
    `deleted_at` DATETIME(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `raw_product` (
    `id` VARCHAR(36) NOT NULL,
    `product_name` VARCHAR(255) NOT NULL,
    `sku` VARCHAR(100) NOT NULL,
    `description` VARCHAR(500) NULL,
    `opening_stock` INTEGER NOT NULL DEFAULT 0,
    `rate` DOUBLE NOT NULL DEFAULT 0,
    `created_by` VARCHAR(36) NOT NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_by` VARCHAR(36) NULL,
    `updated_at` DATETIME(0) NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `deleted_by` VARCHAR(36) NULL,
    `deleted_at` DATETIME(0) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `raw_product_sku_key`(`sku`),
    INDEX `raw_product_product_name_idx`(`product_name`),
    INDEX `raw_product_sku_idx`(`sku`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `raw_inward` (
    `id` VARCHAR(36) NOT NULL,
    `supplier_id` VARCHAR(36) NOT NULL,
    `inward_date` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `remark` VARCHAR(500) NULL,
    `created_by` VARCHAR(36) NOT NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_by` VARCHAR(36) NULL,
    `updated_at` DATETIME(0) NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `deleted_by` VARCHAR(36) NULL,
    `deleted_at` DATETIME(0) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `raw_inward_Products` (
    `id` VARCHAR(36) NOT NULL,
    `raw_inward_id` VARCHAR(36) NOT NULL,
    `product_id` VARCHAR(36) NOT NULL,
    `qty` INTEGER NOT NULL DEFAULT 0,
    `unit` ENUM('kg', 'pcs', 'gross') NOT NULL DEFAULT 'kg',
    `rate` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `total` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `raw_outward` (
    `id` VARCHAR(36) NOT NULL,
    `outward_date` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `remark` VARCHAR(500) NULL,
    `created_by` VARCHAR(36) NOT NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_by` VARCHAR(36) NULL,
    `updated_at` DATETIME(0) NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `deleted_by` VARCHAR(36) NULL,
    `deleted_at` DATETIME(0) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `raw_outward_Products` (
    `id` VARCHAR(36) NOT NULL,
    `raw_outward_id` VARCHAR(36) NOT NULL,
    `product_id` VARCHAR(36) NOT NULL,
    `qty` INTEGER NOT NULL DEFAULT 0,
    `unit` ENUM('kg', 'pcs', 'gross') NOT NULL DEFAULT 'kg',
    `rate` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `total` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `machine` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(250) NOT NULL,
    `description` VARCHAR(500) NULL,
    `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `created_by` VARCHAR(36) NOT NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_by` VARCHAR(36) NULL,
    `updated_at` DATETIME(0) NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `deleted_by` VARCHAR(36) NULL,
    `deleted_at` DATETIME(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(250) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `working` (
    `id` VARCHAR(191) NOT NULL,
    `machine_id` VARCHAR(191) NOT NULL,
    `date` DATETIME(3) NOT NULL,
    `description` VARCHAR(191) NULL,
    `created_by` VARCHAR(36) NOT NULL,
    `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_by` VARCHAR(36) NULL,
    `updated_at` DATETIME(0) NULL,
    `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    `deleted_by` VARCHAR(36) NULL,
    `deleted_at` DATETIME(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `working_item` (
    `id` VARCHAR(191) NOT NULL,
    `working_id` VARCHAR(191) NOT NULL,
    `product_id` VARCHAR(191) NOT NULL,
    `qty_in_bag` INTEGER NOT NULL,
    `qty_in_kg` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `electricity_unit` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `total` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `raw_inward` ADD CONSTRAINT `raw_inward_supplier_id_fkey` FOREIGN KEY (`supplier_id`) REFERENCES `supplier`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `raw_inward_Products` ADD CONSTRAINT `raw_inward_Products_raw_inward_id_fkey` FOREIGN KEY (`raw_inward_id`) REFERENCES `raw_inward`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `raw_inward_Products` ADD CONSTRAINT `raw_inward_Products_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `raw_product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `raw_outward_Products` ADD CONSTRAINT `raw_outward_Products_raw_outward_id_fkey` FOREIGN KEY (`raw_outward_id`) REFERENCES `raw_outward`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `raw_outward_Products` ADD CONSTRAINT `raw_outward_Products_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `raw_product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `working` ADD CONSTRAINT `working_machine_id_fkey` FOREIGN KEY (`machine_id`) REFERENCES `machine`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `working_item` ADD CONSTRAINT `working_item_working_id_fkey` FOREIGN KEY (`working_id`) REFERENCES `working`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `working_item` ADD CONSTRAINT `working_item_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
