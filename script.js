/* =========================================================
   THE PERFORMANCE-TO-PROMOTION DIAGNOSTIC™ — Discovery Call Edition
   Built for a single ~45-minute session: 15 rating statements
   (3 per dimension), one combined results screen, 3 next steps.

   TO CHANGE QUESTIONS: edit the CONFIG.dimensions array below.
   TO CHANGE SCORING THRESHOLDS: edit CONFIG.bands.
   TO CHANGE NEXT-STEP CONTENT: edit CONFIG.nextStepsBank.
   ========================================================= */

const CONFIG = {

  screens: ["welcome", "participant", "situation", "ratings", "results", "summary"],

  // Bands are defined directly on the RISK score (100 = highest risk, 0 = lowest).
  // This is the single source of truth for every gauge, band label, and the rubric.
  bands: [
    { min: 51, label: "Primary Barrier",         key: "barrier",       range: "51–100%", description: "This is very likely the main thing standing between the results and the next title." },
    { min: 36, label: "Advancement Risk",         key: "risk",          range: "36–50%",  description: "The gap is wide enough that it's working against the case for promotion." },
    { min: 21, label: "Inconsistent Conversion",  key: "inconsistent",  range: "21–35%",  description: "Performance is converting sometimes, but not reliably." },
    { min: 0,  label: "Strong Conversion",        key: "strong",        range: "0–20%",   description: "Performance is converting well into recognition, authority, and advancement." }
  ],

  dimensions: [
    {
      key: "performance",
      name: "Performance Conversion",
      statements: [
        "I can clearly explain how my work affects major business priorities.",
        "Senior leaders understand the measurable value I create.",
        "My level of responsibility is reflected in my title, authority, and compensation."
      ],
      prompts: [
        "Who knows about your strongest results?",
        "What evidence would make your next-level contribution difficult to dismiss?"
      ]
    },
    {
      key: "intentImpact",
      name: "Intent–Impact Alignment",
      statements: [
        "My message is usually experienced the way I intended it.",
        "I can be direct without my message being dismissed because of my delivery.",
        "I understand how my behavior may be interpreted when I am under pressure."
      ],
      prompts: [
        "What feedback suggests others experience you differently than you intend?",
        "What would change if your message landed with the same strength as your expertise?"
      ]
    },
    {
      key: "pressure",
      name: "Pressure Patterns",
      statements: [
        "I remain composed when challenged publicly.",
        "I can respond without overexplaining or becoming defensive.",
        "I communicate my recommendation clearly when the stakes are high."
      ],
      prompts: [
        "What pattern shows up right before an important meeting or decision?",
        "What would a more effective response look like in that moment?"
      ]
    },
    {
      key: "influence",
      name: "Influence and Decision Authority",
      statements: [
        "I am included early in conversations that affect my area of responsibility.",
        "My ideas are acknowledged, supported, and acted upon.",
        "I have at least one influential person who advocates for my advancement."
      ],
      prompts: [
        "Who has influence over your next opportunity?",
        "What relationship would create the greatest shift over the next 90 days?"
      ]
    },
    {
      key: "evidence",
      name: "Evidence, Advocacy, and Advancement Readiness",
      statements: [
        "I have documented measurable evidence that I am operating at the next level.",
        "I can state the title, authority, or compensation I am seeking.",
        "I can make a concise, evidence-based case for why I should be chosen for what is next."
      ],
      prompts: [
        "Is your proof documented, or only known informally?",
        "What would need to be true for you to make a credible advancement case within 90 days?"
      ]
    }
  ],

  situationOptions: [
    "I am performing above my title.",
    "I have been passed over for promotion.",
    "I receive positive feedback but no advancement.",
    "I receive contradictory feedback.",
    "I am trusted to execute but not to shape decisions.",
    "My contributions are not consistently visible.",
    "I do not know what is blocking my advancement.",
    "I am considering leaving my organization."
  ],

  // One focused next step per dimension. The two lowest-scoring
  // dimensions each contribute a step; the third slot is generic.
  nextStepsBank: {
    performance: { action: "Document 2–3 quantified outcomes from the last 12 months.", outcome: "Gives decision-makers language they can act on." },
    intentImpact: { action: "Ask one trusted stakeholder how a recent message actually landed.", outcome: "Confirms whether the gap is perception or delivery." },
    pressure: { action: "Name the pattern that shows up under pressure, and one alternative response to try next time.", outcome: "Starts shifting how you're experienced in high-stakes moments." },
    influence: { action: "Identify one relationship to strengthen with a decision-maker or sponsor.", outcome: "Builds the advocacy your next move will require." },
    evidence: { action: "Draft a one-page case: your next-level work, results, and the specific ask.", outcome: "Turns informal recognition into a documented, presentable case." }
  },
  genericNextStep: { action: "Set a 30-day check-in to track progress on your top priority.", outcome: "Keeps momentum after this conversation." },

  // Client-facing copy — shown on the Results screen and the printed/exported summary.
  definitions: {
    conversionRisk: "This starts at 100% and moves down as the answers show where the performance is not converting into recognition, authority, and advancement. It doesn't measure competence — it measures how well or not your work is currently translating into your next move.",
    eqiNote: "The EQ‑i® 2.0 assessment (MHS) is available to provide deeper, validated diagnostic insight if you move forward as a client."
  },

  // Maps each diagnostic dimension to the EQ Impact® pillar(s) it draws on,
  // so the summary can show which pillars are implicated by a client's gaps.
  pillarMap: {
    performance: ["Self-Discovery", "Relationship Building"],
    intentImpact: ["Emotional Mastery", "Social Intelligence"],
    pressure: ["Emotional Mastery"],
    influence: ["Social Intelligence", "Relationship Building"],
    evidence: ["Self-Discovery", "Relationship Building"]
  },
  pillarDefinitions: {
    "Self-Discovery": "Know yourself before you lead others.",
    "Emotional Mastery": "Lead your emotions so they do not lead you.",
    "Social Intelligence": "Understand people beyond their words.",
    "Relationship Building": "Turn awareness into influence."
  }
};

