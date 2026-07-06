# FairwayPro — Golf webshop landingspagina

Een moderne, responsive landingspagina voor een golf-e‑commerce business
(bol.com verkooppartner), gevestigd in België en met levering in Nederland en
België.

## Wat zit erin

`index.html` is een volledig zelfstandige pagina (HTML + CSS + JS in één
bestand, geen build stap, geen externe afhankelijkheden). Secties:

- **Hero** met call‑to‑action en week‑favorieten
- **USP‑balk** (levering, retour, betalen, advies)
- **Categorieën** (clubs, ballen, kleding, tassen, accessoires, …)
- **Populaire producten** — een productgrid dat via JavaScript wordt opgebouwd
- **Verzending** — apart blok voor NL 🇳🇱 en BE 🇧🇪
- **bol.com** vertrouwensblok (verkooppartner)
- **Nieuwsbrief** en **footer**

De teksten zijn in het Nederlands, de gemeenschappelijke taal voor klanten in
zowel Nederland als Vlaanderen.

## Lokaal bekijken

Open `index.html` direct in je browser, of serveer de map:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deployen op Vercel

Deze repo is een statische site. Op Vercel:

1. Importeer de repo in Vercel.
2. Framework preset: **Other** (geen build command nodig).
3. Output directory: root (`.`).

Vercel serveert `index.html` automatisch.

## Aanpassen

- **Merknaam**: vervang `FairwayPro` overal door je eigen winkelnaam.
- **Producten**: bewerk de `products`‑array bovenin het `<script>`‑blok
  (naam, prijs, categorie, rating, korting‑tag).
- **Kleuren**: pas de CSS‑variabelen in `:root` aan (`--green-500`, `--lime`, …).
- **Links**: koppel de knoppen aan je echte bol.com‑ of webshop‑URL's.

> De productgegevens en reviews zijn voorbeelddata en dienen als placeholder.
