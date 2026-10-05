# Fugle Kalender

App der hjælper danske fuglekiggere med at planlægge deres **Big Year** (flest arter set i Danmark på ét kalenderår).

## Formål
- Vis hvilke fuglearter der kan ses i Danmark på en given dag/måned.
- Vis hvornår trækfugle ankommer og rejser igen (fx Grågås: forårstræk feb–mar, men tilbage igen aug–nov).
- Vis hvornår forårs- og efterårstrækket begynder og slutter for hver art.
- Gør det tydeligt hvilke arter er her hele året (fx Fuglekonge) så brugeren kan prioritere de sæsonbundne.

## Afgrænsning af arter
- Kun **danske** fugle: alle arter der ses **hvert år** i Danmark – inkl. årlige sjældne gæster (`kategori: "sjælden"`).
- **Udelades:** meget sjældne gæster (ikke årlige, SU-arter), uregelmæssige invasionsarter (Krognæb, Høgeugle, Hvidvinget Korsnæb) og arter hvor fundene mest er undslupne fugle (Rustand, Mandarinand m.fl.).
- Grænse for "sjælden" med på listen: DOF-fænologiindeks (topværdi) på niveau med Sort Stork/Silkehejre (~0,004) eller derover.

## Data
- Kilde: `data/fugle.json` (én fil, UTF-8). Feltbeskrivelser ligger i `meta.felter` i filen selv.
- Nøglefelter:
  - `dansk` – vises som titel (DOF's officielle danske navn, stort begyndelsesbogstav i hvert led: "Rødrygget Tornskade").
  - `latin` – vises under det danske navn, i kursiv.
  - `periode` – menneskelæsbar tekst ("Hele året", "April–september").
  - `status` – `helår` | `sommer` | `vinter` | `træk`.
  - `kategori` – `almindelig` | `fåtallig` | `sjælden`. Brugeren vælger selv med afkrydsningsbokse hvilke der vises (gemmes i browserens localStorage; standard: almindelige + fåtallige).
  - `maaneder` – 12 tal (jan→dec): 0 = ikke til stede, 1 = fåtallig/kræver indsats, 2 = regelmæssig.
  - `ankomst` / `afrejse` – `MM-DD`. For `vinter` betyder ankomst efterår og afrejse forår (periode krydser nytår).
  - `traek` – `{ foraar, efteraar }` med hovedperioder for træk, eller `null`.
- Når data ændres: hold feltrækkefølgen, bump `meta.version` og `meta.opdateret`.

## Logik for "kan ses på dato X"
Implementeret i `kanSes()` i `app.js`:
1. `maaneder[m] === 0` → kan ikke ses.
2. `ankomst` skærer kun ankomstmåneden til (dage før ankomst skjules), hvis måneden før er 0.
3. `afrejse` skærer kun afrejsemåneden til (dage efter afrejse skjules), hvis måneden efter er 0.
   (Ellers findes overvintrende/oversomrende fugle, og hele måneden gælder.)
4. Hyppighed i måned m (`niveau()`): `kategori === "sjælden"` → sjælden; ellers `maaneder[m]` 2 = almindelig, 1 = fåtallig.

## Sprog og stil
- Al brugervendt tekst på **dansk**.
- Kode, variabelnavne og commits må gerne være på engelsk, men datafelter er danske (matcher JSON).

## Kilder (skal altid kunne linkes)
- **DOF – Danmarks Fugle**: https://dofbasen.dk/danmarksfugle/ – artsliste, officielle danske navne, EURING-koder, fænologi (DOFbasen 2016–2025).
  - Hver art har `kilde` = `https://dofbasen.dk/danmarksfugle/art/<euring>`.
  - Rådata gemt i `data/dof-arter.json` (hentes med `scripts/hent-dof-data.mjs`).
- **DOF – Den danske fugleliste (SU)**: https://www.dof.dk/om-dof/aktiv-i-dof/grupper-og-udvalg/sjaeldenhedsudvalget/den-danske-fugleliste
- `maaneder`/`ankomst`/`afrejse`/`traek` er ekspertvurdering, krydstjekket mod DOF-fænologien. NB: DOF-fænologien har huller i perioder med få indtastninger – et 0 dér betyder ikke at arten er fraværende.

## Billeder
- `data/billeder.json` (nøgle = EURING) hentes med `scripts/hent-billeder.mjs` fra Wikimedia Commons (artens hovedbillede på engelsk Wikipedia).
- Kun licenser: Public domain, CC0, CC BY, CC BY-SA. Aldrig NC/ND/GFDL-only eller billeder uden licensdata.
- CC BY/BY-SA kræver kreditering: fotograf + licens (med link) + link til Commons-siden SKAL vises ved billedet.
- Arter uden frit billede viser en pladsholder.

## Struktur
```
index.html, style.css, app.js   Statisk webside (vanilla JS, ingen build), mobil først
data/fugle.json                 Artsdata (det appen bruger)
data/billeder.json              Billed-URL'er + licens/fotograf
data/dof-arter.json             DOF-rådata (navne, latin, fænologi) til kontrol
scripts/hent-dof-data.mjs       Opdaterer dof-arter.json
scripts/hent-billeder.mjs       Opdaterer billeder.json
```

## Kør lokalt
Siden henter JSON med `fetch`, så den skal serveres via HTTP (virker ikke som `file://`):
```
python -m http.server 8000
```
Åbn http://localhost:8000. Kan hostes som statiske filer (GitHub Pages, Netlify o.l.).

## Reference
- Gammel prototype: `../fugle_app.html` (React via CDN + Tailwind, 18 arter, regionsfilter). Kun til UI-idéer.
