# Custom Uptime Dashboard

Ein schlankes Fullstack-Dashboard zur Ueberwachung von Webseitenverfuegbarkeit und SSL-Zertifikaten. Das Frontend ist bewusst minimal gehalten, damit Nutzer sofort verstehen, was zu tun ist. Optional kann die Domain-Liste auch serverseitig (Datei oder Datenbank) gespeichert werden.

## Highlights

- Live-Status (Online/Offline/Fehler) fuer beliebige Domains
- SSL-Ablaufdatum mit Warnstufen
- Bearbeiten, Aktualisieren und Entfernen von Domains
- Wahlweise Speicherung im Browser oder auf dem Server (Datei/DB)
- Einfache Installation ohne extra Tools

## Voraussetzungen

- Node.js 18+ (empfohlen)

## Schnellstart

### 1) Abhaengigkeiten installieren

```bash
./setup.sh
```

### 2) Backend starten

```bash
cd server
npm start
```

### 3) Frontend starten

```bash
cd client
npm run dev
```

Dann im Browser oeffnen: http://localhost:5173

## Bedienung

1. Domain ohne Protokoll, Pfad oder Port eingeben (z. B. example.com).
2. "Hinzufuegen" klicken, um den Status zu laden.
3. Pro Eintrag stehen dir folgende Aktionen zur Verfuegung:
   - Aktualisieren: prueft den Status neu
   - Bearbeiten: Domain anpassen
   - Entfernen: Eintrag loeschen
4. Die SSL-Anzeige zeigt, ob ein Zertifikat bald ablaeuft oder bereits abgelaufen ist.

## Konfiguration (optional)

### Frontend (`client/.env`)

```bash
VITE_API_BASE_URL=http://localhost:3001
VITE_STORAGE_MODE=local
```

- `VITE_API_BASE_URL`: Basis-URL fuer das Backend.
- `VITE_STORAGE_MODE`:
  - `local`: Domains werden im Browser gespeichert (Standard).
  - `server`: Domains werden ueber das Backend gespeichert.

### Backend (`server/.env`)

```bash
PORT=3001
CORS_ORIGIN=http://localhost:5173
STORAGE_MODE=memory
STORAGE_FILE=./data/domains.json
DATABASE_URL=postgres://user:password@localhost:5432/uptime
```

- `PORT`: Backend-Port.
- `CORS_ORIGIN`: Erlaubte Origins (mehrere per Komma trennen).
- `STORAGE_MODE`:
  - `memory`: nur im RAM (Standard)
  - `file`: Domains werden in `STORAGE_FILE` gespeichert
  - `postgres`: Domains werden in einer Postgres-DB gespeichert

## Optionale Datenbank-Anbindung

Die App funktioniert komplett ohne Datenbank. Wenn du die Domain-Liste zentral speichern willst:

1. Im Frontend `VITE_STORAGE_MODE=server` setzen.
2. Im Backend `STORAGE_MODE=postgres` und `DATABASE_URL` setzen.
3. Postgres-Treiber installieren:

```bash
cd server
npm install pg
```

Die Tabelle wird beim Start automatisch angelegt.

## Projektstruktur

```
custom-uptime-dashboard/
├── client/   # React + Tailwind UI
└── server/   # Node.js API
```

## Hinweise

- Der Vite-Dev-Server proxyed `/api` automatisch auf `http://localhost:3001`.
- Fuer produktive Deployments sollte `VITE_API_BASE_URL` entsprechend gesetzt werden.

## Minimalbetrieb ohne DB

Wenn du nur die Grundfunktionen brauchst (ohne Datenbank), reicht der Standard-Setup:

1. `./setup.sh`
2. Backend starten: `cd server && npm start`
3. Frontend starten: `cd client && npm run dev`

Optional kannst du sicherstellen, dass wirklich keine DB genutzt wird:

- Frontend: `VITE_STORAGE_MODE=local`
- Backend: `STORAGE_MODE=memory`
