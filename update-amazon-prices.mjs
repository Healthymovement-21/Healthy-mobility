#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PRODUCT_ASINS = {
  massagepistole: "B09NZT1VV4",
  moorkissen: "B08SQM4GK6",
  "knie-kuehlpack": "B0B6TXXL51",
  retterspitz: "B00E4UGQYG",
  "macdavid-bandage": "B000V41428",
  leukotape: "B001BB6UEM",
  laufband: "B0FLJHY419",
  thrombosestrumpf: "B0D15GQVRM",
  waermemessgeraet: "B0BGGJH3G2",
  "aloe-vera-gel": "B0C7BFWTQ7",
  lymphmassband: "B082W886W9",
  "elektrischer-shaker": "B0C7GWGLWV",
  "bauerfeind-fussbandage": "B01BJT4BY6",
  "bauerfeind-armbandage": "B076KP7BKW",
  "neue-empfehlung-1": "B0FKBLTN38",
  "neue-empfehlung-2": "B004FNTGUI",
  "neue-empfehlung-3": "B0DVC94TN2",
  "neue-empfehlung-4": "B0GFSJYVX6"
};

const required = [
  "AMAZON_ACCESS_KEY_ID",
  "AMAZON_SECRET_ACCESS_KEY",
  "AMAZON_PARTNER_TAG"
];
const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`Missing required env vars: ${missing.join(", ")}`);
  process.exit(1);
}

const ACCESS_KEY_ID = process.env.AMAZON_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.AMAZON_SECRET_ACCESS_KEY;
const PARTNER_TAG = process.env.AMAZON_PARTNER_TAG;
const REGION = process.env.AMAZON_REGION || "eu-west-1";
const HOST = process.env.AMAZON_HOST || "webservices.amazon.de";
const MARKETPLACE = process.env.AMAZON_MARKETPLACE || "www.amazon.de";
const PARTNER_TYPE = process.env.AMAZON_PARTNER_TYPE || "Associates";

const TARGET = "com.amazon.paapi5.v1.ProductAdvertisingAPIv1.GetItems";
const SERVICE = "ProductAdvertisingAPI";
const REQUEST_PATH = "/paapi5/getitems";
const SIGNED_HEADERS = "content-encoding;content-type;host;x-amz-date;x-amz-target";
const RESOURCES = [
  "ItemInfo.Title",
  "Offers.Listings.Price",
  "Offers.Listings.SavingAmount",
  "Offers.Listings.SavingBasis",
  "Offers.Summaries.LowestPrice"
];

function toAmzDate(date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const mm = String(date.getUTCMinutes()).padStart(2, "0");
  const ss = String(date.getUTCSeconds()).padStart(2, "0");
  return `${y}${m}${d}T${hh}${mm}${ss}Z`;
}

function sha256Hex(value) {
  return crypto.createHash("sha256").update(value, "utf8").digest("hex");
}

function hmacRaw(key, value) {
  return crypto.createHmac("sha256", key).update(value, "utf8").digest();
}

function signingKey(secret, dateStamp) {
  const kDate = hmacRaw(`AWS4${secret}`, dateStamp);
  const kRegion = hmacRaw(kDate, REGION);
  const kService = hmacRaw(kRegion, SERVICE);
  return hmacRaw(kService, "aws4_request");
}

