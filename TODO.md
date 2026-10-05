# TODO – Fugle Kalender

## Afklaring (spørgsmål til ejer)
- [x] Platform: webside, mobilvenlig (statisk HTML/CSS/JS)
- [ ] Hosting: GitHub Pages, Netlify eller eget webhotel?
- [x] Grænsetilfælde: årlige sjældne gæster med som kategori "sjælden" (brugeren vælger selv via afkrydsning)
- [ ] Skal brugeren kunne afkrydse sete arter (Big Year-tjekliste)?
- [ ] Regionsfilter (fx Vadehavet, Skagen, Bornholm)?

## Data
- [x] Første udkast af artsliste i `data/fugle.json`
- [x] Afstemt mod DOF's "Danmarks Fugle": danske navne, latin, EURING-kode, kildelink pr. art
- [x] Fuldstændighedstjek: alle DOF-arter med reelle observationsdata er med (kun sjældne udeladt)
- [x] Måneder krydstjekket mod DOF-fænologi (22 arter rettet)
- [ ] Manuel gennemgang af ankomst/afrejse-datoer art for art mod DOF's fænologigrafer
- [ ] Overvej halvmåneds-/10-dages opløsning (DOF har 36 perioder pr. år)
- [ ] Strukturerede lokaliteter pr. art (i stedet for fritekst i `note`)

- [x] Kategori `almindelig` / `fåtallig` / `sjælden` på alle arter (278 arter: 182 / 58 / 38)
- [x] 15 årlige sjældne gæster tilføjet (Steppehøg, Aftenfalk, Stylteløber, Biæder, Dværggås, Rødhalset Gås,
      Hvidøjet And, Kohejre, Sort Ibis, Topskarv, Slangeørn, Stribet Ryle, Hvidvinget Terne, Buskrørsanger, Fuglekongesanger)

### Kandidater til "sjælden" (under nuværende grænse – beslut med/uden)
Årlige, men meget få fund: Sabinemåge, Hvidvinget Måge, Hvidnæbbet Lom, Kongeederfugl, Storpiber, Rosenstær,
Lille Skrigeørn, Hærfugl, Nathejre, Damklire, Terekklire, Dværgværling, Brun Løvsanger, Sydlig Nattergal.
Invasionsarter (ikke hvert år): Krognæb, Høgeugle, Hvidvinget Korsnæb.

## Billeder
- [x] 262/263 arter har frit licenseret billede fra Wikimedia Commons (med fotograf + licens)
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
- [ ] Hosting/udgivelse
- [ ] Big Year-tjekliste (gem lokalt i browseren)
- [ ] "Mangler stadig"-visning: mine manglende arter der kan ses nu + sidste chance
- [ ] Vis DOF-fænologi som graf i detaljevisning
- [ ] PWA (kan installeres på telefonen, virker offline)
