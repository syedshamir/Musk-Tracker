# Musk Net Worth Tracker

An interactive zero-dependency Node dashboard for tracking Elon Musk's estimated net worth.

## What is included

- Big animated current net-worth number
- Daily movement card
- Interactive SVG history chart with `1W`, `1M`, and `ALL` ranges
- Wealth-driver breakdown cards
- Company valuation and latest financial reporting cards
- Milestone tracker
- API route at `/api/net-worth`
- Transparent demo seed data in `src/netWorthData.mjs`

## Run locally

No install step is required because the app uses only built-in Node APIs.

```powershell
npm.cmd run dev
```

Then open `http://localhost:3000`.

Keep that terminal running while you use the website. If you stop the command,
the local website stops too.

## Data source note

This MVP intentionally ships with demo seed data instead of scraping Forbes or Bloomberg directly from the browser. For production, replace `lib/net-worth-data.ts` with one of these approaches:

1. A licensed financial or wealth API.
2. A database-backed manual snapshot workflow.
3. A transparent holdings model that combines public stock prices with private-company valuation inputs.

Keep the source URL and `updatedAt` timestamp visible so users can understand freshness and reliability.

## Updating company financials

Each company in `src/netWorthData.mjs` has `financials.quarters` and
`financials.fiscalYears` arrays. Add the next report with a `periodEnd` date,
and the API automatically selects the latest completed quarter and fiscal year.

Use `null` for `revenueUsd` or `netIncomeUsd` when a private company does not
publicly disclose that figure.

## Scheduled updates

The app can read generated updates from `data/generated-data.json`. That file is
created by:

```powershell
npm.cmd run update:data
```

Available update commands:

```powershell
npm.cmd run update:net-worth
npm.cmd run update:market
npm.cmd run update:data
```

Scheduling options are included:

- Windows Task Scheduler: `scripts/register-windows-scheduled-tasks.ps1`
- Hosted cron: `.github/workflows/update-data.yml`

Windows schedule:

- Net worth runs every 6 hours.
- Public market values run Monday-Friday at 11:30 PM local time, after the regular US market close from this timezone.

Register Windows tasks from PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/register-windows-scheduled-tasks.ps1
```

Hosted GitHub schedule:

- Net worth/data refresh runs every 6 hours.
- Market refresh also runs weekdays at `22:30 UTC`, safely after regular US market close.

Environment variables:

- `NET_WORTH_SOURCE_URL`: optional JSON endpoint for current net worth. Expected fields: `netWorthUsd`, plus optional `date`, `dailyChangeUsd`, `source`, and `sourceUrl`.
- `MARKET_VALUES_SOURCE_URL`: optional JSON endpoint for company market values. Expected field: `companyUpdates` or `companies`.
- `TSLA_PRICE_USD`: optional manual fallback price for Tesla if public quote providers are unreachable.
- `TESLA_SHARES_OUTSTANDING`: optional override for Tesla market-cap calculation.
- `MUSK_TESLA_SHARES`: optional override for Musk's Tesla stake calculation.

If `NET_WORTH_SOURCE_URL` is not configured, the net-worth job safely skips the
net-worth refresh. If `MARKET_VALUES_SOURCE_URL` is not configured, the market
job attempts TSLA quote refreshes using the manual override, Yahoo Finance, and
Stooq. If all providers fail, the scheduled job skips market updates without
crashing and leaves existing values unchanged.

## Validate

This checks that the app files and seed data are valid. It does not start the
website.

```powershell
npm.cmd run build
```

For a stricter JavaScript syntax check, run:

```powershell
npm.cmd run check
```

## Suggested next upgrades

1. Add Supabase or PostgreSQL for historical snapshots.
2. Add a scheduled refresh endpoint protected by a secret.
3. Add per-company valuation notes with source links.
4. Add alert milestones such as `$1T`, `$1.25T`, and `$1.5T`.
