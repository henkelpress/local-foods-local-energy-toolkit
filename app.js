"use strict";

const DATA = window.LFLE_DATA || {};
const ZIP_FIELDS = DATA.zipFields || [];
const PLANNER_QUESTIONS = [
  ["purpose", "What is the project's purpose and scale?", "Name the agricultural function, energy function, users, and operating horizon."],
  ["operator", "What agricultural production continues—and who operates it?", "Identify the producer, lease or ownership structure, crops or livestock, and evidence of a commercial farm operation."],
  ["load", "What load or energy outcome is the system designed to serve?", "Document on-site load, export intent, storage, account type, and the responsible utility."],
  ["layout", "How do height, spacing, access, water, and safety support both uses?", "Tie the configuration to equipment, workers, animals, maintenance, emergency access, and decommissioning."],
  ["climate", "What climate and crop evidence supports the design?", "Use site-specific agronomic information; a ZIP-level climate match only starts the conversation."],
  ["path", "What is the permit, utility, insurance, and ownership path?", "Record review authority, interconnection contact, insurer, funding structure, and required agreements."],
  ["adapt", "How will the project adapt and decommission without harming the land?", "Address monitoring, operational change, soil protection, equipment removal, and financial responsibility."],
];

const SYSTEM_LABELS = {
  solar: "Solar / agrivoltaics",
  wind: "Wind",
  geothermal: "Geothermal",
  biofuels: "Biofuels / biomass",
  hydropower: "Water / micro-hydro",
  manual: "Manual / human power",
  wood: "Wood / charcoal",
  oilgas: "Oil / gas",
};

const SYSTEM_TERMS = {
  wind: ["wind"],
  geothermal: ["geothermal"],
  biofuels: ["biofuel", "biomass", "biodiesel", "digester"],
  hydropower: ["water", "hydro"],
  manual: ["manual"],
  wood: ["wood", "charcoal", "timber"],
  oilgas: ["oil", "gas"],
};

const els = {
  form: document.getElementById("profileForm"),
  zip: document.getElementById("zipInput"),
  siteArea: document.getElementById("siteArea"),
  systemType: document.getElementById("systemType"),
  role: document.getElementById("role"),
  farmUse: document.getElementById("farmUse"),
  consumerType: document.getElementById("consumerType"),
  communityType: document.getElementById("communityType"),
  energyUse: document.getElementById("energyUse"),
  message: document.getElementById("message"),
  placeTitle: document.getElementById("placeTitle"),
  placeSummary: document.getElementById("placeSummary"),
  metricZone: document.getElementById("metricZone"),
  metricClimate: document.getElementById("metricClimate"),
  metricSolar: document.getElementById("metricSolar"),
  metricPanels: document.getElementById("metricPanels"),
  metricEnergy: document.getElementById("metricEnergy"),
  snapshotCards: document.getElementById("snapshotCards"),
  fiveCs: document.getElementById("fiveCs"),
  horticultureTitle: document.getElementById("horticultureTitle"),
  climateDetails: document.getElementById("climateDetails"),
  climateFindings: document.getElementById("climateFindings"),
  plantingTags: document.getElementById("plantingTags"),
  caseResults: document.getElementById("caseResults"),
  caseLimit: document.getElementById("caseLimit"),
  fundingSearch: document.getElementById("fundingSearch"),
  fundingResults: document.getElementById("fundingResults"),
  resourceResults: document.getElementById("resourceResults"),
  plannerQuestions: document.getElementById("plannerQuestions"),
  plannerCount: document.getElementById("plannerCount"),
  plannerBar: document.getElementById("plannerBar"),
  plannerStatus: document.getElementById("plannerStatus"),
  projectNotes: document.getElementById("projectNotes"),
  profileHint: document.getElementById("profileHint"),
  zipCount: document.getElementById("zipCount"),
};

let current = null;

function init() {
  els.zipCount.textContent = number(Object.keys(DATA.zips || {}).length);
  writePlannerQuestions();
  bindEvents();
  loadQuery();
  screenSite(false);
}

