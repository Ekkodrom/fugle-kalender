const MAANEDER = ["januar", "februar", "marts", "april", "maj", "juni", "juli", "august", "september", "oktober", "november", "december"];
const MAANEDER_KORT = ["Jan", "Feb", "Mar", "Apr", "Maj", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"];
const STATUS = {
  alle: "Alle",
  helår: "Hele året",
  sommer: "Sommerfugl",
  vinter: "Vintergæst",
  træk: "Trækgæst",
};
const SIDSTE_CHANCE_DAGE = 21;
const NY_DAGE = 14;
const SNART_DAGE = 14;

const $ = (sel) => document.querySelector(sel);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const state = {
  mode: "dato",
  dato: idag(),
  maaned: new Date().getMonth(),
  status: "alle",
  soeg: "",
  niveauer: hentNiveauer(),
  sortering: "system",
};

let arter = [];
let billeder = {};

function hentNiveauer() {
  const standard = { almindelig: true, fåtallig: true, sjælden: false };
  try {
    const gemt = JSON.parse(localStorage.getItem("niveauer"));
    if (gemt && typeof gemt === "object") return { ...standard, ...gemt };
  } catch {}
  return standard;
}

function gemNiveauer() {
  try { localStorage.setItem("niveauer", JSON.stringify(state.niveauer)); } catch {}
}

function idag() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function tilInputDato(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function fraInputDato(s) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// Læg dage til i lokal kalendertid (sikkert hen over skift mellem sommer- og vintertid)
function plusDage(d, n) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
}

function formatDato(d) {
  return `${d.getDate()}. ${MAANEDER[d.getMonth()]}`;
}

function parseMD(md) {
  const [m, d] = md.split("-").map(Number);
  return { m: m - 1, d };
}

// Kan arten ses på en bestemt dato?
// Månedsværdien afgør; ankomst/afrejse skærer kun grænsemåneden til, når måneden
// før (ankomst) eller efter (afrejse) er 0 – ellers er der overvintrende/oversomrende fugle.
function kanSes(art, dato) {
  const m = dato.getMonth();
  const dag = dato.getDate();
  const mdr = art.maaneder;
  if (mdr[m] === 0) return false;
  if (art.ankomst) {
    const a = parseMD(art.ankomst);
    if (m === a.m && dag < a.d && mdr[(m + 11) % 12] === 0) return false;
  }
  if (art.afrejse) {
    const f = parseMD(art.afrejse);
    if (m === f.m && dag > f.d && mdr[(m + 1) % 12] === 0) return false;
  }
  return true;
}

// Første dato fra og med `fra` (højst `max` dage frem) hvor kanSes === ønsket
function findSkift(art, fra, oensket, max) {
  for (let i = 0; i <= max; i++) {
    const d = plusDage(fra, i);
    if (kanSes(art, d) === oensket) return d;
  }
  return null;
}

function analyserDato(art, dato) {
  const nu = kanSes(art, dato);
  const info = { art, nu };
  if (nu) {
    const vaek = findSkift(art, dato, false, SIDSTE_CHANCE_DAGE);
    if (vaek) {
      info.forsvinder = vaek;
      info.tilbage = findSkift(art, vaek, true, 366);
    }
    const foer = plusDage(dato, -NY_DAGE);
    if (!kanSes(art, foer)) info.ny = true;
  } else {
    const kommer = findSkift(art, dato, true, SNART_DAGE);
    if (kommer) info.kommer = kommer;
  }
  return info;
}

function passerFilter(art) {
  if (state.status !== "alle" && art.status !== state.status) return false;
  if (state.soeg) {
    const q = state.soeg.toLowerCase();
    if (!art.dansk.toLowerCase().includes(q) && !art.latin.toLowerCase().includes(q)) return false;
  }
  return true;
}

function sorter(liste) {
  if (state.sortering === "alfa") {
    return [...liste].sort((a, b) => a.art.dansk.localeCompare(b.art.dansk, "da"));
  }
  return liste;
}

// Hyppighed for arten i en given måned: sjældne arter er altid "sjælden",
// ellers afgør månedsværdien (2 = almindelig, 1 = fåtallig).
function niveau(art, m) {
  if (art.kategori === "sjælden") return "sjælden";
  return art.maaneder[m] === 2 ? "almindelig" : "fåtallig";
}

function aktivMaaned() {
  return state.mode === "dato" ? state.dato.getMonth() : state.maaned;
}

/* ---------- Rendering ---------- */

function thumb(art) {
  const b = billeder[art.id];
  if (b) return `<img class="thumb" src="${esc(b.url)}" alt="${esc(art.dansk)}" loading="lazy" decoding="async">`;
  return `<span class="thumb" aria-hidden="true">${esc(art.dansk.slice(0, 2))}</span>`;
}

function maanedsbar(art, aktiv) {
  return `<span class="bar" aria-hidden="true">${art.maaneder
    .map((v, i) => `<span class="v${v}${v && art.kategori === "sjælden" ? " sj" : ""}${i === aktiv ? " nu" : ""}"></span>`)
    .join("")}</span>`;
}

function kort(info, maaned) {
  const { art } = info;
  const tags = [`<span class="tag">${esc(STATUS[art.status])}</span>`];
  const niv = niveau(art, info.kommer ? info.kommer.getMonth() : maaned);
  if (niv === "fåtallig") tags.push(`<span class="tag faa">Fåtallig</span>`);
  if (niv === "sjælden") tags.push(`<span class="tag sj">Sjælden</span>`);
  if (info.forsvinder) tags.push(`<span class="tag warn">Forsvinder ca. ${formatDato(info.forsvinder)}</span>`);
  if (info.ny) tags.push(`<span class="tag new">Nyankommet</span>`);
  if (info.kommer) tags.push(`<span class="tag new">Kommer ca. ${formatDato(info.kommer)}</span>`);
  if (info.tilbage) tags.push(`<span class="tag">Tilbage ca. ${formatDato(info.tilbage)}</span>`);
  if (info.maanedTag) tags.push(`<span class="tag ${info.maanedTag.cls}">${esc(info.maanedTag.tekst)}</span>`);
  return `<button class="kort" data-id="${esc(art.id)}">
    ${thumb(art)}
    <span class="kort-tekst">
      <span class="navn">${esc(art.dansk)}</span>
      <span class="latin">${esc(art.latin)}</span>
      <span class="periode">${esc(art.periode)}</span>
      <span class="tags">${tags.join("")}</span>
      ${maanedsbar(art, maaned)}
    </span>
  </button>`;
}

function sektion(cls, titel, tekst, liste, maaned) {
  if (!liste.length) return "";
  return `<section class="sektion ${cls}">
    <h3>${esc(titel)} <span class="count">(${liste.length})</span></h3>
    ${tekst ? `<p>${esc(tekst)}</p>` : ""}
    <div class="grid">${sorter(liste).map((i) => kort(i, maaned)).join("")}</div>
  </section>`;
}

function renderDato() {
  const dato = state.dato;
  const erIdag = dato.getTime() === idag().getTime();
  const analyseret = arter.filter(passerFilter).map((a) => analyserDato(a, dato));
  const alle = analyseret.filter((i) => state.niveauer[niveau(i.art, (i.kommer ?? dato).getMonth())]);
  const synlige = alle.filter((i) => i.nu);
  const skjulte = analyseret.filter((i) => i.nu).length - synlige.length;

  const sidste = synlige.filter((i) => i.forsvinder);
  const nye = synlige.filter((i) => i.ny && !i.forsvinder);
  const resten = synlige.filter((i) => !i.forsvinder && !i.ny);
  const snart = alle.filter((i) => i.kommer);

  $("#overskrift").textContent = erIdag ? `I dag, ${formatDato(dato)}` : `${formatDato(dato)} ${dato.getFullYear()}`;
  $("#optaelling").textContent = `${synlige.length} arter kan ses i Danmark${erIdag ? " i dag" : " denne dag"}.${skjulte ? ` ${skjulte} skjult af dine valg.` : ""}`;

  const m = dato.getMonth();
  $("#sektioner").innerHTML =
    sektion("sidste", "Sidste chance", `Forsvinder inden for ${SIDSTE_CHANCE_DAGE} dage.`, sidste, m) +
    sektion("nye", "Nyankomne", `Kommet inden for de seneste ${NY_DAGE} dage.`, nye, m) +
    sektion("snart", "Kommer snart", `Ventes inden for ${SNART_DAGE} dage.`, snart, m) +
    sektion("", "Kan ses", "", resten, m) || `<p class="tom">Ingen arter matcher dine filtre.</p>`;
}

function renderMaaned() {
  const m = state.maaned;
  const tilStede = arter.filter((a) => a.maaneder[m] > 0 && passerFilter(a));
  const synlige = tilStede.filter((a) => state.niveauer[niveau(a, m)]);
  const skjulte = tilStede.length - synlige.length;

  const infos = synlige.map((art) => {
    const foer = art.maaneder[(m + 11) % 12];
    const efter = art.maaneder[(m + 1) % 12];
    const info = { art };
    if (foer === 0 && art.ankomst && parseMD(art.ankomst).m === m) info.maanedTag = { cls: "new", tekst: `Ankommer ca. ${formatDato(new Date(2000, m, parseMD(art.ankomst).d))}` };
    else if (foer === 0) info.maanedTag = { cls: "new", tekst: `Ankommer i ${MAANEDER[m]}` };
    if (efter === 0 && art.afrejse && parseMD(art.afrejse).m === m) info.maanedTag = { cls: "warn", tekst: `Forsvinder ca. ${formatDato(new Date(2000, m, parseMD(art.afrejse).d))}` };
    else if (efter === 0) info.maanedTag = { cls: "warn", tekst: `Sidste måned` };
    return info;
  });

  const sidste = infos.filter((i) => i.maanedTag?.cls === "warn");
  const nye = infos.filter((i) => i.maanedTag?.cls === "new");
  const resten = infos.filter((i) => !i.maanedTag);

  const navn = MAANEDER[m][0].toUpperCase() + MAANEDER[m].slice(1);
  $("#overskrift").textContent = navn;
  $("#optaelling").textContent = `${synlige.length} arter kan ses i Danmark i ${MAANEDER[m]}.${skjulte ? ` ${skjulte} skjult af dine valg.` : ""}`;
  $("#sektioner").innerHTML =
    sektion("sidste", "Sidste chance", `Er her i ${MAANEDER[m]}, men ikke i ${MAANEDER[(m + 1) % 12]}.`, sidste, m) +
    sektion("nye", "Ankommer", `Er her ikke i ${MAANEDER[(m + 11) % 12]}, men kommer i ${MAANEDER[m]}.`, nye, m) +
    sektion("", "Kan ses", "", resten, m) || `<p class="tom">Ingen arter matcher dine filtre.</p>`;
}

function render() {
  $("#mode-dato").setAttribute("aria-selected", state.mode === "dato");
  $("#mode-maaned").setAttribute("aria-selected", state.mode === "maaned");
  $("#panel-dato").hidden = state.mode !== "dato";
  $("#panel-maaned").hidden = state.mode !== "maaned";
  document.querySelectorAll("#months button").forEach((b, i) => b.setAttribute("aria-pressed", i === state.maaned));
  document.querySelectorAll("#status-chips button").forEach((b) => b.setAttribute("aria-pressed", b.dataset.status === state.status));
  $("#dato").value = tilInputDato(state.dato);
  if (state.mode === "dato") renderDato();
  else renderMaaned();
}

/* ---------- Detaljevisning ---------- */

function visDetalje(id) {
  const art = arter.find((a) => a.id === id);
  if (!art) return;
  const b = billeder[id];
  const aktiv = aktivMaaned();
  const fakta = [
    ["Status", STATUS[art.status] + (art.yngler ? " · yngler i Danmark" : "")],
    ["Hyppighed", { almindelig: "Almindelig", fåtallig: "Fåtallig – kræver indsats", sjælden: "Sjælden – få fund om året" }[art.kategori]],
    ["Periode", art.periode],
  ];
  if (art.ankomst) fakta.push([art.status === "vinter" ? "Ankommer (efterår)" : "Ankommer", "ca. " + formatDato(new Date(2000, parseMD(art.ankomst).m, parseMD(art.ankomst).d))]);
  if (art.afrejse) fakta.push([art.status === "vinter" ? "Rejser (forår)" : "Rejser", "ca. " + formatDato(new Date(2000, parseMD(art.afrejse).m, parseMD(art.afrejse).d))]);
  if (art.traek?.foraar) fakta.push(["Forårstræk", art.traek.foraar]);
  if (art.traek?.efteraar) fakta.push(["Efterårstræk", art.traek.efteraar]);

  $("#detalje-indhold").innerHTML = `
    ${b ? `<img class="d-billede" src="${esc(b.url)}" alt="${esc(art.dansk)}">` : `<div class="d-billede"></div>`}
    ${b ? `<p class="d-credit">Foto: ${esc(b.fotograf || "ukendt")} · ${b.licensUrl ? `<a href="${esc(b.licensUrl)}" target="_blank" rel="noopener">${esc(b.licens)}</a>` : esc(b.licens)} · <a href="${esc(b.side)}" target="_blank" rel="noopener">Wikimedia Commons</a></p>` : `<p class="d-credit">Intet frit billede fundet endnu.</p>`}
    <div class="d-body">
      <h2 id="d-navn">${esc(art.dansk)}</h2>
      <div class="latin">${esc(art.latin)}</div>
      <div class="d-maaneder">${art.maaneder
        .map((v, i) => `<div class="v${v}${v && art.kategori === "sjælden" ? " sj" : ""}"><span${i === aktiv ? ' style="outline:2px solid var(--text);outline-offset:1px"' : ""}></span>${MAANEDER_KORT[i]}</div>`)
        .join("")}</div>
      <div class="legend"><span><i style="background:var(--m2)"></i>Regelmæssig</span><span><i style="background:var(--m1)"></i>Fåtallig</span>${art.kategori === "sjælden" ? `<span><i style="background:repeating-linear-gradient(90deg,var(--m1) 0 3px,var(--m0) 3px 5px)"></i>Sjælden</span>` : ""}<span><i style="background:var(--m0)"></i>Normalt ikke til stede</span></div>
      <dl class="fakta">${fakta.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("")}</dl>
      ${art.note ? `<p class="note">${esc(art.note)}</p>` : ""}
      <p><a href="${esc(art.kilde)}" target="_blank" rel="noopener">${art.euring ? `Se ${esc(art.dansk)} hos DOF – Danmarks Fugle` : "Se DOF's officielle danske artsliste"} →</a></p>
    </div>`;
  $("#detalje").showModal();
}

/* ---------- Opsætning ---------- */

function opsaetKontroller() {
  $("#months").innerHTML = MAANEDER_KORT.map((m) => `<button type="button">${m}</button>`).join("");
  $("#status-chips").innerHTML = Object.entries(STATUS)
    .map(([k, v]) => `<button type="button" data-status="${k}">${v}</button>`)
    .join("");

  $("#mode-dato").addEventListener("click", () => { state.mode = "dato"; render(); });
  $("#mode-maaned").addEventListener("click", () => { state.mode = "maaned"; render(); });
  $("#dato").addEventListener("change", (e) => { if (e.target.value) { state.dato = fraInputDato(e.target.value); render(); } });
  $("#idag").addEventListener("click", () => { state.dato = idag(); render(); });
  document.querySelectorAll("#months button").forEach((b, i) => b.addEventListener("click", () => { state.maaned = i; render(); }));
  $("#status-chips").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (b) { state.status = b.dataset.status; render(); }
  });
  $("#soeg").addEventListener("input", (e) => { state.soeg = e.target.value.trim(); render(); });
  document.querySelectorAll("[data-niveau]").forEach((cb) => {
    cb.checked = state.niveauer[cb.dataset.niveau];
    cb.addEventListener("change", () => {
      state.niveauer[cb.dataset.niveau] = cb.checked;
      gemNiveauer();
      render();
    });
  });
  $("#sortering").addEventListener("change", (e) => { state.sortering = e.target.value; render(); });
  $("#sektioner").addEventListener("click", (e) => {
    const k = e.target.closest(".kort");
    if (k) visDetalje(k.dataset.id);
  });
  $("#detalje").addEventListener("click", (e) => { if (e.target === e.currentTarget) e.currentTarget.close(); });
}

// Faner: "#om" viser Om-siden, alt andet viser kalenderen
function visSide() {
  const om = location.hash === "#om";
  $("#side-kalender").hidden = om;
  $("#side-om").hidden = !om;
  $("#fane-kalender").toggleAttribute("aria-current", !om);
  $("#fane-om").toggleAttribute("aria-current", om);
  $("[aria-current]").setAttribute("aria-current", "page");
  document.title = om ? "Om denne side – Fugle Kalender" : "Fugle Kalender";
}

async function start() {
  opsaetKontroller();
  visSide();
  window.addEventListener("hashchange", () => { visSide(); window.scrollTo(0, 0); });
  try {
    const [f, b] = await Promise.all([fetch("data/fugle.json"), fetch("data/billeder.json")]);
    arter = (await f.json()).arter;
    for (const a of arter) a.id = a.euring ?? a.latin;
    billeder = b.ok ? (await b.json()).billeder : {};
  } catch (err) {
    $("#sektioner").innerHTML = `<p class="tom">Kunne ikke indlæse data. Siden skal åbnes via en webserver (ikke direkte som fil).</p>`;
    throw err;
  }
  render();
}

start();
