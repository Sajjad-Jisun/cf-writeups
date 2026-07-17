// ---------- Rating tiers (Codeforces convention) ----------
const TIERS = [
  { name: "Newbie",                max: 1199, color: "var(--tier-newbie)" },
  { name: "Pupil",                 max: 1399, color: "var(--tier-pupil)" },
  { name: "Specialist",            max: 1599, color: "var(--tier-specialist)" },
  { name: "Expert",                max: 1899, color: "var(--tier-expert)" },
  { name: "Candidate Master",      max: 2099, color: "var(--tier-cm)" },
  { name: "Master",                max: 2299, color: "var(--tier-master)" },
  { name: "International Master",  max: 2399, color: "var(--tier-im)" },
  { name: "Grandmaster",           max: 2599, color: "var(--tier-gm)" },
  { name: "International GM",      max: 2999, color: "var(--tier-igm)" },
  { name: "Legendary GM",          max: Infinity, color: "var(--tier-lgm)" },
];

function tierFor(rating) {
  if (rating == null) return { name: "Unrated", color: "var(--text-faint)" };
  return TIERS.find(t => rating <= t.max) || TIERS[TIERS.length - 1];
}

// ---------- State ----------
let problems = [];
let activeId = null;

const els = {
  list: document.getElementById("problem-list"),
  listMeta: document.getElementById("list-meta"),
  search: document.getElementById("search-input"),
  tierFilter: document.getElementById("tier-filter"),
  tagFilter: document.getElementById("tag-filter"),
  reader: document.getElementById("reader-panel"),
  stats: document.getElementById("stats-row"),
};

// ---------- Load data ----------
fetch("data/problems.json")
  .then(r => {
    if (!r.ok) throw new Error("couldn't load data/problems.json");
    return r.json();
  })
  .then(data => {
    problems = data.slice().sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    populateFilters();
    renderStats();
    renderList();
    const hash = decodeURIComponent(location.hash.replace("#", ""));
    if (hash && problems.some(p => p.id === hash)) selectProblem(hash);
  })
  .catch(err => {
    els.list.innerHTML = `<p class="empty-list">${escapeHtml(err.message)}</p>`;
  });

function populateFilters() {
  TIERS.forEach(t => {
    const opt = document.createElement("option");
    opt.value = t.name;
    opt.textContent = t.name;
    els.tierFilter.appendChild(opt);
  });

  const tagSet = new Set();
  problems.forEach(p => (p.tags || []).forEach(t => tagSet.add(t)));
  [...tagSet].sort().forEach(tag => {
    const opt = document.createElement("option");
    opt.value = tag;
    opt.textContent = tag;
    els.tagFilter.appendChild(opt);
  });
}

function renderStats() {
  const total = problems.length;
  const counts = {};
  problems.forEach(p => {
    const t = tierFor(p.rating).name;
    counts[t] = (counts[t] || 0) + 1;
  });

  const chips = [`<span class="stat-chip"><b>${total}</b> solved</span>`];
  TIERS.forEach(t => {
    if (counts[t.name]) {
      chips.push(
        `<span class="stat-chip"><span class="dot" style="background:${t.color}"></span><b>${counts[t.name]}</b> ${escapeHtml(t.name)}</span>`
      );
    }
  });
  els.stats.innerHTML = chips.join("");
}

// ---------- Filtering ----------
function getFiltered() {
  const q = els.search.value.trim().toLowerCase();
  const tier = els.tierFilter.value;
  const tag = els.tagFilter.value;

  return problems.filter(p => {
    if (tier && tierFor(p.rating).name !== tier) return false;
    if (tag && !(p.tags || []).includes(tag)) return false;
    if (q) {
      const haystack = [p.title, p.id, ...(p.tags || [])].join(" ").toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}

function renderList() {
  const filtered = getFiltered();
  els.listMeta.textContent = `${filtered.length} of ${problems.length} problems`;

  if (filtered.length === 0) {
    els.list.innerHTML = `<p class="empty-list">nothing matches those filters</p>`;
    return;
  }

  els.list.innerHTML = "";
  filtered.forEach(p => {
    const tier = tierFor(p.rating);
    const row = document.createElement("button");
    row.className = "row" + (p.id === activeId ? " active" : "");
    row.style.setProperty("--row-color", tier.color);
    row.setAttribute("aria-current", p.id === activeId ? "true" : "false");
    row.innerHTML = `
      <div class="row-top">
        <span class="row-id">${escapeHtml(p.id)}</span>
        <span class="row-rating">${p.rating != null ? p.rating : "—"}</span>
      </div>
      <div class="row-title">${escapeHtml(p.title)}</div>
      ${p.reason
        ? `<div class="row-reason">${escapeHtml(p.reason)}</div>`
        : `<div class="row-tags">${(p.tags || []).slice(0, 4).map(t => `<span class="row-tag">${escapeHtml(t)}</span>`).join("")}</div>`
      }
    `;
    row.addEventListener("click", () => selectProblem(p.id));
    els.list.appendChild(row);
  });
}

// ---------- Reader ----------
function selectProblem(id) {
  activeId = id;
  location.hash = encodeURIComponent(id);
  renderList();
  renderReader();
  if (window.innerWidth <= 860) {
    els.reader.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function renderReader() {
  const p = problems.find(p => p.id === activeId);
  if (!p) {
    els.reader.innerHTML = `<div class="reader-empty">select a problem from the list<br>to read the writeup</div>`;
    return;
  }
  const tier = tierFor(p.rating);
  const bodyHtml = window.marked ? marked.parse(p.writeup || "") : escapeHtml(p.writeup || "");

  els.reader.innerHTML = `
    <div class="reader-meta">
      <span class="verdict-badge">${escapeHtml(p.verdict || "Accepted")}</span>
      <span class="reader-id">${escapeHtml(p.id)}</span>
    </div>
    <h2 class="reader-title">${escapeHtml(p.title)}</h2>
    <div class="reader-submeta">
      <span>rating <b style="color:${tier.color}">${p.rating != null ? p.rating : "unrated"}</b></span>
      <span>tier <b style="color:${tier.color}">${escapeHtml(tier.name)}</b></span>
      <span>solved <b>${escapeHtml(p.date || "—")}</b></span>
    </div>
    ${p.reason ? `
    <div class="reason-card">
      <span class="reason-label">Why I picked this</span>
      <p>${escapeHtml(p.reason)}</p>
    </div>` : ""}
    <div class="reader-body">${bodyHtml}</div>
    <div class="reader-footer">
      <a href="${escapeAttr(p.url)}" target="_blank" rel="noopener">Open on Codeforces ↗</a>
    </div>
  `;
}

// ---------- Events ----------
els.search.addEventListener("input", renderList);
els.tierFilter.addEventListener("change", renderList);
els.tagFilter.addEventListener("change", renderList);

// ---------- Helpers ----------
function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}
function escapeAttr(str) {
  return escapeHtml(str);
}