function bindEvents() {
  els.form.addEventListener("submit", event => {
    event.preventDefault();
    screenSite(true);
  });
  document.getElementById("loadDanville").addEventListener("click", () => {
    loadDanville();
    document.getElementById("screening").scrollIntoView({ behavior: "smooth" });
  });
  document.getElementById("resetProfile").addEventListener("click", resetProfile);
  document.getElementById("shareScreen").addEventListener("click", copyScreenLink);
  document.getElementById("downloadMemo").addEventListener("click", downloadMemo);
  document.getElementById("downloadPlannerMemo").addEventListener("click", downloadMemo);
  document.getElementById("printScreen").addEventListener("click", () => window.print());
  els.caseLimit.addEventListener("change", renderCases);
  els.fundingSearch.addEventListener("input", renderFunding);
  document.querySelectorAll(".tab").forEach(button => button.addEventListener("click", () => activateTab(button.dataset.tab)));
  [els.systemType, els.farmUse, els.consumerType, els.communityType, els.energyUse, els.siteArea, els.role].forEach(input => input.addEventListener("change", () => screenSite(false)));
}

function loadQuery() {
  const query = new URLSearchParams(location.search);
  if (query.get("zip")) els.zip.value = query.get("zip").replace(/\D/g, "").slice(0, 5);
  if (query.get("area")) els.siteArea.value = query.get("area");
  if (query.get("system") && SYSTEM_LABELS[query.get("system")]) els.systemType.value = query.get("system");
  if (query.get("farm")) els.farmUse.value = query.get("farm");
}

function loadDanville() {
  els.zip.value = "24540";
  els.siteArea.value = "1000";
  els.systemType.value = "solar";
  els.role.value = "Planner / reviewer";
  els.farmUse.value = "Small Scale Crops";
  els.consumerType.value = "commercial";
  els.communityType.value = "Urban";
  els.energyUse.value = "Local use";
  document.querySelector("input[name=insideLocality][value=yes]").checked = true;
  els.profileHint.textContent = "Danville demo values are loaded. Replace them with your site.";
  screenSite(true);
}

function resetProfile() {
  els.form.reset();
  els.zip.value = "";
  els.siteArea.value = "1000";
  els.systemType.value = "solar";
  els.profileHint.textContent = "Enter a five-digit ZIP code to begin.";
  current = null;
  showMessage("Enter a five-digit ZIP code to build a site conversation.", "success");
  history.replaceState({}, "", location.pathname);
}

function profileInputs() {
  return {
    zip: els.zip.value.replace(/\D/g, "").slice(0, 5),
    area: Math.max(0, Number(els.siteArea.value || 0)),
    system: els.systemType.value,
    role: els.role.value,
    farmUse: els.farmUse.value,
    consumerType: els.consumerType.value,
    communityType: els.communityType.value,
    energyUse: els.energyUse.value,
    insideLocality: document.querySelector("input[name=insideLocality]:checked")?.value || "yes",
  };
}

function zipProfile(zip) {
  const values = DATA.zips?.[zip];
  if (!values) return null;
  return Object.fromEntries(ZIP_FIELDS.map((field, index) => [field, values[index] ?? null]));
}

function screenSite(updateUrl = false) {
  const inputs = profileInputs();
  if (!/^\d{5}$/.test(inputs.zip)) {
    showMessage("Enter a five-digit ZIP code.", "error");
    return;
  }
  const place = zipProfile(inputs.zip);
  if (!place) {
    showMessage(`ZIP ${inputs.zip} is not in the workbook crosswalk. Try a nearby ZIP or confirm the code.`, "error");
    return;
  }
  const rate = selectedRate(place, inputs.consumerType);
  const solarScreen = inputs.system === "solar" && inputs.area > 0 && Number.isFinite(Number(place.solar_ghi));
  const panels = solarScreen ? Math.floor(inputs.area / 21.5278216) : null;
  const annualKwh = solarScreen ? Math.round(inputs.area * 0.09290304 * Number(place.solar_ghi) * 365) : null;
  const annualMwh = annualKwh === null ? null : annualKwh / 1000;
  const annualValue = annualKwh !== null && rate !== null ? annualKwh * rate : null;
  current = { inputs, place, rate, panels, annualKwh, annualMwh, annualValue };

  els.placeTitle.textContent = [place.city, place.state].filter(Boolean).join(", ") || `ZIP ${inputs.zip}`;
  els.placeSummary.textContent = [`ZIP ${inputs.zip}`, place.county ? `${place.county} County` : "County not found", place.epa_region ? `EPA Region ${Number(place.epa_region)}` : null].filter(Boolean).join(" · ");
  els.metricZone.textContent = place.usda_zone || "—";
  els.metricClimate.textContent = place.horticulture_climate || "—";
  els.metricSolar.textContent = formatDecimal(place.solar_ghi, 2);
  els.metricPanels.textContent = panels === null ? "—" : number(panels);
  els.metricEnergy.textContent = annualMwh === null ? "—" : formatDecimal(annualMwh, annualMwh < 10 ? 1 : 0);
  els.profileHint.textContent = `${els.placeTitle.textContent} is loaded. Adjust any input to rerun the screen.`;

  renderSnapshot();
  renderHorticulture();
  renderCases();
  renderFunding();
  updatePlannerProgress();
  showMessage(`Screen updated for ${els.placeTitle.textContent}.`, "success");
  if (updateUrl) updateQuery();
}

