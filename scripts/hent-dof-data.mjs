// Henter DOF's artsliste ("Danmarks Fugle") med latinske navne og fænologi.
// Kilde: https://dofbasen.dk/danmarksfugle/ (Dansk Ornitologisk Forening / DOFbasen)
// Output: data/dof-arter.json
//
// Fænologi = 36 værdier (3 tidsperioder pr. måned: d. 1-10, 11-20, 21-slut),
// gennemsnit af DOFbasen-observationer 2016-2025 som DOF selv viser på artssiden.
// Værdierne bruges relativt (til at se hvornår arten er til stede), ikke som bestandstal.
//
// Kør: node scripts/hent-dof-data.mjs

import { writeFile } from "node:fs/promises";

const API = "https://service.dofbasen.dk/DanmarksFugleBackend/api";
const OUT = new URL("../data/dof-arter.json", import.meta.url);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJson(path) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(API + path);
      if (!res.ok) throw new Error(`${res.status} ${path}`);
      return await res.json();
    } catch (err) {
      if (attempt === 3) throw err;
      await sleep(1000 * attempt);
    }
  }
}

const list = (await getJson("/home/systematically")).filter((x) => x.label);
const arter = [];

for (const [i, { label, value: euring }] of list.entries()) {
  const art = await getJson(`/art?artnr=${euring}`);
  let fenologi = null;
  let periode = null;
  try {
    const ph = await getJson(`/art/phenology?artnr=${euring}`);
    fenologi = ph.average.averageValues.map((v) => (v == null ? null : Number(v.toPrecision(3))));
    periode = `${ph.average.firstYear}-${ph.average.lastYear}`;
  } catch {
    // Ingen fænologi for arten
  }
  arter.push({
    euring,
    dansk: label,
    latin: art.artnavn?.latin ?? null,
    engelsk: art.artnavn?.english ?? null,
    link: `https://dofbasen.dk/danmarksfugle/art/${euring}`,
    fenologiPeriode: periode,
    fenologi,
  });
  process.stdout.write(`\r${i + 1}/${list.length} ${label}                    `);
  await sleep(150);
}

await writeFile(
  OUT,
  JSON.stringify(
    {
      kilde: "DOF – Danmarks Fugle (https://dofbasen.dk/danmarksfugle/), data fra DOFbasen",
      hentet: new Date().toISOString().slice(0, 10),
      arter,
    },
    null,
    1
  )
);
console.log(`\nGemt ${arter.length} arter i data/dof-arter.json`);
