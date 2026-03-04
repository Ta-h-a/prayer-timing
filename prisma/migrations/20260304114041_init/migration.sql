-- CreateTable
CREATE TABLE "Masjid" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Masjid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrayerTime" (
    "id" TEXT NOT NULL,
    "masjidId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "fajr" TEXT NOT NULL,
    "dhuhr" TEXT NOT NULL,
    "asr" TEXT NOT NULL,
    "maghrib" TEXT NOT NULL,
    "isha" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PrayerTime_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PrayerTime_masjidId_date_key" ON "PrayerTime"("masjidId", "date");

-- AddForeignKey
ALTER TABLE "PrayerTime" ADD CONSTRAINT "PrayerTime_masjidId_fkey" FOREIGN KEY ("masjidId") REFERENCES "Masjid"("id") ON DELETE CASCADE ON UPDATE CASCADE;