function selectedRate(place, type) {
  const value = place[`${type}_rate`];
  return Number.isFinite(Number(value)) ? Number(value) : null;
}

function renderSnapshot() {
  if (!current) return;
  const { inputs, place, rate, panels, annualMwh, annualValue } = current;
  const transmission = place.nearest_high_voltage_kv
    ? `${place.nearest_high_voltage_kv} kV mapped line · ${place.nearest_high_voltage_owner || "owner not listed"}`
    : "No mapped line detail returned";
  const zoning = inputs.insideLocality === "yes"
    ? "Check municipal zoning and county building-code review."
    : "Check county zoning and building-code review.";
  const cards = [
    ["Location", [place.city, place.county ? `${place.county} County` : null, place.state].filter(Boolean).join(" · "), `USDA ${place.usda_zone || "not found"} · ${place.climate || "climate not found"}`],
    ["Energy screen", annualMwh === null ? `${SYSTEM_LABELS[inputs.system]} selected` : `${formatDecimal(annualMwh, 1)} MWh / year`, annualMwh === null ? "The workbook provides no comparable area-based output formula for this system." : `${number(panels)} maximum-panel area screen; layout has not been tested.`],
    ["Utility context", place.utility_provider || "Utility not found", `${title(inputs.consumerType)} rate: ${rate === null ? "not found" : currency(rate, 3) + "/kWh"} · ${place.rto_label || place.rto_code || "RTO not found"}`],
    ["Transmission context", transmission, "Proximity and voltage do not establish interconnection capacity. Contact the utility or line owner."],
    ["Estimated annual value", annualValue === null ? "Not calculated" : currency(annualValue, 0), annualValue === null ? "A workbook rate or solar output was unavailable." : `${inputs.energyUse}; before financing, test tariffs, load, curtailment, export rules, taxes, and degradation.`],
    ["Local review path", zoning, "Confirm definitions, use permissions, setbacks, height, access, stormwater, agricultural continuity, monitoring, and decommissioning."],
  ];
  els.snapshotCards.innerHTML = cards.map(([titleText, value, note]) => `
    <article class="info-card"><h4>${escapeHtml(titleText)}</h4><span class="card-value">${escapeHtml(value)}</span><p>${escapeHtml(note)}</p></article>
  `).join("");

  const fiveCs = [
    ["Climate", `${place.climate || "Unknown"}; ${place.horticulture_climate || "horticulture class not found"}.`],
    ["Configuration", inputs.system === "solar" ? `${number(panels || 0)}-panel area screen before access, spacing, height, and mounting.` : `${SYSTEM_LABELS[inputs.system]} requires a system-specific site study.`],
    ["Crops", `${labelFarmUse(inputs.farmUse)} is the selected farm function; confirm the operator and production plan.`],
    ["Compatibility", `${inputs.communityType} setting · ${inputs.energyUse.toLowerCase()} · agricultural operations must keep working.`],
    ["Collaboration", `${plannerAnswered()} of 7 planner questions have evidence recorded.`],
  ];
  els.fiveCs.innerHTML = fiveCs.map(([name, text]) => `<article class="five-c-card"><strong>${escapeHtml(name)}</strong><span>${escapeHtml(text)}</span></article>`).join("");
}

function renderHorticulture() {
  if (!current) return;
  const key = current.place.horticulture_climate;
  const item = DATA.horticulture?.[key] || {};
  els.horticultureTitle.textContent = key ? `${key} agrivoltaics` : "Climate profile not found";
  els.climateDetails.textContent = item.details || "The workbook does not include a horticultural narrative for this climate match.";
  els.climateFindings.textContent = item.findings || "Use local extension, producer, and site evidence to assess crops and growing conditions.";
  const tags = plantingItems(item.potential_planting);
  els.plantingTags.innerHTML = tags.length ? tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join("") : `<span class="tag">Local evidence required</span>`;
}

function plantingItems(text) {
  if (!text) return [];
  return text.split(/\n|•|»/).map(item => item.replace(/^[-–—\s]+/, "").trim()).filter(Boolean);
}

