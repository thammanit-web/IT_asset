-- CreateTable
CREATE TABLE "assets" (
    "id" SERIAL NOT NULL,
    "assetName" VARCHAR(255) NOT NULL,
    "assetID" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "groupType" VARCHAR(100) NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "imgUrl" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "assets_assetID_key" ON "assets"("assetID");
