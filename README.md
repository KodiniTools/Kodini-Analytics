# KodiniTools Analytics

Privacy-First Analytics für kodinitools.com - keine Cookies, keine IP-Speicherung, keine Nutzerdaten.

## Features

- ✅ **Privacy-First**: Keine Cookies, keine IP-Speicherung, kein Fingerprinting
- ✅ **Leichtgewichtig**: Tracker < 1KB
- ✅ **Self-Hosted**: Läuft auf deinem VPS
- ✅ **Vue 3 Dashboard**: Moderne Oberfläche mit Charts
- ✅ **Region-Tracking**: Country-Level (via Cloudflare/Nginx GeoIP)

## Architektur

```
┌─────────────────────────────────────────────────────────────┐
│                    kodinitools.com                          │
│                                                             │
│   ┌─────────────────────────────────────────────────────┐  │
│   │  <script src="https://analytics.kodinitools.com/    │  │
│   │           tracker.js" defer></script>               │  │
│   └─────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│               analytics.kodinitools.com                     │
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐ │
│  │   Nginx     │───▶│  Express    │───▶│   SQLite DB     │ │
│  │   Proxy     │    │  Backend    │    │  (aggregiert)   │ │
│  └─────────────┘    └─────────────┘    └─────────────────┘ │
│                            │                                │
│                            ▼                                │
│                     ┌─────────────┐                         │
│                     │ Vue 3       │                         │
│                     │ Dashboard   │                         │
│                     └─────────────┘                         │
└─────────────────────────────────────────────────────────────┘
```

## Installation

### 1. Projekt auf Server kopieren

```bash
# Auf dem VPS
cd /var/www
git clone <repo-url> kodini-analytics
# oder: scp -r ./kodini-analytics user@server:/var/www/
```

### 2. Backend installieren

```bash
cd /var/www/kodini-analytics/backend

# Dependencies installieren
npm install

# Environment konfigurieren
cp .env.example .env
nano .env  # Token anpassen!

# Datenbank-Verzeichnis erstellen
mkdir -p data

# TypeScript kompilieren
npm run build
```

### 3. Dashboard bauen

```bash
cd /var/www/kodini-analytics/dashboard

# Dependencies installieren
npm install

# Production Build (wird nach backend/public kopiert)
npm run build
```

### 4. Systemd Service einrichten

```bash
# Service kopieren
sudo cp /var/www/kodini-analytics/kodini-analytics.service /etc/systemd/system/

# Service aktivieren
sudo systemctl daemon-reload
sudo systemctl enable kodini-analytics
sudo systemctl start kodini-analytics

# Status prüfen
sudo systemctl status kodini-analytics
```

### 5. Nginx konfigurieren

```bash
# SSL-Zertifikat erstellen (falls noch nicht vorhanden)
sudo certbot certonly --nginx -d analytics.kodinitools.com

# Nginx-Konfiguration kopieren
sudo cp /var/www/kodini-analytics/nginx.conf /etc/nginx/sites-available/analytics.kodinitools.com
sudo ln -s /etc/nginx/sites-available/analytics.kodinitools.com /etc/nginx/sites-enabled/

# Konfiguration testen
sudo nginx -t

# Nginx neu laden
sudo systemctl reload nginx
```

### 6. Tracker auf Website einbinden

Füge auf jeder Seite von kodinitools.com vor `</body>` ein:

```html
<script 
  src="https://analytics.kodinitools.com/tracker.js" 
  data-api="https://analytics.kodinitools.com/api" 
  defer>
</script>
```

Oder als Tracking-Pixel (noscript fallback):

```html
<noscript>
  <img src="https://analytics.kodinitools.com/api/pixel.gif?p=/audiokonverter/" 
       alt="" width="1" height="1" />
</noscript>
```

## Dashboard Zugang

Das Dashboard ist unter `https://analytics.kodinitools.com/` erreichbar.

**Authentifizierung:**

1. Token in URL: `https://analytics.kodinitools.com/?token=DEIN_TOKEN`
2. Token wird im localStorage gespeichert
3. Oder: Authorization Header (für API-Zugriff)

## API Endpoints

### Tracking (öffentlich)

```
POST /api/track
Body: { "page": "/audiokonverter/" }

GET /api/pixel.gif?p=/audiokonverter/
```

### Stats (Token erforderlich)

```
GET /api/stats/overview?period=30d
GET /api/stats/daily?period=30d&page=/audiokonverter/
GET /api/stats/regions?period=30d
GET /api/stats/live
GET /api/stats/hourly
```

## Datenbank

Die Datenbank (`backend/data/analytics.db`) enthält nur aggregierte Daten:

- **page_views**: Tägliche Views pro Seite
- **region_views**: Tägliche Views pro Seite + Land
- **hourly_views**: Stündliche Views (7 Tage Retention)

**Keine persönlichen Daten werden gespeichert!**

## Geo-Location

Country-Codes werden ermittelt durch:

1. **Cloudflare** (empfohlen): `CF-IPCountry` Header
2. **Nginx GeoIP**: `X-GeoIP-Country` Header
3. **Fallback**: `XX` (Unknown)

Für Nginx GeoIP:

```bash
# GeoIP installieren
sudo apt install geoip-database libgeoip1

# In nginx.conf (http block):
geoip_country /usr/share/GeoIP/GeoIP.dat;

# Im location block:
proxy_set_header X-GeoIP-Country $geoip_country_code;
```

## Backup

```bash
# Datenbank sichern
cp /var/www/kodini-analytics/backend/data/analytics.db ~/backup/analytics-$(date +%Y%m%d).db
```

## Troubleshooting

**Service startet nicht:**
```bash
sudo journalctl -u kodini-analytics -f
```

**Keine Daten im Dashboard:**
- Token in URL korrekt?
- Browser DevTools → Network Tab prüfen
- API direkt testen: `curl http://localhost:3001/health`

**Tracking funktioniert nicht:**
- Console auf der Website prüfen
- Netzwerk-Tab: POST zu `/api/track` sollte 204 zurückgeben
- CORS: Ist die Domain in `backend/src/index.ts` gelistet?

## Lizenz

MIT