function renderCases() {
  if (!current) return;
  const solar = current.inputs.system === "solar";
  const source = solar ? (DATA.cases || []) : (DATA.otherCases || []).filter(caseItem => systemCaseMatch(caseItem, current.inputs.system));
  const ranked = source.map(caseItem => ({ caseItem, ...scoreCase(caseItem, solar) })).sort((a, b) => b.score - a.score || String(a.caseItem.name).localeCompare(String(b.caseItem.name)));
  const limit = els.caseLimit.value === "all" ? ranked.length : Number(els.caseLimit.value || 6);
  if (!ranked.length) {
    els.caseResults.innerHTML = `<p class="notice">No workbook case uses this system label. Use the technical resources and add a verified local precedent.</p>`;
    return;
  }
  els.caseResults.innerHTML = ranked.slice(0, limit).map(({ caseItem, score, reasons }) => caseCard(caseItem, score, reasons)).join("");
}

function systemCaseMatch(caseItem, system) {
  const text = `${caseItem.energy_type || ""} ${caseItem.overview || ""}`.toLowerCase();
  return (SYSTEM_TERMS[system] || [system]).some(term => text.includes(term));
}

function scoreCase(caseItem, isSolar) {
  let score = 0;
  const reasons = [];
  const { inputs, place } = current;
  if (caseItem.state_abbr && caseItem.state_abbr === place.state_abbr) add(35, "same state");
  else if (caseItem.state && caseItem.state === place.state) add(35, "same state");
  if (isSolar && caseItem.environment && place.climate_code && caseItem.environment === place.climate_code) add(18, "same climate code");
  if (isSolar && caseItem.usda_zone && place.usda_zone && String(caseItem.usda_zone).toLowerCase() === String(place.usda_zone).toLowerCase()) add(16, "same hardiness zone");
  if (isSolar && (caseItem.type_table === inputs.farmUse || caseItem.agri_type === inputs.farmUse)) add(24, "same farm use");
  if (caseItem.place_type && caseItem.place_type.toLowerCase() === inputs.communityType.toLowerCase()) add(10, "same community setting");
  if (caseItem.image) add(2, "featured project");
  return { score, reasons: reasons.length ? reasons : ["workbook precedent"] };
  function add(points, reason) { score += points; reasons.push(reason); }
}

function caseCard(caseItem, score, reasons) {
  const links = (caseItem.links || []).slice(0, 3).map((url, index) => `<a href="${escapeAttr(url)}" target="_blank" rel="noopener">Source ${index + 1}</a>`).join("");
  const image = caseItem.image || "assets/case-default.webp";
  const currentFacts = caseItem.current_facts ? `<p><strong>Current project note:</strong> ${escapeHtml(caseItem.current_facts)} ${caseItem.current_source ? `<a href="${escapeAttr(caseItem.current_source)}" target="_blank" rel="noopener">Official update</a>` : ""}</p>` : "";
  return `
    <article class="case-card">
      <img class="case-photo" src="${escapeAttr(image)}" alt="" loading="lazy">
      <div class="case-body">
        <h4>${escapeHtml(caseItem.name || "Case study")}</h4>
        <p class="case-place">${escapeHtml([caseItem.place, caseItem.state_abbr || caseItem.state].filter(Boolean).join(", "))}</p>
        <div class="pill-row"><span class="pill">match ${score}</span>${reasons.map(reason => `<span class="pill">${escapeHtml(reason)}</span>`).join("")}</div>
        ${currentFacts}
        <p>${escapeHtml(trim(caseItem.overview || "Workbook case record", 420))}</p>
        <div class="case-links">${links}</div>
      </div>
    </article>`;
}

function renderFunding() {
  if (!current) return;
  const query = els.fundingSearch.value.trim().toLowerCase();
  const region = String(Number(current.place.epa_region || 0));
  const state = current.place.state;
  const rows = (DATA.funding || []).filter(item => {
    const itemState = String(item.state || "").toLowerCase();
    const geographic = itemState === String(state || "").toLowerCase() || ["federal", "national", "all states", "united states"].some(term => itemState.includes(term)) || String(item.region || "") === region;
    const text = Object.values(item).join(" ").toLowerCase();
    return geographic && (!query || text.includes(query));
  });
  els.fundingResults.innerHTML = rows.length ? rows.slice(0, 35).map(resourceCard).join("") : `<p class="notice">No workbook funding row matches this geography and filter. Clear the filter or use the technical resources below.</p>`;
  const resources = (DATA.resources || []).filter(item => !query || Object.values(item).join(" ").toLowerCase().includes(query));
  els.resourceResults.innerHTML = resources.map(item => resourceCard({ program: item.title, type: item.type, description: item.description, url: item.url, state: "Planning resource" })).join("");
}

