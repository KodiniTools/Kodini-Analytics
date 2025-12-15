#!/bin/bash
set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║           KodiniTools Analytics Setup                      ║"
echo "╚════════════════════════════════════════════════════════════╝"

# Farben
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Prüfen ob Node.js installiert ist
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Node.js nicht gefunden. Installiere...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

echo -e "${GREEN}Node.js Version:${NC} $(node -v)"

# Backend Setup
echo -e "\n${GREEN}[1/4] Backend Dependencies installieren...${NC}"
cd backend
npm install

# Environment erstellen falls nicht vorhanden
if [ ! -f .env ]; then
    echo -e "${YELLOW}Erstelle .env Datei...${NC}"
    cp .env.example .env
    # Zufälligen Token generieren
    TOKEN=$(openssl rand -hex 32)
    sed -i "s/dein-sicherer-token-hier-123/$TOKEN/" .env
    echo -e "${GREEN}Token generiert:${NC} $TOKEN"
    echo -e "${YELLOW}WICHTIG: Token für Dashboard-Zugang notieren!${NC}"
fi

# Datenbank-Verzeichnis
mkdir -p data

# TypeScript kompilieren
echo -e "\n${GREEN}[2/4] Backend kompilieren...${NC}"
npm run build

# Dashboard Setup
echo -e "\n${GREEN}[3/4] Dashboard Dependencies installieren...${NC}"
cd ../dashboard
npm install

# Dashboard bauen
echo -e "\n${GREEN}[4/4] Dashboard bauen...${NC}"
npm run build

echo -e "\n${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                    Setup abgeschlossen!                    ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"

echo -e "\nNächste Schritte:"
echo "1. Token aus backend/.env notieren"
echo "2. Systemd Service einrichten:"
echo "   sudo cp kodini-analytics.service /etc/systemd/system/"
echo "   sudo systemctl enable kodini-analytics"
echo "   sudo systemctl start kodini-analytics"
echo ""
echo "3. Nginx konfigurieren (siehe nginx.conf)"
echo ""
echo "4. Tracker auf kodinitools.com einbinden:"
echo '   <script src="https://analytics.kodinitools.com/tracker.js"'
echo '           data-api="https://analytics.kodinitools.com/api" defer></script>'
echo ""
echo "5. Dashboard öffnen:"
echo "   https://analytics.kodinitools.com/?token=DEIN_TOKEN"
