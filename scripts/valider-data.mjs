// Tjekker data/fugle.json og data/billeder.json for fejl og uoverensstemmelser.
// Kør: node scripts/valider-data.mjs   (exit-kode 1 ved fejl)

import { readFile } from "node:fs/promises";

const load = async (p) => JSON.parse(await readFile(new URL(p, import.meta.url), "utf8"));
const { arter } = await load("../data/fugle.json");
const { billeder } = await load("../data/billeder.json");

const STATUS = ["helår", "sommer", "vinter", "træk"];
const KATEGORI = ["almindelig", "fåtallig", "sjælden"];
const MD = /^(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/;
const fejl = [];
const advarsler = [];
const set = (navn) => { const s = new Set(); return (v, a) => { if (s.has(v)) fejl.push(`${a.dansk}: dublet ${navn} "${v}"`); s.add(v); }; };
const unikId = set("id"), unikDansk = set("dansk navn"), unikLatin = set("latinsk navn");

for (const a of arter) {
  const n = a.dansk ?? "(uden navn)";
  const id = a.euring ?? a.latin;
  unikId(id, a); unikDansk(a.dansk, a); unikLatin(a.latin, a);
  for (const f of ["dansk", "latin", "gruppe", "periode", "kilde"]) if (!a[f]) fejl.push(`${n}: mangler ${f}`);
  if (a.euring !== null && !/^\d{5}$/.test(a.euring)) fejl.push(`${n}: ugyldig euring "${a.euring}"`);
  if (!STATUS.includes(a.status)) fejl.push(`${n}: ugyldig status "${a.status}"`);
  if (!KATEGORI.includes(a.kategori)) fejl.push(`${n}: ugyldig kategori "${a.kategori}"`);
  if (typeof a.yngler !== "boolean") fejl.push(`${n}: yngler skal være true/false`);
  const m = a.maaneder;
  if (!Array.isArray(m) || m.length !== 12 || m.some((v) => ![0, 1, 2].includes(v))) {
    fejl.push(`${n}: maaneder skal være 12 værdier i 0/1/2`);
    continue;
  }
  if (m.every((v) => v === 0)) fejl.push(`${n}: aldrig til stede`);
  if (a.status === "helår" && (a.ankomst || a.afrejse)) advarsler.push(`${n}: helår med ankomst/afrejse`);
  for (const f of ["ankomst", "afrejse"]) {
    if (a[f] === null) continue;
    if (!MD.test(a[f])) { fejl.push(`${n}: ugyldig ${f} "${a[f]}"`); continue; }
    const mi = Number(a[f].slice(0, 2)) - 1;
    if (m[mi] === 0) fejl.push(`${n}: ${f} ${a[f]} ligger i en måned markeret 0`);
  }
  if (a.kategori === "almindelig" && !m.includes(2)) advarsler.push(`${n}: almindelig, men ingen måned med 2`);
  if (a.traek !== null && (typeof a.traek !== "object" || !("foraar" in a.traek) || !("efteraar" in a.traek))) fejl.push(`${n}: traek skal have foraar og efteraar`);
  if (!billeder[id]) advarsler.push(`${n}: intet billede`);
}
for (const k of Object.keys(billeder)) if (!arter.some((a) => (a.euring ?? a.latin) === k)) advarsler.push(`billeder.json: ukendt nøgle ${k}`);

const c = {};
for (const a of arter) c[a.kategori] = (c[a.kategori] ?? 0) + 1;
console.log(`${arter.length} arter`, c);
for (const a of advarsler) console.log("ADVARSEL:", a);
for (const f of fejl) console.log("FEJL:", f);
console.log(fejl.length ? `${fejl.length} fejl` : "Ingen fejl");
process.exit(fejl.length ? 1 : 0);