function resourceCard(item) {
  return `<article class="resource-card"><div><span class="resource-meta">${escapeHtml([item.state, item.type].filter(Boolean).join(" · "))}</span><h4>${escapeHtml(item.program || "Resource")}</h4><p>${escapeHtml(trim(item.description || "Open the official source for details.", 360))}</p></div><a class="source-link" href="${escapeAttr(item.url)}" target="_blank" rel="noopener">Official source</a></article>`;
}

function writePlannerQuestions() {
  els.plannerQuestions.innerHTML = PLANNER_QUESTIONS.map(([key, question, help], index) => `
    <label class="planner-item"><input type="checkbox" data-planner="${escapeAttr(key)}"><span><strong>${index + 1}. ${escapeHtml(question)}</strong><span>${escapeHtml(help)}</span></span></label>
  `).join("");
  els.plannerQuestions.querySelectorAll("input").forEach(input => input.addEventListener("change", () => {
    updatePlannerProgress();
    renderSnapshot();
  }));
}

function plannerAnswered() {
  return els.plannerQuestions.querySelectorAll("input:checked").length;
}

function updatePlannerProgress() {
  const answered = plannerAnswered();
  els.plannerCount.textContent = `${answered} of ${PLANNER_QUESTIONS.length}`;
  els.plannerBar.style.width = `${answered / PLANNER_QUESTIONS.length * 100}%`;
  els.plannerStatus.textContent = answered === 7 ? "Evidence recorded" : answered >= 4 ? "Partial evidence" : "Evidence not recorded";
}

function activateTab(name) {
  document.querySelectorAll(".tab").forEach(button => {
    const active = button.dataset.tab === name;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", String(active));
  });
  document.querySelectorAll(".tab-panel").forEach(panel => {
    const active = panel.dataset.panel === name;
    panel.classList.toggle("is-active", active);
    panel.hidden = !active;
  });
}

function updateQuery() {
  if (!current) return;
  const query = new URLSearchParams({ zip: current.inputs.zip, area: String(current.inputs.area), system: current.inputs.system, farm: current.inputs.farmUse });
  history.replaceState({}, "", `${location.pathname}?${query.toString()}`);
}

async function copyScreenLink() {
  updateQuery();
  try {
    await navigator.clipboard.writeText(location.href);
    showMessage("Screen link copied.", "success");
  } catch {
    showMessage("Copy the address from your browser to share this screen.", "success");
  }
}

