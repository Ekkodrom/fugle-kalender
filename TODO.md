# TODO – Fugle Kalender

## Afklaring (spørgsmål til ejer)
- [x] Platform: webside, mobilvenlig (statisk HTML/CSS/JS)
- [x] Hosting: GitHub Pages – https://ekkodrom.github.io/fugle-kalender/
- [x] Grænsetilfælde: årlige sjældne gæster med som kategori "sjælden" (brugeren vælger selv via afkrydsning)
- [ ] Skal brugeren kunne afkrydse sete arter (Big Year-tjekliste)?
- [ ] Regionsfilter (fx Vadehavet, Skagen, Bornholm)?

## Data
- [x] Første udkast af artsliste i `data/fugle.json`
- [x] Afstemt mod DOF's "Danmarks Fugle": danske navne, latin, EURING-kode, kildelink pr. art
- [x] Fuldstændighedstjek mod DOF "Danmarks Fugle" (323 arter)
- [x] Måneder krydstjekket mod DOF-fænologi (22 arter rettet)
- [ ] Manuel gennemgang af ankomst/afrejse-datoer art for art mod DOF's fænologigrafer
- [ ] Overvej halvmåneds-/10-dages opløsning (DOF har 36 perioder pr. år)
- [ ] Strukturerede lokaliteter pr. art (i stedet for fritekst i `note`)

- [x] Kategori `almindelig` / `fåtallig` / `sjælden` på alle arter
- [x] Fuldstændighedstjek mod DOF's officielle liste (505 arter): 20 arter tilføjet, Slangeørn (SU-art) fjernet → 297 arter (182 / 53 / 62)
- [x] Valideringsscript (`scripts/valider-data.mjs`) – rettede 8 inkonsistente afrejsedatoer
- [x] Årlige sjældne gæster tilføjet (Steppehøg, Aftenfalk, Stylteløber, Biæder, Dværggås, Rødhalset Gås,
      Hvidøjet And, Kohejre, Sort Ibis, Topskarv, Stribet Ryle, Hvidvinget Terne, Buskrørsanger, Fuglekongesanger m.fl.)

### Bevidst udeladt
SU-arter (fx Krognæb, Høgeugle, Slangeørn, Ørnevåge, Ørkenpræstekrave), tilfældige gæster og undslupne fugle (Mandarinand, Sortsvane, Indisk Gås).

## Billeder
- [x] 296/297 arter har frit licenseret billede fra Wikimedia Commons (med fotograf + licens)
- [ ] Nattergal: find billede med fri licens (nuværende er kun GFDL)
- [ ] Gennemse billeder manuelt (rigtig art, god kvalitet, voksen fugl i dragt der ses i DK)
- [ ] Overvej at hoste billederne selv (hurtigere, uafhængig af Wikimedia) – kreditering skal bevares

## App
- [x] Forside: dags dato → liste over fugle der kan ses i dag
- [x] Vælg anden dato eller en måned (planlægning af fugletur)
- [x] Sektioner: Sidste chance / Nyankomne / Kommer snart / Kan ses
- [x] Artskort: billede, dansk navn, latin under, periode, status, månedsbjælke
- [x] Detaljevisning: træk, ankomst/afrejse, note, link til DOF, billedkreditering
- [x] Filter (status, skjul fåtallige), søgning, sortering
- [x] Hosting/udgivelse (GitHub Pages)
- [ ] Big Year-tjekliste (gem lokalt i browseren)
- [ ] "Mangler stadig"-visning: mine manglende arter der kan ses nu + sidste chance
- [ ] Vis DOF-fænologi som graf i detaljevisning
- [ ] PWA (kan installeres på telefonen, virker offline)