// =========================================================
// STATE
// =========================================================
const STORAGE_KEY = "ptp_diagnostic_state_v2";

function defaultState() {
  return {
    currentScreenIndex: 0,
    participant: {},
    situation: { selected: [], answers: {} },
    ratings: {},          // { statementId: 1-5 }
    commitments: "",
    facilitatorNotes: ""
  };
}

let state = defaultState();

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    flashSaveIndicator();
  } catch (e) { /* localStorage unavailable — fail silently */ }
}

function flashSaveIndicator() {
  const el = document.getElementById("saveIndicator");
  if (!el) return;
  el.textContent = "Saved";
  clearTimeout(flashSaveIndicator._t);
  flashSaveIndicator._t = setTimeout(() => { el.textContent = ""; }, 1500);
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* corrupt state — ignore */ }
  return null;
}

// =========================================================
// SCORING
// =========================================================
function dimensionScore(dim) {
  let sum = 0, answered = 0;
  dim.statements.forEach((_, i) => {
    const id = dim.key + "_" + i;
    const val = state.ratings[id];
    // Rescale 1–5 to 0–4 so a rating of 1 ("Rarely true") earns zero
    // conversion credit — identical to leaving the item unanswered.
    // Only ratings above 1 move the score (and therefore risk) down.
    if (val) { sum += (val - 1); answered++; }
  });
  const max = dim.statements.length * 4;
  return { pct: max ? Math.round((sum / max) * 100) : 0, answered, total: dim.statements.length };
}

function allDimensionScores() {
  return CONFIG.dimensions.map(dim => ({ dim, score: dimensionScore(dim) }));
}

function overallScore() {
  const scores = allDimensionScores().map(d => d.score.pct);
  if (!scores.length) return 0;
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
}

function bandFor(pct) {
  return CONFIG.bands.find(b => pct >= b.min) || CONFIG.bands[CONFIG.bands.length - 1];
}

// =========================================================
// GAUGE RENDERING (signature element — instrument-style arc)
// =========================================================
function riskScore() { return 100 - overallScore(); }
function dimensionRisk(score) { return 100 - score.pct; }

