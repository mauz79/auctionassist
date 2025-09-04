# Serie A · Web App (GitHub Pages)

- Stagioni JSON per **anno di inizio**: `data/2021.json` … `data/2025.json`.
- Storico aggregato: `data/storico.json` (medie MV/FM, Gol/Assist/A/E; + campi 2024).
- Ricerca su `data/index.json` (stagione 2025).
- **Pagina principale**: `webapp.html` (non `index.html`). `index.html` fa redirect.

## Badge
- Affidabilità **2024 ≥ 75%**.
- **MV 2024 > 6**, **FM 2024 > 6.7**.
- Storico: **MV media > 6.1**, **FM media > 6.7**.

## Portieri
Mostriamo sempre **GS** (gol subiti) e **RP** (rigori parati); per gli altri: Gol/Assist/A/E.

## Foto
Salva le foto in `img/` con nome file uguale al **COD**: `img/<COD>.jpg|jpeg|png|webp`. Se non trovate, appare `img/placeholder.svg`.

## Pubblicazione su GitHub Pages
1. Carica la cartella `webapp/` nel repo.
2. Settings → Pages → *Deploy from branch* (branch `main`, root).
3. Apri `https://<utente>.github.io/<repo>/webapp.html`.

## Rigenerare i dati
Vedi `build_data.py` nella root del progetto (non dentro `webapp/`).
