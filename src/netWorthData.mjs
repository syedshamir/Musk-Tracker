import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const billion = 1_000_000_000;
const trillion = 1_000_000_000_000;

const today = new Date();
const generatedDataPath = join(process.cwd(), "data", "generated-data.json");

export const snapshots = [
  {
    date: "2006-12-31",
    netWorthUsd: 200_000_000,
    dailyChangeUsd: 0,
    source: "Historical Estimate",
    sourceUrl: "https://www.forbes.com/real-time-billionaires/"
  },
  {
    date: "2008-12-31",
    netWorthUsd: 680_000_000,
    dailyChangeUsd: 0,
    source: "Historical Estimate",
    sourceUrl: "https://www.forbes.com/real-time-billionaires/"
  },
  {
    date: "2010-12-31",
    netWorthUsd: 2 * billion,
    dailyChangeUsd: 0,
    source: "Historical Estimate",
    sourceUrl: "https://www.forbes.com/real-time-billionaires/"
  },
  {
    date: "2012-12-31",
    netWorthUsd: 2.4 * billion,
    dailyChangeUsd: 0,
    source: "Historical Estimate",
    sourceUrl: "https://www.forbes.com/real-time-billionaires/"
  },
  {
    date: "2014-12-31",
    netWorthUsd: 8.4 * billion,
    dailyChangeUsd: 0,
    source: "Historical Estimate",
    sourceUrl: "https://www.forbes.com/real-time-billionaires/"
  },
  {
    date: "2016-12-31",
    netWorthUsd: 11.6 * billion,
    dailyChangeUsd: 0,
    source: "Historical Estimate",
    sourceUrl: "https://www.forbes.com/real-time-billionaires/"
  },
  {
    date: "2018-12-31",
    netWorthUsd: 22.3 * billion,
    dailyChangeUsd: 0,
    source: "Historical Estimate",
    sourceUrl: "https://www.forbes.com/real-time-billionaires/"
  },
  {
    date: "2020-12-31",
    netWorthUsd: 167 * billion,
    dailyChangeUsd: 0,
    source: "Historical Estimate",
    sourceUrl: "https://www.forbes.com/real-time-billionaires/"
  },
  {
    date: "2021-12-31",
    netWorthUsd: 273 * billion,
    dailyChangeUsd: 0,
    source: "Historical Estimate",
    sourceUrl: "https://www.forbes.com/real-time-billionaires/"
  },
  {
    date: "2022-12-31",
    netWorthUsd: 137 * billion,
    dailyChangeUsd: 0,
    source: "Historical Estimate",
    sourceUrl: "https://www.forbes.com/real-time-billionaires/"
  },
  {
    date: "2023-12-31",
    netWorthUsd: 251 * billion,
    dailyChangeUsd: 0,
    source: "Historical Estimate",
    sourceUrl: "https://www.forbes.com/real-time-billionaires/"
  },
  {
    date: "2024-12-31",
    netWorthUsd: 421 * billion,
    dailyChangeUsd: 0,
    source: "Historical Estimate",
    sourceUrl: "https://www.forbes.com/real-time-billionaires/"
  },
  {
    date: "2025-12-31",
    netWorthUsd: 462 * billion,
    dailyChangeUsd: 0,
    source: "Historical Estimate",
    sourceUrl: "https://www.forbes.com/real-time-billionaires/"
  },
  {
    date: "2026-05-16",
    netWorthUsd: 872 * billion,
    dailyChangeUsd: 5.4 * billion,
    source: "Demo Seed",
    sourceUrl: "https://www.forbes.com/real-time-billionaires/"
  },
  {
    date: "2026-05-23",
    netWorthUsd: 894 * billion,
    dailyChangeUsd: 8.2 * billion,
    source: "Demo Seed",
    sourceUrl: "https://www.forbes.com/real-time-billionaires/"
  },
  {
    date: "2026-05-30",
    netWorthUsd: 913 * billion,
    dailyChangeUsd: -3.1 * billion,
    source: "Demo Seed",
    sourceUrl: "https://www.forbes.com/real-time-billionaires/"
  },
  {
    date: "2026-06-02",
    netWorthUsd: 948 * billion,
    dailyChangeUsd: 18.9 * billion,
    source: "Demo Seed",
    sourceUrl: "https://www.bloomberg.com/billionaires/"
  },
  {
    date: "2026-06-05",
    netWorthUsd: 982 * billion,
    dailyChangeUsd: 21.6 * billion,
    source: "Demo Seed",
    sourceUrl: "https://www.bloomberg.com/billionaires/"
  },
  {
    date: "2026-06-09",
    netWorthUsd: 1.03 * trillion,
    dailyChangeUsd: 31.2 * billion,
    source: "Demo Seed",
    sourceUrl: "https://www.forbes.com/real-time-billionaires/"
  },
  {
    date: "2026-06-12",
    netWorthUsd: 1.07 * trillion,
    dailyChangeUsd: 42.8 * billion,
    source: "Demo Seed",
    sourceUrl: "https://www.forbes.com/real-time-billionaires/"
  },
  {
    date: "2026-06-13",
    netWorthUsd: 1.1 * trillion,
    dailyChangeUsd: 30 * billion,
    source: "Manual Estimate",
    sourceUrl: "https://www.forbes.com/real-time-billionaires/"
  }
];

