/*
  Warnings:

  - You are about to drop the `Letter` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Patient` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Report` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Settings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TestResult` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "TestStatus" AS ENUM ('NORMAL', 'HIGH', 'LOW', 'CRITICAL');

-- DropForeignKey
ALTER TABLE "Letter" DROP CONSTRAINT "Letter_nhs_number_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_patientId_fkey";

-- DropForeignKey
ALTER TABLE "TestResult" DROP CONSTRAINT "TestResult_reportId_fkey";

-- DropTable
DROP TABLE "Letter";

-- DropTable
DROP TABLE "Patient";

-- DropTable
DROP TABLE "Report";

-- DropTable
DROP TABLE "Settings";

-- DropTable
DROP TABLE "TestResult";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "patients" (
    "id" TEXT NOT NULL,
    "nhs_number" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date_of_birth" TIMESTAMP(3) NOT NULL,
    "gp_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "letters" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "letters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_results" (
    "id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "test_name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "unit" TEXT,
    "reference_range" TEXT NOT NULL,
    "status" "TestStatus" NOT NULL,
    "meaning" TEXT NOT NULL,
    "analyzed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "test_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "patients_nhs_number_key" ON "patients"("nhs_number");

-- CreateIndex
CREATE UNIQUE INDEX "letters_patient_id_key" ON "letters"("patient_id");

-- CreateIndex
CREATE INDEX "test_results_patient_id_idx" ON "test_results"("patient_id");

-- CreateIndex
CREATE UNIQUE INDEX "test_results_patient_id_test_name_key" ON "test_results"("patient_id", "test_name");

-- AddForeignKey
ALTER TABLE "letters" ADD CONSTRAINT "letters_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_results" ADD CONSTRAINT "test_results_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
