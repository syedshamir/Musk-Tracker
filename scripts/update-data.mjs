import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { getNetWorthPayload } from "../src/netWorthData.mjs";

const generatedDataPath = join(process.cwd(), "data", "generated-data.json");
const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const updateNetWorth = args.has("--net-worth") || !args.has("--market");
const updateMarket = args.has("--market") || !args.has("--net-worth");

function readNumberEnv(name) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) ? value : null;
}

async function readGeneratedData() {
  if (!existsSync(generatedDataPath)) {
    return {
      updatedAt: null,
      netWorthSnapshots: [],
      companyUpdates: []
    };
  }

  return JSON.parse(await readFile(generatedDataPath, "utf8"));
}

async function writeGeneratedData(data) {
  const targetDir = dirname(generatedDataPath);
  const tempPath = `${generatedDataPath}.tmp`;

  await mkdir(targetDir, { recursive: true });
  await writeFile(tempPath, `${JSON.stringify(data, null, 2)}\n`);
  await rename(tempPath, generatedDataPath);
}

function upsertByKey(items, newItem, key) {
  const next = items.filter((item) => item[key] !== newItem[key]);
  next.push(newItem);
  return next.sort((a, b) => String(a[key]).localeCompare(String(b[key])));
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`Request failed ${response.status}: ${url}`);
  }

  return response.json();
}

function normalizeNetWorthSnapshot(data) {
  const current = data.current ?? data;
  const netWorthUsd = Number(current.netWorthUsd);

  if (!Number.isFinite(netWorthUsd)) {
    throw new Error("Net worth source must return netWorthUsd.");
  }

  const latestSeed = getNetWorthPayload().current;
  const date = current.date ?? new Date().toISOString().slice(0, 10);

  return {
    date,
    netWorthUsd,
    dailyChangeUsd:
      typeof current.dailyChangeUsd === "number"
        ? current.dailyChangeUsd
        : netWorthUsd - latestSeed.netWorthUsd,
    source: current.source ?? "Scheduled Update",
    sourceUrl: current.sourceUrl ?? process.env.NET_WORTH_SOURCE_URL
  };
}

async function fetchNetWorthSnapshot() {
  if (!process.env.NET_WORTH_SOURCE_URL) {
    return null;
  }

  const data = await fetchJson(process.env.NET_WORTH_SOURCE_URL);
  return normalizeNetWorthSnapshot(data);
}

function parseStooqCsv(csv) {
  const [headerLine, valueLine] = csv.trim().split(/\r?\n/);
  const headers = headerLine.split(",");
  const values = valueLine.split(",");
  const row = Object.fromEntries(headers.map((header, index) => [header, values[index]]));
  const close = Number(row.Close);

  if (!Number.isFinite(close) || close <= 0) {
    throw new Error("Could not parse TSLA close price from market data.");
  }

  return {
    close,
    date: row.Date,
    sourceUrl: "https://stooq.com/q/?s=tsla.us"
  };
}

function normalizeTeslaQuote(quote) {
  const sharesOutstanding =
    readNumberEnv("TESLA_SHARES_OUTSTANDING") ?? 3_220_000_000;
  const muskTeslaShares = readNumberEnv("MUSK_TESLA_SHARES") ?? 411_000_000;

  return {
    name: "Tesla",
    companyValueUsd: quote.close * sharesOutstanding,
    muskStakeValueUsd: quote.close * muskTeslaShares,
    sourceUrl: quote.sourceUrl,
    note: `Public market value refreshed from TSLA close on ${quote.date}.`
  };
}

async function fetchManualTeslaQuote() {
  const close = readNumberEnv("TSLA_PRICE_USD");

  if (!close) {
    return null;
  }

  return {
    close,
    date: new Date().toISOString().slice(0, 10),
    sourceUrl: "manual-env:TSLA_PRICE_USD"
  };
}

async function fetchYahooTeslaQuote() {
  const response = await fetch(
    "https://query1.finance.yahoo.com/v8/finance/chart/TSLA?range=5d&interval=1d",
    {
      headers: {
        Accept: "application/json",
        "User-Agent": "musk-net-worth-tracker/0.1"
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Yahoo TSLA request failed: ${response.status}`);
  }

  const data = await response.json();
  const result = data.chart?.result?.[0];
  const timestamps = result?.timestamp ?? [];
  const closes = result?.indicators?.quote?.[0]?.close ?? [];
  const latestIndex = closes
    .map((close, index) => ({ close, index }))
    .filter((item) => Number.isFinite(item.close) && item.close > 0)
    .at(-1)?.index;

  if (latestIndex === undefined) {
    throw new Error("Could not parse TSLA close price from Yahoo market data.");
  }

  return {
    close: closes[latestIndex],
    date: new Date(timestamps[latestIndex] * 1000).toISOString().slice(0, 10),
    sourceUrl: "https://finance.yahoo.com/quote/TSLA/"
  };
}

async function fetchStooqTeslaQuote() {
  const response = await fetch(
    "https://stooq.com/q/l/?s=tsla.us&f=sd2t2ohlcv&h&e=csv",
    {
      headers: {
        Accept: "text/csv",
        "User-Agent": "musk-net-worth-tracker/0.1"
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Stooq TSLA request failed: ${response.status}`);
  }

  return parseStooqCsv(await response.text());
}

async function fetchTeslaMarketUpdate() {
  const providers = [
    ["manual", fetchManualTeslaQuote],
    ["Yahoo Finance", fetchYahooTeslaQuote],
    ["Stooq", fetchStooqTeslaQuote]
  ];
  const errors = [];

  for (const [name, provider] of providers) {
    try {
      const quote = await provider();

      if (quote) {
        return normalizeTeslaQuote(quote);
      }
    } catch (error) {
      errors.push(`${name}: ${error.message}`);
    }
  }

  console.warn(`Market update skipped. ${errors.join(" | ")}`);
  return null;
}

async function fetchMarketUpdates() {
  if (process.env.MARKET_VALUES_SOURCE_URL) {
    const data = await fetchJson(process.env.MARKET_VALUES_SOURCE_URL);
    return data.companyUpdates ?? data.companies ?? [];
  }

  const update = await fetchTeslaMarketUpdate();
  return update ? [update] : [];
}

async function main() {
  const generatedData = await readGeneratedData();
  const summary = [];
  let changed = false;

  if (updateNetWorth) {
    const snapshot = await fetchNetWorthSnapshot();

    if (snapshot) {
      generatedData.netWorthSnapshots = upsertByKey(
        generatedData.netWorthSnapshots ?? [],
        snapshot,
        "date"
      );
      summary.push(`net worth ${snapshot.date}`);
      changed = true;
    } else {
      summary.push("net worth skipped: NET_WORTH_SOURCE_URL not configured");
    }
  }

  if (updateMarket) {
    const companyUpdates = await fetchMarketUpdates();

    for (const update of companyUpdates) {
      if (!update.name) {
        continue;
      }

      generatedData.companyUpdates = upsertByKey(
        generatedData.companyUpdates ?? [],
        update,
        "name"
      );
      changed = true;
    }

    summary.push(
      companyUpdates.length
        ? `market values ${companyUpdates.length} update(s)`
        : "market values skipped: no quote provider returned data"
    );
  }

  generatedData.updatedAt = new Date().toISOString();

  if (dryRun) {
    console.log(JSON.stringify({ dryRun: true, summary, generatedData }, null, 2));
    return;
  }

  if (!changed) {
    console.log(`No generated data changes. ${summary.join("; ")}`);
    return;
  }

  await writeGeneratedData(generatedData);
  console.log(`Updated generated data: ${summary.join("; ")}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