export const components = [
  {
    label: "SpaceX",
    valueUsd: 717 * billion,
    note: "Private-market estimate placeholder",
    color: "#d8572a"
  },
  {
    label: "Tesla",
    valueUsd: 165 * billion,
    note: "Public-equity estimate placeholder",
    color: "#0e7c7b"
  },
  {
    label: "xAI / X",
    valueUsd: 142 * billion,
    note: "Private-company estimate placeholder",
    color: "#f4b942"
  },
  {
    label: "Other assets",
    valueUsd: 76 * billion,
    note: "Other holdings and adjustments",
    color: "#2f4858"
  }
];

export const companies = [
  {
    name: "SpaceX",
    role: "Founder, CEO, CTO",
    companyValueUsd: 2.1 * trillion,
    muskStakeValueUsd: 717 * billion,
    ownershipNote: "Public-market estimate after the reported 2026 SpaceX debut.",
    sourceUrl: "https://www.theguardian.com/business/live/2026/jun/12/spacex-float-us-stock-market-share-elon-musk-trillionaire-largest-ipo-ever-live-news-updates",
    accent: "#d8572a",
    financials: {
      quarters: [
        {
          period: "Q1 2026",
          periodEnd: "2026-03-31",
          revenueUsd: null,
          netIncomeUsd: null,
          status: "Awaiting first public quarterly filing",
          sourceUrl: "https://www.spacex.com/"
        }
      ],
      fiscalYears: [
        {
          period: "FY 2025",
          periodEnd: "2025-12-31",
          revenueUsd: 15 * billion,
          netIncomeUsd: 8 * billion,
          status: "Reported by news sources ahead of IPO",
          sourceUrl: "https://www.reuters.com/business/finance/spacex-generated-about-8-billion-profit-last-year-ahead-ipo-sources-say-2026-01-30/"
        }
      ]
    }
  },
  {
    name: "Tesla",
    role: "CEO, product architect",
    companyValueUsd: 1.5 * trillion,
    muskStakeValueUsd: 165 * billion,
    ownershipNote: "Public-company market value estimate; Musk stake shown as dashboard contribution.",
    sourceUrl: "https://www.tesla.com/ir",
    accent: "#0e7c7b",
    financials: {
      quarters: [
        {
          period: "Q4 2025",
          periodEnd: "2025-12-31",
          revenueUsd: 25.7 * billion,
          netIncomeUsd: 2.3 * billion,
          status: "Demo reported value",
          sourceUrl: "https://www.tesla.com/ir"
        },
        {
          period: "Q1 2026",
          periodEnd: "2026-03-31",
          revenueUsd: 22.4 * billion,
          netIncomeUsd: 477_000_000,
          status: "Reported public-company result",
          sourceUrl: "https://www.tesla.com/ir"
        }
      ],
      fiscalYears: [
        {
          period: "FY 2024",
          periodEnd: "2024-12-31",
          revenueUsd: 97.7 * billion,
          netIncomeUsd: 7.1 * billion,
          status: "Historical reported baseline",
          sourceUrl: "https://www.tesla.com/ir"
        },
        {
          period: "FY 2025",
          periodEnd: "2025-12-31",
          revenueUsd: 94.83 * billion,
          netIncomeUsd: 3.79 * billion,
          status: "Reported public-company result",
          sourceUrl: "https://www.tesla.com/ir"
        }
      ]
    }
  },
  {
    name: "xAI / X",
    role: "Founder / controlling owner",
    companyValueUsd: 250 * billion,
    muskStakeValueUsd: 142 * billion,
    ownershipNote: "Private valuation estimate; includes X-related AI/social assets in this MVP model.",
    sourceUrl: "https://x.ai/",
    accent: "#f4b942",
    financials: {
      quarters: [
        {
          period: "Q1 2026",
          periodEnd: "2026-03-31",
          revenueUsd: null,
          netIncomeUsd: null,
          status: "Unavailable in public filings",
          sourceUrl: "https://x.ai/"
        }
      ],
      fiscalYears: [
        {
          period: "FY 2025",
          periodEnd: "2025-12-31",
          revenueUsd: null,
          netIncomeUsd: null,
          status: "Unavailable in public filings",
          sourceUrl: "https://x.ai/"
        }
      ]
    }
  },
  {
    name: "Neuralink",
    role: "Co-founder",
    companyValueUsd: 9 * billion,
    muskStakeValueUsd: 5 * billion,
    ownershipNote: "Private neurotechnology company; valuation is an approximate private-market placeholder.",
    sourceUrl: "https://neuralink.com/",
    accent: "#8fb8de",
    financials: {
      quarters: [
        {
          period: "Q1 2026",
          periodEnd: "2026-03-31",
          revenueUsd: null,
          netIncomeUsd: null,
          status: "Unavailable in public filings",
          sourceUrl: "https://neuralink.com/"
        }
      ],
      fiscalYears: [
        {
          period: "FY 2025",
          periodEnd: "2025-12-31",
          revenueUsd: null,
          netIncomeUsd: null,
          status: "Unavailable in public filings",
          sourceUrl: "https://neuralink.com/"
        }
      ]
    }
  },
  {
    name: "The Boring Company",
    role: "Founder",
    companyValueUsd: 5.7 * billion,
    muskStakeValueUsd: 4 * billion,
    ownershipNote: "Private tunneling company; based around the last major reported funding valuation.",
    sourceUrl: "https://www.boringcompany.com/",
    accent: "#b8895b",
    financials: {
      quarters: [
        {
          period: "Q1 2026",
          periodEnd: "2026-03-31",
          revenueUsd: null,
          netIncomeUsd: null,
          status: "Unavailable in public filings",
          sourceUrl: "https://www.boringcompany.com/"
        }
      ],
      fiscalYears: [
        {
          period: "FY 2025",
          periodEnd: "2025-12-31",
          revenueUsd: null,
          netIncomeUsd: null,
          status: "Unavailable in public filings",
          sourceUrl: "https://www.boringcompany.com/"
        }
      ]
    }
  }
];

