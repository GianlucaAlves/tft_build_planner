-- CreateTable
CREATE TABLE "Champion" (
    "id" TEXT NOT NULL,
    "apiName" TEXT,
    "fallbackSlug" TEXT NOT NULL,
    "imageSlug" TEXT,
    "name" TEXT NOT NULL,
    "cost" INTEGER NOT NULL,
    "imageUrl" TEXT,
    "powerScore" DOUBLE PRECISION,
    "rawJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Champion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Trait" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "iconUrl" TEXT,
    "rawJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trait_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChampionTrait" (
    "championId" TEXT NOT NULL,
    "traitId" TEXT NOT NULL,

    CONSTRAINT "ChampionTrait_pkey" PRIMARY KEY ("championId","traitId")
);

-- CreateTable
CREATE TABLE "ChampionStat" (
    "id" TEXT NOT NULL,
    "championId" TEXT NOT NULL,
    "starLevel" INTEGER NOT NULL,
    "hp" INTEGER,
    "ad" INTEGER,
    "ap" DOUBLE PRECISION,
    "armor" DOUBLE PRECISION,
    "mr" DOUBLE PRECISION,
    "attackSpeed" DOUBLE PRECISION,
    "critChance" DOUBLE PRECISION,
    "critDamage" DOUBLE PRECISION,
    "range" INTEGER,
    "manaInitial" INTEGER,
    "manaMax" INTEGER,

    CONSTRAINT "ChampionStat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ability" (
    "id" TEXT NOT NULL,
    "championId" TEXT NOT NULL,
    "title" TEXT,
    "manaText" TEXT,
    "descriptionRaw" TEXT,
    "rawJson" JSONB,

    CONSTRAINT "Ability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChampionRecommendedItem" (
    "id" TEXT NOT NULL,
    "championId" TEXT NOT NULL,
    "itemApiName" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "statsSampleSize" INTEGER,
    "avgPlacement" DOUBLE PRECISION,
    "pickRate" DOUBLE PRECISION,
    "rawJson" JSONB,

    CONSTRAINT "ChampionRecommendedItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Champion_apiName_key" ON "Champion"("apiName");

-- CreateIndex
CREATE UNIQUE INDEX "Champion_fallbackSlug_key" ON "Champion"("fallbackSlug");

-- CreateIndex
CREATE INDEX "Champion_name_idx" ON "Champion"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Trait_slug_key" ON "Trait"("slug");

-- CreateIndex
CREATE INDEX "Trait_name_idx" ON "Trait"("name");

-- CreateIndex
CREATE INDEX "ChampionTrait_traitId_idx" ON "ChampionTrait"("traitId");

-- CreateIndex
CREATE INDEX "ChampionStat_starLevel_idx" ON "ChampionStat"("starLevel");

-- CreateIndex
CREATE UNIQUE INDEX "ChampionStat_championId_starLevel_key" ON "ChampionStat"("championId", "starLevel");

-- CreateIndex
CREATE UNIQUE INDEX "Ability_championId_key" ON "Ability"("championId");

-- CreateIndex
CREATE INDEX "ChampionRecommendedItem_itemApiName_idx" ON "ChampionRecommendedItem"("itemApiName");

-- CreateIndex
CREATE UNIQUE INDEX "ChampionRecommendedItem_championId_position_key" ON "ChampionRecommendedItem"("championId", "position");

-- AddForeignKey
ALTER TABLE "ChampionTrait" ADD CONSTRAINT "ChampionTrait_championId_fkey" FOREIGN KEY ("championId") REFERENCES "Champion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChampionTrait" ADD CONSTRAINT "ChampionTrait_traitId_fkey" FOREIGN KEY ("traitId") REFERENCES "Trait"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChampionStat" ADD CONSTRAINT "ChampionStat_championId_fkey" FOREIGN KEY ("championId") REFERENCES "Champion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ability" ADD CONSTRAINT "Ability_championId_fkey" FOREIGN KEY ("championId") REFERENCES "Champion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChampionRecommendedItem" ADD CONSTRAINT "ChampionRecommendedItem_championId_fkey" FOREIGN KEY ("championId") REFERENCES "Champion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
