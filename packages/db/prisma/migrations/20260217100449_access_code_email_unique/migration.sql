/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `AccessCode` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "AccessCode_email_key" ON "AccessCode"("email");
