const rangeWindows = {
  "1W": 7,
  "1M": 31,
  "2Y": 365 * 2,
  "5Y": 365 * 5,
  "10Y": 365 * 10,
  "20Y": 365 * 20,
  ALL: Number.POSITIVE_INFINITY
};

const state = {
  payload: null,
  range: "1M"
};

function getInitialTheme() {
  const savedTheme = localStorage.getItem("musk-tracker-theme");

  if (savedTheme === "dark" || savedTheme === "light") {
    return savedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("musk-tracker-theme", theme);

  document.querySelectorAll("[data-theme-choice]").forEach((button) => {
    const isActive = button.dataset.themeChoice === theme;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
}

const moneyFormatter = new Intl.NumberFormat("en", {
  maximumFractionDigits: 2
});

function formatMoney(value) {
  if (value === null || value === undefined) {
    return "No report";
  }

  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (abs >= 1_000_000_000_000) {
    return `${sign}$${moneyFormatter.format(abs / 1_000_000_000_000)}T`;
  }

  return `${sign}$${(abs / 1_000_000_000).toFixed(1)}B`;
}

function formatProfitLabel(value) {
  if (value === null || value === undefined) {
    return "Profit / loss";
  }

  return value >= 0 ? "Profit" : "Loss";
}

function renderFinancialBlock(title, report) {
  if (!report) {
    return `
      <div class="financial-period financial-unavailable">
        <div class="financial-title">
          <span>${title}</span>
          <strong>No public report found</strong>
        </div>
        <p>No earlier completed report with revenue and profit/loss figures is available in the data set.</p>
      </div>
    `;
  }

  return `
    <div class="financial-period">
      <div class="financial-title">
        <span>${title}</span>
        <strong>${report.period}</strong>
      </div>
      <div class="financial-grid">
        <div>
          <span>Revenue</span>
          <strong>${formatMoney(report.revenueUsd)}</strong>
        </div>
        <div>
          <span>${formatProfitLabel(report.netIncomeUsd)}</span>
          <strong>${formatMoney(report.netIncomeUsd)}</strong>
        </div>
      </div>
      <p>
        ${report.status}
        ${
          report.sourceUrl
            ? `<a href="${report.sourceUrl}" target="_blank" rel="noreferrer">Report source</a>`
            : ""
        }
      </p>
    </div>
  `;
}

function formatDate(value) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

function formatPercent(change, total) {
  return `${change >= 0 ? "+" : ""}${((change / (total - change)) * 100).toFixed(2)}%`;
}

function getChartModel(points) {
  const width = 760;
  const height = 280;
  const padding = 26;
  const values = points.map((point) => point.netWorthUsd);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = Math.max(max - min, 1);

  const coordinates = points.map((point, index) => {
    const x = padding + (index / Math.max(points.length - 1, 1)) * (width - padding * 2);
    const y = height - padding - ((point.netWorthUsd - min) / spread) * (height - padding * 2);

    return { ...point, x, y };
  });

  return {
    width,
    height,
    min,
    max,
    coordinates,
    path: coordinates
      .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
      .join(" ")
  };
}

function getRangePoints(snapshots, range) {
  if (range === "ALL") {
    return snapshots;
  }

  const newestTime = Math.max(
    ...snapshots.map((snapshot) => new Date(snapshot.date).getTime())
  );
  const cutoff = newestTime - rangeWindows[range] * 24 * 60 * 60 * 1000;
  const filtered = snapshots.filter(
    (snapshot) => new Date(snapshot.date).getTime() >= cutoff
  );

  return filtered.length >= 2 ? filtered : snapshots.slice(-2);
}

function animateNetWorth(target) {
  const output = document.querySelector("#net-worth");
  const duration = 900;
  const startedAt = performance.now();

  function tick(now) {
    const progress = Math.min((now - startedAt) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    output.textContent = formatMoney(target * eased);

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  }

  requestAnimationFrame(tick);
}

function setChartFocus(point) {
  document.querySelector("#chart-value").textContent = formatMoney(point.netWorthUsd);
  document.querySelector("#chart-date").textContent = formatDate(point.date);
}

function renderChart() {
  const points = getRangePoints(state.payload.snapshots, state.range);
  const chart = getChartModel(points);
  const svg = document.querySelector("#chart");
  const first = chart.coordinates[0];
  const last = chart.coordinates.at(-1);

  svg.innerHTML = `
    <defs>
      <linearGradient id="lineGlow" x1="0" x2="1">
        <stop offset="0%" stop-color="#d8572a"></stop>
        <stop offset="50%" stop-color="#f4b942"></stop>
        <stop offset="100%" stop-color="#0e7c7b"></stop>
      </linearGradient>
      <linearGradient id="areaGlow" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stop-color="#f4b942" stop-opacity="0.32"></stop>
        <stop offset="100%" stop-color="#f4b942" stop-opacity="0"></stop>
      </linearGradient>
    </defs>
    <path
      d="${chart.path} L ${last.x} ${chart.height - 24} L ${first.x} ${chart.height - 24} Z"
      fill="url(#areaGlow)"
    ></path>
    <path d="${chart.path}" fill="none" stroke="url(#lineGlow)" stroke-width="5"></path>
    ${chart.coordinates
      .map(
        (point) => `
          <circle
            tabindex="0"
            data-date="${point.date}"
            cx="${point.x}"
            cy="${point.y}"
            r="6"
          >
            <title>${formatDate(point.date)}: ${formatMoney(point.netWorthUsd)}</title>
          </circle>
        `
      )
      .join("")}
  `;

  svg.querySelectorAll("circle").forEach((circle) => {
    circle.addEventListener("mouseenter", () => {
      const point = chart.coordinates.find((item) => item.date === circle.dataset.date);
      setChartFocus(point);
      circle.setAttribute("r", "9");
    });

    circle.addEventListener("mouseleave", () => {
      circle.setAttribute("r", "6");
    });

    circle.addEventListener("focus", () => {
      const point = chart.coordinates.find((item) => item.date === circle.dataset.date);
      setChartFocus(point);
      circle.setAttribute("r", "9");
    });
  });

  document.querySelector("#scale-min").textContent = formatMoney(chart.min);
  document.querySelector("#scale-max").textContent = formatMoney(chart.max);
  setChartFocus(state.payload.current);
}

function renderComponents() {
  const list = document.querySelector("#component-list");

  list.innerHTML = state.payload.components
    .map((component) => {
      const width = Math.max(
        (component.valueUsd / state.payload.current.netWorthUsd) * 100,
        5
      );

      return `
        <article class="component-row">
          <div class="component-title">
            <strong>${component.label}</strong>
            <span>${formatMoney(component.valueUsd)}</span>
          </div>
          <div class="bar-track">
            <div
              class="bar-fill"
              style="width: ${width}%; background: ${component.color}"
            ></div>
          </div>
          <p>${component.note}</p>
        </article>
      `;
    })
    .join("");
}

function renderCompanies() {
  const list = document.querySelector("#company-list");

  list.innerHTML = state.payload.companies
    .map(
      (company) => `
        <article class="company-card" style="--company-accent: ${company.accent}">
          <div class="company-head">
            <div>
              <strong>${company.name}</strong>
              <span>${company.role}</span>
            </div>
            <a href="${company.sourceUrl}" target="_blank" rel="noreferrer">Source</a>
          </div>
          <div class="company-metrics">
            <div>
              <span>Company value</span>
              <strong>${formatMoney(company.companyValueUsd)}</strong>
            </div>
            <div>
              <span>Musk stake value</span>
              <strong>${formatMoney(company.muskStakeValueUsd)}</strong>
            </div>
          </div>
          <div class="company-financials">
            ${renderFinancialBlock("Latest completed quarter", company.latestFinancials.quarter)}
            ${renderFinancialBlock("Latest fiscal year", company.latestFinancials.fiscalYear)}
          </div>
          <p>${company.ownershipNote}</p>
        </article>
      `
    )
    .join("");
}

function renderMilestones() {
  const list = document.querySelector("#milestone-list");

  list.innerHTML = state.payload.milestones
    .map(
      (milestone) => `
        <div class="milestone ${milestone.reached ? "reached" : ""}">
          <span>${milestone.label}</span>
          <strong>${milestone.reached ? "Reached" : "Ahead"}</strong>
        </div>
      `
    )
    .join("");
}

function renderSummary() {
  const { current, updatedAt, methodology } = state.payload;
  const dailyCard = document.querySelector("#daily-card");
  const updated = new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short"
  }).format(new Date(updatedAt));

  document.querySelector("#source-mode").textContent = current.source;
  document.querySelector("#source-link").href = current.sourceUrl;
  document.querySelector("#updated-at").textContent = `Updated ${updated}`;
  document.querySelector("#daily-change").textContent = formatMoney(current.dailyChangeUsd);
  document.querySelector("#daily-percent").textContent = formatPercent(
    current.dailyChangeUsd,
    current.netWorthUsd
  );
  document.querySelector("#methodology").textContent = methodology;

  dailyCard.classList.toggle("positive", current.dailyChangeUsd >= 0);
  dailyCard.classList.toggle("negative", current.dailyChangeUsd < 0);
  animateNetWorth(current.netWorthUsd);
}

function bindRangeTabs() {
  document.querySelectorAll("[data-range]").forEach((button) => {
    button.addEventListener("click", () => {
      state.range = button.dataset.range;
      document.querySelectorAll("[data-range]").forEach((tab) => {
        tab.classList.toggle("active", tab === button);
      });
      renderChart();
    });
  });
}

function bindThemeToggle() {
  document.querySelectorAll("[data-theme-choice]").forEach((button) => {
    button.addEventListener("click", () => {
      setTheme(button.dataset.themeChoice);
    });
  });
}

async function boot() {
  setTheme(getInitialTheme());

  const response = await fetch("/api/net-worth");
  state.payload = await response.json();

  renderSummary();
  renderChart();
  renderComponents();
  renderCompanies();
  renderMilestones();
  bindRangeTabs();
  bindThemeToggle();
}

boot().catch((error) => {
  console.error(error);
  document.querySelector("#updated-at").textContent = "Could not load net worth data.";
});
