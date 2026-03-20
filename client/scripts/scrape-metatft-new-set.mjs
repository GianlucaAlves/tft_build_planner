import { chromium } from "playwright";
import fs from "node:fs/promises";

const SET_URL = "https://www.metatft.com/new-set";
const OUTPUT_FILE = "metatft_set_units.json";
const UNIT_ITEMS_URL =
  "https://api-hc.metatft.com/tft-comps-api/unit_items_processed";

function toNumber(text) {
  const n = Number(String(text ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function cleanText(text) {
  return String(text ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeToken(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

function extractImageSlug(imageUrl) {
  if (!imageUrl) return null;
  const match = String(imageUrl).match(/championsplashes\/([^.?/]+)\./i);
  return match?.[1] ?? null;
}

function imageSlugToApiName(slug) {
  if (!slug) return null;
  const core = slug.replace(/^tft\d+_/i, "");
  const pascal = core
    .split(/[^a-z0-9]+/i)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");
  return pascal ? `TFT16_${pascal}` : null;
}

function buildUnitItemsIndex(payload) {
  const index = new Map();
  const units = payload?.units ?? {};

  for (const [apiName, info] of Object.entries(units)) {
    index.set(normalizeToken(apiName), {
      apiName,
      items: Array.isArray(info?.items) ? info.items : [],
      count: info?.count ?? null,
      avgPlacement: info?.avg ?? null,
      pickRate: info?.pick ?? null,
    });
  }

  return index;
}

function selectRecommendedItems(unitFromItemsApi, limit = 5) {
  if (!unitFromItemsApi) return [];
  return unitFromItemsApi.items
    .slice(0, limit)
    .map((i) => i?.itemName)
    .filter(Boolean);
}

function statKeyToSlug(key) {
  return String(key ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z]/g, "");
}

function parseSlashValues(valueText) {
  const clean = String(valueText ?? "").replace(/,/g, ".");
  if (!clean.includes("/")) return [];

  const parts = clean
    .split("/")
    .map((p) => Number(p.replace(/[^\d.]/g, "")))
    .filter((n) => Number.isFinite(n));

  return parts;
}

function parseSingleNumeric(valueText) {
  const n = Number(String(valueText ?? "").replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? n : null;
}

function normalizeStats(rawStats) {
  const normalized = {
    hp: { star1: null, star2: null, star3: null },
    mana: { initial: null, max: null },
    ad: { star1: null, star2: null, star3: null },
    ap: null,
    armor: null,
    mr: null,
    attackSpeed: null,
    critChance: null,
    critDamage: null,
    range: null,
  };

  for (const [key, valueText] of Object.entries(rawStats)) {
    const slug = statKeyToSlug(key);
    const stars = parseSlashValues(valueText);
    const single = parseSingleNumeric(valueText);

    if (slug.includes("health") || slug === "hp") {
      if (stars.length >= 3) {
        normalized.hp.star1 = stars[0];
        normalized.hp.star2 = stars[1];
        normalized.hp.star3 = stars[2];
      } else if (single !== null) {
        normalized.hp.star1 = single;
      }
      continue;
    }

    if (slug.includes("mana")) {
      if (stars.length >= 2) {
        normalized.mana.initial = stars[0];
        normalized.mana.max = stars[1];
      } else if (single !== null) {
        normalized.mana.max = single;
      }
      continue;
    }

    if (slug.includes("attackdamage") || slug === "ad") {
      if (stars.length >= 3) {
        normalized.ad.star1 = stars[0];
        normalized.ad.star2 = stars[1];
        normalized.ad.star3 = stars[2];
      } else if (single !== null) {
        normalized.ad.star1 = single;
      }
      continue;
    }

    if (slug.includes("abilitypower") || slug === "ap") {
      normalized.ap = single;
      continue;
    }

    if (slug.includes("armor")) {
      normalized.armor = single;
      continue;
    }

    if (slug.includes("magicresist") || slug === "mr") {
      normalized.mr = single;
      continue;
    }

    if (slug.includes("attackspeed")) {
      normalized.attackSpeed = single;
      continue;
    }

    if (slug.includes("critchance")) {
      normalized.critChance = single;
      continue;
    }

    if (slug.includes("critdamage")) {
      normalized.critDamage = single;
      continue;
    }

    if (slug === "range") {
      normalized.range = single;
    }
  }

  return normalized;
}

function buildCombatProfile(normalizedStats) {
  const hp = normalizedStats.hp.star1 ?? 0;
  const ad = normalizedStats.ad.star1 ?? 0;
  const ap = normalizedStats.ap ?? 0;
  const armor = normalizedStats.armor ?? 0;
  const mr = normalizedStats.mr ?? 0;
  const as = normalizedStats.attackSpeed ?? 0;

  // Simple baseline score for early ranking/prototyping; can be replaced by domain model later.
  const powerScore = Number(
    (hp * 0.02 + ad * 1.6 + ap * 0.5 + (armor + mr) * 0.4 + as * 25).toFixed(2),
  );

  return {
    star1: {
      hp,
      ad,
      ap,
      armor,
      mr,
      attackSpeed: as,
    },
    powerScore,
  };
}

async function collectStatsFromCard(card) {
  const stats = {};
  const rows = card.locator(".UnitStatsMenu .UnitStatsMenuContainer");
  const count = await rows.count();

  for (let i = 0; i < count; i += 1) {
    const row = rows.nth(i);
    const key = cleanText(
      await row.locator(".UnitStatsMenuTitle").textContent(),
    );
    const value = cleanText(
      await row.locator(".UnitAbilityMana .InitialMana").textContent(),
    );
    if (key) stats[key] = value;
  }

  return stats;
}

async function ensureAbilityTabOpen(card) {
  const abilityTab = card.getByRole("tab", { name: /ability/i });
  if (await abilityTab.count()) {
    await abilityTab.first().click({ timeout: 5000 });
    await card
      .locator(".UnitAbility")
      .first()
      .waitFor({ state: "visible", timeout: 8000 });
    return true;
  }

  return false;
}

async function collectAbilityFromCard(card) {
  const opened = await ensureAbilityTabOpen(card);
  if (!opened) return null;

  const title = cleanText(
    await card
      .locator(".UnitAbilityTitle .UnitAbilityName")
      .first()
      .textContent(),
  );
  const mana = cleanText(
    await card
      .locator(".UnitAbilityTitle .UnitAbilityMana .InitialMana")
      .first()
      .textContent(),
  );
  const description = cleanText(
    await card
      .locator(".UnitAbility .UnitAbilityDescription")
      .first()
      .textContent(),
  );

  return {
    title: title || null,
    mana: mana || null,
    description: description || null,
  };
}

async function collectTraitsFromCard(card) {
  const traitNodes = card.locator(".UnitTraitContainer .NewSetUnitTrait");
  const count = await traitNodes.count();
  const traits = [];

  for (let i = 0; i < count; i += 1) {
    const name = cleanText(await traitNodes.nth(i).textContent());
    if (name && !name.match(/^\d+$/)) traits.push(name);
  }

  return traits;
}

async function ensureStatsTabOpen(card) {
  const statsTab = card.getByRole("tab", { name: /stats/i });
  if (await statsTab.count()) {
    await statsTab.first().click({ timeout: 5000 });
    await card
      .locator(".UnitStatsMenu")
      .first()
      .waitFor({ state: "visible", timeout: 8000 });
    return true;
  }

  // Fallback: some variants render unit details inside tooltip containers.
  await card.hover();
  const tooltipStatsTab = card
    .page()
    .locator('.MuiUnitTooltip [role="tab"]', { hasText: /stats/i });
  if (await tooltipStatsTab.count()) {
    await tooltipStatsTab.first().click({ timeout: 5000 });
    return true;
  }

  return false;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const network = {
    requests: [],
    responses: [],
  };

  let unitItemsPayload = null;

  try {
    const itemsRes = await fetch(UNIT_ITEMS_URL);
    if (itemsRes.ok) {
      unitItemsPayload = await itemsRes.json();
    }
  } catch {
    unitItemsPayload = null;
  }

  const unitItemsIndex = buildUnitItemsIndex(unitItemsPayload);

  page.on("request", (req) => {
    const type = req.resourceType();
    if (type === "xhr" || type === "fetch") {
      network.requests.push({
        method: req.method(),
        type,
        url: req.url(),
      });
    }
  });

  page.on("response", async (res) => {
    const req = res.request();
    const type = req.resourceType();
    if (type === "xhr" || type === "fetch") {
      network.responses.push({
        status: res.status(),
        type,
        url: res.url(),
      });
    }
  });

  await page.goto(SET_URL, { waitUntil: "networkidle", timeout: 120000 });

  // Cards on this page reuse .NewSetUnitContainer in multiple places.
  // This filter targets actual unit cards (with name header/splash), not trait tooltips.
  const cards = page.locator(".NewSetUnitContainer:has(.UnitNameContainer)");
  await cards.first().waitFor({ state: "visible", timeout: 20000 });

  const total = await cards.count();
  const units = [];

  for (let i = 0; i < total; i += 1) {
    const card = cards.nth(i);

    const name = cleanText(
      await card.locator(".NewSetUnitName").first().textContent(),
    );
    const costText = cleanText(
      await card.locator(".NewSetUnitCost").first().textContent(),
    );
    const cost = toNumber(costText);
    const image = await card
      .locator(".NewSetUnitSplashImg")
      .first()
      .getAttribute("src");
    const imageSlug = extractImageSlug(image);
    const apiNameFromImage = imageSlugToApiName(imageSlug);
    const traits = await collectTraitsFromCard(card);
    const ability = await collectAbilityFromCard(card);

    const openedStats = await ensureStatsTabOpen(card);
    const statsRaw = openedStats ? await collectStatsFromCard(card) : {};
    const statsNormalized = normalizeStats(statsRaw);
    const combatProfile = buildCombatProfile(statsNormalized);

    const lookupCandidates = [
      normalizeToken(apiNameFromImage),
      normalizeToken(imageSlug),
      normalizeToken(name),
    ].filter(Boolean);

    let unitFromItemsApi = null;
    for (const candidate of lookupCandidates) {
      if (unitItemsIndex.has(candidate)) {
        unitFromItemsApi = unitItemsIndex.get(candidate);
        break;
      }
    }

    const recommendedItems = selectRecommendedItems(unitFromItemsApi);

    units.push({
      apiName: unitFromItemsApi?.apiName ?? apiNameFromImage,
      imageSlug,
      name,
      cost,
      image,
      traits,
      ability,
      items: {
        recommended: recommendedItems,
        statsSampleSize: unitFromItemsApi?.count ?? null,
        avgPlacement: unitFromItemsApi?.avgPlacement ?? null,
        pickRate: unitFromItemsApi?.pickRate ?? null,
      },
      statsRaw,
      statsNormalized,
      combatProfile,
    });
  }

  const interestingResponses = network.responses.filter(
    (r) =>
      /(metatft\.com|data\.metatft\.com)/i.test(r.url) &&
      /(lookups|set|unit|table|json|new-set)/i.test(r.url),
  );

  const payload = {
    sourcePage: SET_URL,
    extractedAt: new Date().toISOString(),
    howStatsTabIsOpened: {
      selector: '.UnitStatsNavigation [role="tab"]',
      action: 'click tab with label "Stats"',
      evidence:
        "Bundle contains UnitStatsNavigation with tabs ability/stats and onChange handler.",
    },
    dataSourceDetection: {
      usedNetwork: interestingResponses.length > 0,
      networkHits: interestingResponses,
      unitItemsEndpointLoaded: Boolean(unitItemsPayload),
      note:
        interestingResponses.length > 0
          ? "Há requests XHR/fetch relevantes durante a sessão; os dados não vêm apenas do HTML inicial."
          : "Nenhum request XHR/fetch relevante capturado; a renderização pode estar vindo de payload já carregado no JS e leitura do DOM hidratado.",
    },
    units,
  };

  await fs.writeFile(OUTPUT_FILE, JSON.stringify(payload, null, 2), "utf8");

  console.log(`Done. Units: ${units.length}. Output: ${OUTPUT_FILE}`);
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
