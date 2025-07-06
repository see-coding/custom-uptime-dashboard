# Custom Uptime Dashboard

Ein selbst entwickeltes Fullstack-Dashboard zur Überwachung von Webseitenverfügbarkeit und SSL-Zertifikatsgültigkeit.

## 🔧 Technologien

- Frontend: React (Vite) + TailwindCSS + Lucide Icons
- Backend: Node.js mit Express, CORS, Axios

## 🚀 Schnellstart


### Abhängigkeiten installieren

```bash
./setup.sh
```

Oder einzeln in den Ordnern:

```bash
cd client && ./install.sh
cd server && ./install.sh
```
### 1. Frontend starten

```bash
cd client
./install.sh   # einmalig
npm run dev
```

### 2. Backend starten

```bash
cd server
./install.sh   # einmalig
npm start
```

## 📦 Projektstruktur

```
custom-uptime-dashboard/
├── client/   # React + Tailwind Dashboard UI
└── server/   # Node.js Backend API
```

## 📌 Funktionen

- Zeigt Online-/Offline-Status für beliebige Domains
- Zeigt Ablaufdatum und Resttage des SSL-Zertifikats
- Hinzufügen neuer Domains per Eingabe
- Bestehende Domains lassen sich bearbeiten und werden serverseitig in `server/data/domains.json` gespeichert
- Navigation & Footer vorhanden

## 🧠 Hinweis für Codex

Alle Dependencies sind vorbereitet, Internetzugang nach Setup wird nicht benötigt.