function buildAuthorization(payload, amzDate, dateStamp) {
  const canonicalHeaders =
    `content-encoding:amz-1.0\n` +
    `content-type:application/json; charset=utf-8\n` +
    `host:${HOST}\n` +
    `x-amz-date:${amzDate}\n` +
    `x-amz-target:${TARGET}\n`;
  const canonicalRequest = [
    "POST",
    REQUEST_PATH,
    "",
    canonicalHeaders,
    SIGNED_HEADERS,
    sha256Hex(payload)
  ].join("\n");
  const scope = `${dateStamp}/${REGION}/${SERVICE}/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    scope,
    sha256Hex(canonicalRequest)
  ].join("\n");
  const signature = crypto
    .createHmac("sha256", signingKey(SECRET_ACCESS_KEY, dateStamp))
    .update(stringToSign, "utf8")
    .digest("hex");

  return `AWS4-HMAC-SHA256 Credential=${ACCESS_KEY_ID}/${scope}, SignedHeaders=${SIGNED_HEADERS}, Signature=${signature}`;
}

function chunk(list, size) {
  const batches = [];
  for (let i = 0; i < list.length; i += size) {
    batches.push(list.slice(i, i + size));
  }
  return batches;
}

function asNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function formatMoney(amount, currency = "EUR") {
  if (!Number.isFinite(amount)) return "";
  try {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  } catch (_) {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

async function fetchBatch(itemIds) {
  const payloadObj = {
    ItemIds: itemIds,
    PartnerTag: PARTNER_TAG,
    PartnerType: PARTNER_TYPE,
    Marketplace: MARKETPLACE,
    Condition: "New",
    Resources: RESOURCES
  };
  const payload = JSON.stringify(payloadObj);
  const now = new Date();
  const amzDate = toAmzDate(now);
  const dateStamp = amzDate.slice(0, 8);
  const authorization = buildAuthorization(payload, amzDate, dateStamp);

  const res = await fetch(`https://${HOST}${REQUEST_PATH}`, {
    method: "POST",
    headers: {
      "content-encoding": "amz-1.0",
      "content-type": "application/json; charset=utf-8",
      host: HOST,
      "x-amz-date": amzDate,
      "x-amz-target": TARGET,
      authorization
    },
    body: payload
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Amazon API error ${res.status}: ${body.slice(0, 500)}`);
  }

  const json = await res.json();
  if (Array.isArray(json?.Errors) && json.Errors.length > 0) {
    const msg = json.Errors.map((e) => e.Message).filter(Boolean).join(" | ");
    if (msg) console.warn(`Amazon API warning: ${msg}`);
  }
  return Array.isArray(json?.ItemsResult?.Items) ? json.ItemsResult.Items : [];
}

function mapItemToPriceEntry(item) {
  if (!item || typeof item !== "object") return null;
  const listing = Array.isArray(item?.Offers?.Listings) ? item.Offers.Listings[0] : null;
  const summary = Array.isArray(item?.Offers?.Summaries) ? item.Offers.Summaries[0] : null;
  const price = listing?.Price || summary?.LowestPrice || null;
  if (!price || typeof price !== "object") return null;

  const rawPrice = asNumber(price.Amount);
  const currency = typeof price.Currency === "string" && price.Currency ? price.Currency : "EUR";
  const displayPrice =
    (typeof price.DisplayAmount === "string" && price.DisplayAmount.trim()) ||
    (rawPrice !== null ? formatMoney(rawPrice, currency) : "");
  if (!displayPrice) return null;

  const listPriceRaw = asNumber(listing?.SavingBasis?.Amount);
  const displayListPrice =
    (typeof listing?.SavingBasis?.DisplayAmount === "string" && listing.SavingBasis.DisplayAmount.trim()) ||
    (listPriceRaw !== null ? formatMoney(listPriceRaw, currency) : "");
  let discountAmountRaw = asNumber(listing?.SavingAmount?.Amount);
  let discountPercentRaw = asNumber(listing?.SavingAmount?.Percentage);
  if (discountAmountRaw === null && rawPrice !== null && listPriceRaw !== null && listPriceRaw > rawPrice) {
    discountAmountRaw = listPriceRaw - rawPrice;
  }
  if (discountPercentRaw === null && rawPrice !== null && listPriceRaw !== null && listPriceRaw > rawPrice) {
    discountPercentRaw = Math.round(((listPriceRaw - rawPrice) / listPriceRaw) * 100);
  }

  const result = {
    asin: item.ASIN,
    currency,
    displayPrice
  };
  if (rawPrice !== null) result.price = Number(rawPrice.toFixed(2));
  if (listPriceRaw !== null) result.listPrice = Number(listPriceRaw.toFixed(2));
  if (displayListPrice) result.displayListPrice = displayListPrice;
  if (discountAmountRaw !== null && discountAmountRaw > 0) {
    result.discountAmount = Number(discountAmountRaw.toFixed(2));
  }
  if (discountPercentRaw !== null && discountPercentRaw > 0) {
    result.discountPercent = Math.round(discountPercentRaw);
  }
  return result;
}

async function main() {
  const asins = Array.from(new Set(Object.values(PRODUCT_ASINS)));
  const asinToProductId = Object.fromEntries(
    Object.entries(PRODUCT_ASINS).map(([productId, asin]) => [asin, productId])
  );

  const items = [];
  const batches = chunk(asins, 10);
  for (const batch of batches) {
    const batchItems = await fetchBatch(batch);
    items.push(...batchItems);
  }

  const pricingItems = {};
  for (const item of items) {
    const asin = item?.ASIN;
    if (!asin || !asinToProductId[asin]) continue;
    const parsed = mapItemToPriceEntry(item);
    if (!parsed) continue;
    pricingItems[asinToProductId[asin]] = parsed;
  }

  const output = {
    updatedAt: new Date().toISOString(),
    source: "amazon-paapi5",
    marketplace: MARKETPLACE,
    items: pricingItems
  };

  const scriptFile = fileURLToPath(import.meta.url);
  const scriptDir = path.dirname(scriptFile);
  const repoRoot = path.resolve(scriptDir, "..");
  const outputPath = path.join(repoRoot, "prices.json");
  fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  console.log(`prices.json updated: ${Object.keys(pricingItems).length} products`);
}

main().catch((err) => {
  console.error(err?.stack || err?.message || String(err));
  process.exit(1);
});