function renderGauge(pct, size = 160) {
  const band = bandFor(pct);
  const colorMap = { strong: "var(--band-strong)", inconsistent: "var(--band-inconsistent)", risk: "var(--band-risk)", barrier: "var(--band-barrier)" };
  const color = colorMap[band.key];
  const r = size / 2 - 14;
  const cx = size / 2, cy = size / 2;
  const startAngle = -210, endAngle = 30; // 240 degree sweep

  function polar(cx, cy, r, deg) {
    const rad = (deg - 90) * Math.PI / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }
  function arcPath(r, a1, a2) {
    const p1 = polar(cx, cy, r, a1);
    const p2 = polar(cx, cy, r, a2);
    const large = (a2 - a1) % 360 > 180 ? 1 : 0;
    return `M ${p1.x} ${p1.y} A ${r} ${r} 0 ${large} 1 ${p2.x} ${p2.y}`;
  }

  const angle = startAngle + (endAngle - startAngle) * (pct / 100);
  const needleEnd = polar(cx, cy, r - 6, angle);

  return `
  <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="Score ${pct} percent, ${band.label}">
    <path d="${arcPath(r, startAngle, endAngle)}" fill="none" stroke="var(--color-border)" stroke-width="10" stroke-linecap="round"/>
    <path d="${arcPath(r, startAngle, angle)}" fill="none" stroke="${color}" stroke-width="10" stroke-linecap="round"/>
    <line x1="${cx}" y1="${cy}" x2="${needleEnd.x}" y2="${needleEnd.y}" stroke="var(--color-primary)" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="${cx}" cy="${cy}" r="5" fill="var(--color-primary)"/>
    <text x="${cx}" y="${cy + size*0.28}" text-anchor="middle" class="gauge-value" style="font-size:${size*0.17}px; fill: var(--color-primary);">${pct}%</text>
  </svg>`;
}

// =========================================================
// NAVIGATION
// =========================================================
function currentScreen() { return CONFIG.screens[state.currentScreenIndex]; }

