/*
  Warnings:

  - A unique constraint covering the columns `[nhs_number,letter]` on the table `Letter` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Letter_nhs_number_letter_key" ON "Letter"("nhs_number", "letter");