function loadGeneratedData() {
  if (!existsSync(generatedDataPath)) {
    return {
      netWorthSnapshots: [],
      companyUpdates: []
    };
  }

  try {
    return JSON.parse(readFileSync(generatedDataPath, "utf8"));
  } catch (error) {
    console.warn(`Could not read generated data: ${error.message}`);
    return {
      netWorthSnapshots: [],
      companyUpdates: []
    };
  }
}

function mergeSnapshots(seedSnapshots, generatedSnapshots = []) {
  const byDate = new Map();

  [...seedSnapshots, ...generatedSnapshots].forEach((snapshot) => {
    if (!snapshot?.date || typeof snapshot.netWorthUsd !== "number") {
      return;
    }

    byDate.set(snapshot.date, snapshot);
  });

  return [...byDate.values()].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );
}

function mergeCompanies(seedCompanies, companyUpdates = []) {
  const updateByName = new Map(
    companyUpdates
      .filter((update) => update?.name)
      .map((update) => [update.name, update])
  );

  return seedCompanies.map((company) => {
    const update = updateByName.get(company.name);

    if (!update) {
      return company;
    }

    return {
      ...company,
      companyValueUsd:
        typeof update.companyValueUsd === "number"
          ? update.companyValueUsd
          : company.companyValueUsd,
      muskStakeValueUsd:
        typeof update.muskStakeValueUsd === "number"
          ? update.muskStakeValueUsd
          : company.muskStakeValueUsd,
      sourceUrl: update.sourceUrl || company.sourceUrl,
      ownershipNote: update.note || company.ownershipNote
    };
  });
}