function goToScreen(index) {
  state.currentScreenIndex = Math.max(0, Math.min(CONFIG.screens.length - 1, index));
  renderScreen();
  saveState();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderProgress() {
  const labels = ["Welcome", "Info", "Situation", "Ratings", "Results", "Summary"];
  const list = document.getElementById("progressList");
  list.innerHTML = labels.map((l, i) => {
    let cls = "";
    if (i === state.currentScreenIndex) cls = "active";
    else if (i < state.currentScreenIndex) cls = "done";
    return `<li class="${cls}">${l}</li>`;
  }).join("");
}

function renderScreen() {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  const screenName = currentScreen();
  document.getElementById("screen-" + screenName).classList.add("active");
  renderProgress();

  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");
  prevBtn.style.visibility = state.currentScreenIndex === 0 ? "hidden" : "visible";
  nextBtn.textContent = screenName === "summary" ? "Done" : "Next";
  nextBtn.style.display = screenName === "welcome" ? "none" : "inline-block";

  document.querySelector(".app-footer").style.display = screenName === "welcome" ? "none" : "flex";

  switch (screenName) {
    case "welcome": renderWelcome(); break;
    case "participant": renderParticipant(); break;
    case "situation": renderSituation(); break;
    case "ratings": renderRatings(); break;
    case "results": renderResults(); break;
    case "summary": renderSummary(); break;
  }
}

function validateCurrentScreen() {
  const screenName = currentScreen();
  if (screenName === "participant") {
    const required = ["firstName", "lastName", "primaryGoal"];
    for (const id of required) {
      const el = document.getElementById(id);
      if (!el.value.trim()) { el.focus(); return false; }
    }
  }
  if (screenName === "situation" && (!state.situation.selected || state.situation.selected.length === 0)) {
    document.getElementById("situationRadios").scrollIntoView({ behavior: "smooth", block: "center" });
    return false;
  }
  return true;
}

// =========================================================
// SCREEN: WELCOME
// =========================================================
function renderWelcome() {
  document.getElementById("heroGauge").innerHTML = renderGauge(38, 140);
  const saved = loadState();
  const banner = document.getElementById("resumeBanner");
  banner.hidden = !(saved && saved.currentScreenIndex > 0);
}

// =========================================================
// SCREEN: PARTICIPANT
// =========================================================
function renderParticipant() {
  const fields = ["firstName","lastName","title","primaryGoal","facilitatorName","sessionDate"];
  fields.forEach(f => {
    const el = document.getElementById(f);
    if (state.participant[f] !== undefined) el.value = state.participant[f];
    el.oninput = () => { state.participant[f] = el.value; saveState(); };
    el.onchange = () => { state.participant[f] = el.value; saveState(); };
  });
}

// =========================================================
// SCREEN: SITUATION
// =========================================================
function renderSituation() {
  const container = document.getElementById("situationRadios");
  const selected = state.situation.selected || [];
  container.innerHTML = CONFIG.situationOptions.map((opt, i) => `
    <label class="radio-option ${selected.includes(opt) ? "selected" : ""}">
      <input type="checkbox" value="${i}" ${selected.includes(opt) ? "checked" : ""}>
      <span>${opt}</span>
    </label>`).join("");
  container.querySelectorAll("input[type=checkbox]").forEach(input => {
    input.addEventListener("change", () => {
      const opt = CONFIG.situationOptions[input.value];
      const idx = state.situation.selected.indexOf(opt);
      if (input.checked && idx === -1) state.situation.selected.push(opt);
      if (!input.checked && idx !== -1) state.situation.selected.splice(idx, 1);
      renderSituation();
      saveState();
    });
  });

  const qIds = ["q_proud_result","q_result_blocked"];
  qIds.forEach(id => {
    const el = document.getElementById(id);
    el.value = state.situation.answers[id] || "";
    el.oninput = () => { state.situation.answers[id] = el.value; saveState(); };
  });
}

// =========================================================
// SCREEN: RATINGS
// =========================================================
const SCALE_LABELS = { 1: "Rarely", 2: "Sometimes", 3: "Often", 4: "Usually", 5: "Consistently" };

function renderRatings() {
  const container = document.getElementById("ratingGroups");
  container.innerHTML = CONFIG.dimensions.map(dim => `
    <div class="rating-group">
      <h3>${dim.name} <span class="dim-tag">Dimension</span></h3>
      ${dim.statements.map((stmt, i) => {
        const id = dim.key + "_" + i;
        return `
        <div class="rating-row">
          <p class="rating-statement">${stmt}</p>
          <div class="scale" data-id="${id}">
            ${[1,2,3,4,5].map(v => `
              <div class="scale-option ${state.ratings[id] === v ? "selected" : ""}" data-value="${v}">
                <strong>${v}</strong>${SCALE_LABELS[v]}
              </div>`).join("")}
          </div>
        </div>`;
      }).join("")}
    </div>
  `).join("");

  container.querySelectorAll(".scale").forEach(scaleEl => {
    const id = scaleEl.dataset.id;
    scaleEl.querySelectorAll(".scale-option").forEach(opt => {
      opt.addEventListener("click", () => {
        state.ratings[id] = parseInt(opt.dataset.value, 10);
        scaleEl.querySelectorAll(".scale-option").forEach(o => o.classList.remove("selected"));
        opt.classList.add("selected");
        saveState();
        renderLiveRisk();
      });
    });
  });

  renderLiveRisk();
}

function renderLiveRisk() {
  const el = document.getElementById("liveRiskGauge");
  if (!el) return;
  el.innerHTML = renderGauge(riskScore(), 120);
}

// =========================================================
// SCREEN: RESULTS + NEXT STEPS
// =========================================================
function sortedDimensionScores() {
  return allDimensionScores().slice().sort((a, b) => a.score.pct - b.score.pct); // ascending: lowest first
}

function topStrengthAndBarriers() {
  const scores = sortedDimensionScores();
  return {
    strength: scores[scores.length - 1],
    primaryBarrier: scores[0],
    secondaryBarrier: scores[1]
  };
}

function recommendationTier() {
  const scores = allDimensionScores();
  const barrierCount = scores.filter(d => d.score.pct < 65).length;
  const overall = overallScore();
  if (barrierCount === 0 && overall >= 75) return "A";
  if (barrierCount <= 2) return "B";
  return "C";
}

const RECOMMENDATIONS = {
  A: { label: "Self-directed", body: "You have a clear, contained gap — you can likely close it independently over the next 30 days." },
  B: { label: "Targeted support", body: "Focused coaching on 1–2 specific patterns would accelerate this." },
  C: { label: "Full framework", body: "This spans multiple patterns — a structured program would help you close the gap systematically." }
};

function buildNextSteps() {
  const { primaryBarrier, secondaryBarrier } = topStrengthAndBarriers();
  const steps = [];
  if (primaryBarrier) steps.push(CONFIG.nextStepsBank[primaryBarrier.dim.key]);
  if (secondaryBarrier && secondaryBarrier.dim.key !== (primaryBarrier && primaryBarrier.dim.key)) {
    steps.push(CONFIG.nextStepsBank[secondaryBarrier.dim.key]);
  }
  steps.push(CONFIG.genericNextStep);
  return steps.slice(0, 3);
}

function renderRubricRows() {
  return CONFIG.bands.slice().reverse().map(b => `
    <tr>
      <td>${b.range}</td>
      <td>${b.label}</td>
      <td>${b.description}</td>
    </tr>`).join("");
}

function renderResults() {
  const risk = riskScore();
  const band = bandFor(risk);
  document.getElementById("overallGauge").innerHTML = renderGauge(risk, 200);
  document.getElementById("overallBand").textContent = band.label;
  document.getElementById("scoreCaveat").textContent = CONFIG.definitions.conversionRisk;
  document.getElementById("rubricTable").innerHTML = renderRubricRows();

  const dimGrid = document.getElementById("dimensionGrid");
  const colorMap = { strong: "var(--band-strong)", inconsistent: "var(--band-inconsistent)", risk: "var(--band-risk)", barrier: "var(--band-barrier)" };
  dimGrid.innerHTML = allDimensionScores().map(({ dim, score }) => {
    const dRisk = dimensionRisk(score);
    const b = bandFor(dRisk);
    return `
    <div class="dimension-card">
      <h4>${dim.name}</h4>
      <div class="dimension-bar-track"><div class="dimension-bar-fill" style="width:${dRisk}%; background:${colorMap[b.key]}"></div></div>
      <p><span class="pct">${dRisk}%</span> risk &nbsp; <span class="band-label">${b.label}</span></p>
    </div>`;
  }).join("");

  const { strength, primaryBarrier, secondaryBarrier } = topStrengthAndBarriers();
  document.getElementById("resultsSummaryCards").innerHTML = `
    <div class="summary-mini-card"><div class="label">Top Strength</div><div class="value">${strength.dim.name}</div></div>
    <div class="summary-mini-card"><div class="label">Primary Barrier</div><div class="value">${primaryBarrier.dim.name}</div></div>
    <div class="summary-mini-card"><div class="label">Secondary Barrier</div><div class="value">${secondaryBarrier.dim.name}</div></div>
  `;

  document.getElementById("facilitatorPrompts").innerHTML = [primaryBarrier, secondaryBarrier].map(({ dim }) => `
    <div class="prompt-group">
      <p class="prompt-dim">${dim.name}</p>
      <ul>${dim.prompts.map(p => `<li>${p}</li>`).join("")}</ul>
    </div>
  `).join("");

  document.getElementById("nextStepsList").innerHTML = buildNextSteps().map(s => `
    <li><span class="step-action">${s.action}</span><span class="step-outcome">${s.outcome}</span></li>
  `).join("");

  const rec = RECOMMENDATIONS[recommendationTier()];
  document.getElementById("recommendationLine").innerHTML = `<strong>${rec.label}:</strong> ${rec.body}`;
}

function impactedPillars() {
  const { primaryBarrier, secondaryBarrier } = topStrengthAndBarriers();
  const keys = [primaryBarrier, secondaryBarrier].filter(Boolean).map(d => d.dim.key);
  const names = [];
  keys.forEach(k => {
    (CONFIG.pillarMap[k] || []).forEach(name => { if (!names.includes(name)) names.push(name); });
  });
  return names.map(name => ({ name, tagline: CONFIG.pillarDefinitions[name] }));
}

// =========================================================
// SCREEN: SUMMARY
// =========================================================
function renderSummary() {
  const p = state.participant;
  const risk = riskScore();
  const band = bandFor(risk);
  const { strength, primaryBarrier, secondaryBarrier } = topStrengthAndBarriers();
  const rec = RECOMMENDATIONS[recommendationTier()];
  const dateStr = p.sessionDate || new Date().toISOString().slice(0,10);

  document.getElementById("summaryContent").innerHTML = `
    <div class="summary-section">
      <h3>Participant</h3>
      <div class="summary-kv">
        <div><span class="k">Name</span>${escapeHtml((p.firstName||"") + " " + (p.lastName||""))}</div>
        <div><span class="k">Title</span>${escapeHtml(p.title||"—")}</div>
        <div><span class="k">Date</span>${escapeHtml(dateStr)}</div>
        <div><span class="k">Primary Goal</span>${escapeHtml(p.primaryGoal||"—")}</div>
      </div>
    </div>
    <div class="summary-section">
      <h3>What This Score Means</h3>
      <p>${CONFIG.definitions.conversionRisk}</p>
      <table class="rubric-table">
        <thead><tr><th>Risk Range</th><th>Label</th><th>What It Means</th></tr></thead>
        <tbody>${renderRubricRows()}</tbody>
      </table>
    </div>
    <div class="summary-section">
      <h3>Overall Conversion Risk</h3>
      <p><strong>${risk}%</strong> — ${band.label}</p>
    </div>
    <div class="summary-section">
      <h3>Top Strength / Barriers</h3>
      <div class="summary-kv">
        <div><span class="k">Top Strength</span>${strength.dim.name}</div>
        <div><span class="k">Primary Barrier</span>${primaryBarrier.dim.name}</div>
        <div><span class="k">Secondary Barrier</span>${secondaryBarrier.dim.name}</div>
      </div>
    </div>
    <div class="summary-section">
      <h3>EQ Impact<span class="reg">®</span> Pillars Likely Impacted</h3>
      <div class="pillar-grid">
        ${impactedPillars().map(p => `<div class="pillar-card"><p class="pillar-name">${p.name}</p><p class="pillar-tagline">${p.tagline}</p></div>`).join("")}
      </div>
    </div>
    <div class="summary-section">
      <h3>3 Next Steps</h3>
      <ol class="next-steps-list">${buildNextSteps().map(s => `<li><span class="step-action">${s.action}</span><span class="step-outcome">${s.outcome}</span></li>`).join("")}</ol>
    </div>
    <div class="summary-section">
      <h3>Recommendation</h3>
      <p><strong>${rec.label}</strong> — ${rec.body}</p>
    </div>
    <p class="eqi-note">${CONFIG.definitions.eqiNote}</p>
  `;

  document.getElementById("participantCommitments").value = state.commitments || "";
  document.getElementById("facilitatorNotes").value = state.facilitatorNotes || "";

  document.getElementById("participantCommitments").oninput = (e) => { state.commitments = e.target.value; saveState(); };
  document.getElementById("facilitatorNotes").oninput = (e) => { state.facilitatorNotes = e.target.value; saveState(); };
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, m => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m]));
}