function downloadMemo() {
  if (!current) return;
  const topCases = rankedCasesForMemo();
  const fundingRows = fundingForMemo();
  const plannerRows = PLANNER_QUESTIONS.map(([key, question], index) => `<tr><td>${index + 1}</td><td>${escapeHtml(question)}</td><td>${plannerChecked(key) ? "Evidence recorded" : "Open"}</td></tr>`).join("");
  const caseRows = topCases.map((item, index) => `<tr><td>${index + 1}</td><td>${escapeHtml(item.caseItem.name)}</td><td>${escapeHtml([item.caseItem.place, item.caseItem.state_abbr || item.caseItem.state].filter(Boolean).join(", "))}</td><td>${item.score}</td><td>${escapeHtml(item.reasons.join("; "))}</td></tr>`).join("");
  const fundingTable = fundingRows.map((item, index) => `<tr><td>${index + 1}</td><td>${escapeHtml(item.program)}</td><td>${escapeHtml(item.type || "")}</td><td>${escapeHtml(item.state || "")}</td><td>${escapeHtml(item.url || "")}</td></tr>`).join("");
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:Arial,sans-serif;color:#1f2a30;margin:32px}h1{color:#0c1935}h2{color:#24408e;margin-top:28px}table{border-collapse:collapse;width:100%;margin:10px 0}th,td{border:1px solid #b9c1cc;padding:7px;text-align:left;vertical-align:top;font-size:10pt}th{background:#eaf1fb}.note{border-left:5px solid #950f02;background:#faeae7;padding:12px}</style></head><body>
    <h1>Local Foods, Local Energy Screening Memo</h1>
    <p><strong>Location:</strong> ${escapeHtml(els.placeTitle.textContent)} · ZIP ${escapeHtml(current.inputs.zip)} · ${escapeHtml(current.place.county || "County not found")}</p>
    <p><strong>Profile:</strong> ${escapeHtml(SYSTEM_LABELS[current.inputs.system])} · ${escapeHtml(labelFarmUse(current.inputs.farmUse))} · ${escapeHtml(number(current.inputs.area))} sq ft · ${escapeHtml(current.inputs.energyUse)}</p>
    <h2>Workbook screen</h2>
    <table><tr><th>USDA zone</th><th>Climate</th><th>Solar GHI</th><th>Panel area screen</th><th>Annual solar output</th><th>Utility</th></tr><tr><td>${escapeHtml(current.place.usda_zone || "—")}</td><td>${escapeHtml(current.place.climate || "—")}</td><td>${escapeHtml(formatDecimal(current.place.solar_ghi,2))}</td><td>${escapeHtml(current.panels === null ? "—" : number(current.panels))}</td><td>${escapeHtml(current.annualMwh === null ? "—" : formatDecimal(current.annualMwh,1)+" MWh")}</td><td>${escapeHtml(current.place.utility_provider || "—")}</td></tr></table>
    <h2>Planner evidence screen</h2><table><tr><th>#</th><th>Question</th><th>Record</th></tr>${plannerRows}</table>
    <p><strong>Project notes:</strong> ${escapeHtml(els.projectNotes.value || "No notes entered.")}</p>
    <h2>Comparable cases</h2><table><tr><th>#</th><th>Case</th><th>Place</th><th>Match</th><th>Why</th></tr>${caseRows}</table>
    <h2>Workbook funding/resource rows</h2><table><tr><th>#</th><th>Program</th><th>Type</th><th>Geography</th><th>Source</th></tr>${fundingTable}</table>
    <p class="note"><strong>Screening boundary:</strong> This memo is not an engineering, financial, zoning, legal, utility-interconnection, or permit determination. Verify every location field, program, law, system assumption, and site condition with the responsible professional or agency.</p>
    <p>Generated ${escapeHtml(new Date().toLocaleString())} from the Local Foods, Local Energy web toolkit.</p>
    </body></html>`;
  download(html, `${fileStem(els.placeTitle.textContent)}-local-foods-local-energy-screen.doc`, "application/msword;charset=utf-8");
}

function rankedCasesForMemo() {
  const solar = current.inputs.system === "solar";
  const source = solar ? (DATA.cases || []) : (DATA.otherCases || []).filter(item => systemCaseMatch(item, current.inputs.system));
  return source.map(caseItem => ({ caseItem, ...scoreCase(caseItem, solar) })).sort((a,b) => b.score - a.score).slice(0, 5);
}

function fundingForMemo() {
  const region = String(Number(current.place.epa_region || 0));
  return (DATA.funding || []).filter(item => String(item.state || "").toLowerCase() === String(current.place.state || "").toLowerCase() || ["federal", "national"].some(term => String(item.state || "").toLowerCase().includes(term)) || String(item.region || "") === region).slice(0, 10);
}

function plannerChecked(key) {
  return Boolean(els.plannerQuestions.querySelector(`input[data-planner="${CSS.escape(key)}"]:checked`));
}

function showMessage(text, type) {
  els.message.textContent = text;
  els.message.className = `message is-visible ${type}`;
}

function download(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function labelFarmUse(value) {
  return ({ "Small Scale Crops": "General crops", "Micro/DIY": "Micro / DIY", Pollinators: "Pollinators", Silvavoltaics: "Trees / silvavoltaics", "Solar Grazing": "Solar grazing", Vitivoltaics: "Grapes / vitivoltaics", Aquavoltaic: "Aquaculture" })[value] || value;
}

function trim(value, limit) {
  const text = String(value || "");
  return text.length > limit ? text.slice(0, limit - 1).trim() + "…" : text;
}

function title(value) { return String(value || "").replace(/\b\w/g, character => character.toUpperCase()); }
function number(value) { return new Intl.NumberFormat("en-US").format(Number(value || 0)); }
function currency(value, digits = 0) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: digits, maximumFractionDigits: digits }).format(Number(value)); }
function formatDecimal(value, digits) { return Number.isFinite(Number(value)) ? Number(value).toFixed(digits) : "—"; }
function fileStem(value) { return String(value || "site").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "site"; }
function escapeHtml(value) { return String(value ?? "").replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]); }
function escapeAttr(value) { return escapeHtml(value); }

init();
