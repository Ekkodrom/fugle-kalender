# Fugle Kalender

Se hvilke fugle der kan ses i Danmark i dag – eller på en valgt dato/måned – og planlæg din fugletur eller dit Big Year.

- 278 danske fuglearter (almindelige, fåtallige og årlige sjældne gæster)
- Ankomst, afrejse og forårs-/efterårstræk for hver art
- "Sidste chance", "Nyankomne" og "Kommer snart"
- Mobilvenlig, statisk side (HTML/CSS/JS uden build)

## Kilder
- Artsliste, navne og fænologi: [DOF – Danmarks Fugle](https://dofbasen.dk/danmarksfugle/) (data fra [DOFbasen](https://dofbasen.dk/)). Hver art linker til sin side hos DOF.
- Billeder: [Wikimedia Commons](https://commons.wikimedia.org/) under frie licenser (CC0, Public domain, CC BY, CC BY-SA). Fotograf og licens vises ved hvert billede.

Perioder og datoer er vejledende.

## Kør lokalt
```
python -m http.server 8000
```
Åbn http://localhost:8000.

## Opdater data
```
node scripts/hent-dof-data.mjs
node scripts/hent-billeder.mjs
```