// =========================================================
// EXPORTS
// =========================================================
function buildExportObject() {
  return {
    participant: state.participant,
    situation: state.situation,
    ratings: state.ratings,
    dimensionRisk: allDimensionScores().map(({dim, score}) => ({ dimension: dim.name, riskPercent: dimensionRisk(score), band: bandFor(dimensionRisk(score)).label })),
    overallRisk: riskScore(),
    overallBand: bandFor(riskScore()).label,
    nextSteps: buildNextSteps(),
    impactedPillars: impactedPillars().map(p => p.name),
    recommendation: RECOMMENDATIONS[recommendationTier()].label,
    commitments: state.commitments,
    facilitatorNotes: state.facilitatorNotes,
    exportedAt: new Date().toISOString()
  };
}

function exportJson() {
  const data = buildExportObject();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  downloadBlob(blob, "ptp-diagnostic-results.json");
}

function exportCsv() {
  const data = buildExportObject();
  const rows = [["Field", "Value"]];
  rows.push(["First name", data.participant.firstName || ""]);
  rows.push(["Last name", data.participant.lastName || ""]);
  rows.push(["Overall risk", data.overallRisk + "%"]);
  rows.push(["Overall band", data.overallBand]);
  data.dimensionRisk.forEach(d => rows.push([d.dimension, d.riskPercent + "% (" + d.band + ")"]));
  data.nextSteps.forEach((s, i) => rows.push(["Next step " + (i+1), s.action]));
  rows.push(["EQ Impact pillars impacted", data.impactedPillars.join("; ")]);
  rows.push(["Recommendation", data.recommendation]);
  rows.push(["Commitment", data.commitments || ""]);
  const csv = rows.map(r => r.map(csvEscape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  downloadBlob(blob, "ptp-diagnostic-results.csv");
}

function csvEscape(val) {
  const s = String(val ?? "");
  if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function downloadPdf() {
  const el = document.getElementById("printableSummary");
  if (!window.html2canvas || !window.jspdf) {
    window.print();
    return;
  }
  html2canvas(el, { scale: 2, backgroundColor: "#ffffff" }).then(canvas => {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF("p", "pt", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgWidth = pageWidth - 60;
    const imgHeight = canvas.height * (imgWidth / canvas.width);
    let heightLeft = imgHeight;
    let position = 30;
    const imgData = canvas.toDataURL("image/png");
    pdf.addImage(imgData, "PNG", 30, position, imgWidth, imgHeight);
    heightLeft -= (pdf.internal.pageSize.getHeight() - 60);
    while (heightLeft > 0) {
      position = heightLeft - imgHeight + 30;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 30, position, imgWidth, imgHeight);
      heightLeft -= (pdf.internal.pageSize.getHeight() - 60);
    }
    pdf.save("ptp-diagnostic-summary.pdf");
  }).catch(() => window.print());
}

// =========================================================
// INIT
// =========================================================
function init() {
  document.getElementById("startBtn").addEventListener("click", () => goToScreen(1));
  document.getElementById("resumeBtn").addEventListener("click", () => {
    const saved = loadState();
    if (saved) { state = saved; renderScreen(); }
  });
  document.getElementById("discardBtn").addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEY);
    document.getElementById("resumeBanner").hidden = true;
  });

  document.getElementById("prevBtn").addEventListener("click", () => goToScreen(state.currentScreenIndex - 1));
  document.getElementById("nextBtn").addEventListener("click", () => {
    if (!validateCurrentScreen()) return;
    if (currentScreen() === "summary") return;
    goToScreen(state.currentScreenIndex + 1);
  });

  function clearSession(skipConfirm) {
    if (!skipConfirm && !confirm("Clear this session? This wipes all responses so you can start fresh with someone new.")) return;
    localStorage.removeItem(STORAGE_KEY);
    state = defaultState();
    goToScreen(0);
  }

  document.getElementById("headerClearBtn").addEventListener("click", () => clearSession(false));
  document.getElementById("resetBtn").addEventListener("click", () => clearSession(false));

  document.getElementById("printBtn").addEventListener("click", () => window.print());
  document.getElementById("pdfBtn").addEventListener("click", downloadPdf);
  document.getElementById("exportJsonBtn").addEventListener("click", exportJson);
  document.getElementById("exportCsvBtn").addEventListener("click", exportCsv);

  document.querySelectorAll("[data-placeholder]").forEach(el => {
    if (el.tagName === "IMG") { el.alt = el.dataset.placeholder; }
  });

  const saved = loadState();
  if (saved) { state = saved; }
  renderScreen();
}

document.addEventListener("DOMContentLoaded", init);
