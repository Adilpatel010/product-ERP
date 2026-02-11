/*
  Warnings:

  - You are about to drop the column `name` on the `product` table. All the data in the column will be lost.
  - Added the required column `color` to the `product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `created_by` to the `product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `product_name` to the `product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `product` DROP COLUMN `name`,
    ADD COLUMN `bag_weight_kg` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    ADD COLUMN `color` VARCHAR(100) NOT NULL,
    ADD COLUMN `color_type` ENUM('all', 'custom') NOT NULL DEFAULT 'all',
    ADD COLUMN `created_at` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    ADD COLUMN `created_by` VARCHAR(36) NOT NULL,
    ADD COLUMN `deleted_at` DATETIME(0) NULL,
    ADD COLUMN `deleted_by` VARCHAR(36) NULL,
    ADD COLUMN `gurus_weight_gm` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `is_deleted` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `lot_in_bag` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `lot_in_kg` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    ADD COLUMN `pcs_in_gurus` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `product_name` VARCHAR(250) NOT NULL,
    ADD COLUMN `total_gurus_lot` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    ADD COLUMN `updated_at` DATETIME(0) NULL,
    ADD COLUMN `updated_by` VARCHAR(36) NULL;
