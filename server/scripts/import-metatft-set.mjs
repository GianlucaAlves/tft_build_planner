import fs from "node:fs/promises";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DATASET_PATH = path.resolve(
  process.cwd(),
  "..",
  "client",
  "metatft_set_units.json",
);

function toSlug(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toNullableInt(value) {
  if (value === null || value === undefined) return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.round(n);
}

function toNullableFloat(value) {
  if (value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function buildUniqueFallbackSlugs(units) {
  const used = new Set();
  const result = new Map();

  for (const unit of units) {
    const base = toSlug(unit?.name) || "unknown-unit";
    let candidate = base;
    let suffix = 2;

    while (used.has(candidate)) {
      candidate = `${base}-${suffix}`;
      suffix += 1;
    }

    used.add(candidate);
    result.set(unit, candidate);
  }

  return result;
}

async function main() {
  const raw = await fs.readFile(DATASET_PATH, "utf8");
  const payload = JSON.parse(raw);
  const units = Array.isArray(payload?.units) ? payload.units : [];

  if (units.length === 0) {
    throw new Error("Dataset vazio: nao ha unidades para importar.");
  }

  const fallbackByUnit = buildUniqueFallbackSlugs(units);

  let upsertedChampions = 0;
  let linkedTraits = 0;
  let upsertedAbilities = 0;
  let upsertedStats = 0;
  let upsertedItems = 0;

  for (const unit of units) {
    const fallbackSlug = fallbackByUnit.get(unit);
    const champion = await prisma.champion.upsert({
      where: { fallbackSlug },
      create: {
        apiName: unit.apiName ?? null,
        fallbackSlug,
        imageSlug: unit.imageSlug ?? null,
        name: unit.name,
        cost: toNullableInt(unit.cost) ?? 0,
        imageUrl: unit.image ?? null,
        powerScore: toNullableFloat(unit?.combatProfile?.powerScore),
        rawJson: unit,
      },
      update: {
        apiName: unit.apiName ?? null,
        imageSlug: unit.imageSlug ?? null,
        name: unit.name,
        cost: toNullableInt(unit.cost) ?? 0,
        imageUrl: unit.image ?? null,
        powerScore: toNullableFloat(unit?.combatProfile?.powerScore),
        rawJson: unit,
      },
    });
    upsertedChampions += 1;

    const traitNames = Array.isArray(unit.traits) ? unit.traits : [];
    await prisma.championTrait.deleteMany({
      where: { championId: champion.id },
    });
    for (const traitName of traitNames) {
      const cleanedName = String(traitName ?? "").trim();
      if (!cleanedName) continue;

      const trait = await prisma.trait.upsert({
        where: { slug: toSlug(cleanedName) },
        create: {
          name: cleanedName,
          slug: toSlug(cleanedName),
        },
        update: {
          name: cleanedName,
        },
      });

      await prisma.championTrait.create({
        data: {
          championId: champion.id,
          traitId: trait.id,
        },
      });
      linkedTraits += 1;
    }

    const ability = unit.ability ?? null;
    await prisma.ability.upsert({
      where: { championId: champion.id },
      create: {
        championId: champion.id,
        title: ability?.title ?? null,
        manaText: ability?.mana ?? null,
        descriptionRaw: ability?.description ?? null,
        rawJson: ability,
      },
      update: {
        title: ability?.title ?? null,
        manaText: ability?.mana ?? null,
        descriptionRaw: ability?.description ?? null,
        rawJson: ability,
      },
    });
    upsertedAbilities += 1;

    const normalized = unit.statsNormalized ?? {};
    await prisma.championStat.deleteMany({
      where: { championId: champion.id },
    });

    const hp = normalized.hp ?? {};
    const ad = normalized.ad ?? {};

    const stars = [1, 2, 3];
    for (const starLevel of stars) {
      await prisma.championStat.create({
        data: {
          championId: champion.id,
          starLevel,
          hp: toNullableInt(hp[`star${starLevel}`]),
          ad: toNullableInt(ad[`star${starLevel}`]),
          ap: toNullableFloat(normalized.ap),
          armor: toNullableFloat(normalized.armor),
          mr: toNullableFloat(normalized.mr),
          attackSpeed: toNullableFloat(normalized.attackSpeed),
          critChance: toNullableFloat(normalized.critChance),
          critDamage: toNullableFloat(normalized.critDamage),
          range: toNullableInt(normalized.range),
          manaInitial: toNullableInt(normalized?.mana?.initial),
          manaMax: toNullableInt(normalized?.mana?.max),
        },
      });
      upsertedStats += 1;
    }

    const recItems = Array.isArray(unit?.items?.recommended)
      ? unit.items.recommended
      : [];
    await prisma.championRecommendedItem.deleteMany({
      where: { championId: champion.id },
    });

    for (let index = 0; index < recItems.length; index += 1) {
      const itemApiName = recItems[index];
      if (!itemApiName) continue;

      await prisma.championRecommendedItem.create({
        data: {
          championId: champion.id,
          itemApiName,
          position: index + 1,
          statsSampleSize: toNullableInt(unit?.items?.statsSampleSize),
          avgPlacement: toNullableFloat(unit?.items?.avgPlacement),
          pickRate: toNullableFloat(unit?.items?.pickRate),
          rawJson: {
            itemApiName,
            position: index + 1,
            statsSampleSize: unit?.items?.statsSampleSize ?? null,
            avgPlacement: unit?.items?.avgPlacement ?? null,
            pickRate: unit?.items?.pickRate ?? null,
          },
        },
      });
      upsertedItems += 1;
    }
  }

  console.log(
    JSON.stringify(
      {
        importedUnits: upsertedChampions,
        linkedTraits,
        upsertedAbilities,
        createdChampionStats: upsertedStats,
        createdRecommendedItems: upsertedItems,
        source: DATASET_PATH,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
