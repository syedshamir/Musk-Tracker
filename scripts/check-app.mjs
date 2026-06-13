import { access } from "node:fs/promises";
import { getNetWorthPayload } from "../src/netWorthData.mjs";

const requiredFiles = [
  "server.mjs",
  "public/index.html",
  "public/styles.css",
  "public/app.js",
  "src/netWorthData.mjs"
];

await Promise.all(requiredFiles.map((file) => access(file)));

const payload = getNetWorthPayload();

if (!payload.current || payload.snapshots.length < 2) {
  throw new Error("Net worth payload is missing current or historical data.");
}

if (payload.components.reduce((sum, item) => sum + item.valueUsd, 0) <= 0) {
  throw new Error("Wealth component data is empty.");
}

if (!payload.companies || payload.companies.length < 4) {
  throw new Error("Company valuation data is missing.");
}

if (
  payload.companies.some(
    (company) =>
      !company.latestFinancials ||
      !("quarter" in company.latestFinancials) ||
      !("fiscalYear" in company.latestFinancials)
  )
) {
  throw new Error("Latest company financials were not computed.");
}

console.log("App smoke check passed.");
console.log("To run the website, use: npm.cmd run dev");
console.log("Then open: http://localhost:3000");