function hasReportedFinancials(record) {
  return (
    typeof record.revenueUsd === "number" &&
    typeof record.netIncomeUsd === "number"
  );
}

function latestCompleted(records, asOf = today) {
  return records
    .filter(
      (record) => new Date(record.periodEnd) <= asOf && hasReportedFinancials(record)
    )
    .sort((a, b) => new Date(b.periodEnd) - new Date(a.periodEnd))[0] ?? null;
}

function attachCurrentFinancials(company, asOf = today) {
  const latestQuarter = latestCompleted(company.financials.quarters, asOf);
  const latestFiscalYear = latestCompleted(company.financials.fiscalYears, asOf);

  return {
    ...company,
    latestFinancials: {
      quarter: latestQuarter,
      fiscalYear: latestFiscalYear,
      asOf: asOf.toISOString()
    }
  };
}

export function getNetWorthPayload() {
  const generatedData = loadGeneratedData();
  const mergedSnapshots = mergeSnapshots(
    snapshots,
    generatedData.netWorthSnapshots
  );
  const mergedCompanies = mergeCompanies(
    companies,
    generatedData.companyUpdates
  );
  const generatedUpdatedAt = generatedData.updatedAt
    ? new Date(generatedData.updatedAt)
    : null;
  const currentSnapshot = mergedSnapshots.at(-1);
  const companiesWithFinancials = mergedCompanies.map((company) =>
    attachCurrentFinancials(company)
  );

  return {
    current: currentSnapshot,
    updatedAt:
      generatedUpdatedAt && !Number.isNaN(generatedUpdatedAt.valueOf())
        ? generatedUpdatedAt.toISOString()
        : new Date("2026-06-13T16:30:00.000Z").toISOString(),
    methodology:
      "This MVP ships with transparent demo seed data. Company values combine public market values and private-company estimates, so use them as directional snapshots rather than audited figures. Swap the seed file for a database-backed scheduled fetcher when you connect a licensed source or your own holdings model.",
    snapshots: mergedSnapshots,
    components,
    companies: companiesWithFinancials,
    milestones: [
      {
        label: "$500B",
        valueUsd: 500 * billion,
        reached: currentSnapshot.netWorthUsd >= 500 * billion
      },
      {
        label: "$1T",
        valueUsd: trillion,
        reached: currentSnapshot.netWorthUsd >= trillion
      },
      {
        label: "$1.5T",
        valueUsd: 1.5 * trillion,
        reached: currentSnapshot.netWorthUsd >= 1.5 * trillion
      }
    ]
  };
}
