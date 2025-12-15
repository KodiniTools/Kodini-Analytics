/**
 * Geo-Location Service
 * 
 * Ermittelt den Country-Code aus der IP-Adresse.
 * Die IP wird NICHT gespeichert - nur der Country-Code wird behalten.
 * 
 * Optionen:
 * 1. Cloudflare Header (wenn hinter CF)
 * 2. X-Forwarded-For Header parsen
 * 3. Fallback: "XX" (Unknown)
 */

// Mapping für häufige IP-Ranges (vereinfacht)
// Für Produktion: MaxMind GeoLite2 DB verwenden
const IP_RANGES: Record<string, string> = {
  // Diese werden in Produktion durch echte Geo-IP-DB ersetzt
};

/**
 * Extrahiert Country-Code aus Request-Headern
 * Cloudflare, Nginx GeoIP, oder Fallback
 */
export function getCountryFromRequest(headers: Record<string, string | string[] | undefined>): string {
  // 1. Cloudflare Header (beste Option wenn CF genutzt wird)
  const cfCountry = headers['cf-ipcountry'];
  if (cfCountry && typeof cfCountry === 'string' && cfCountry.length === 2) {
    return cfCountry.toUpperCase();
  }

  // 2. Nginx GeoIP Module Header
  const geoipCountry = headers['x-geoip-country'];
  if (geoipCountry && typeof geoipCountry === 'string' && geoipCountry.length === 2) {
    return geoipCountry.toUpperCase();
  }

  // 3. Custom Header (kann in Nginx konfiguriert werden)
  const customCountry = headers['x-country-code'];
  if (customCountry && typeof customCountry === 'string' && customCountry.length === 2) {
    return customCountry.toUpperCase();
  }

  // 4. Fallback: Unknown
  return 'XX';
}

/**
 * Validiert und normalisiert einen Country-Code
 */
export function normalizeCountryCode(code: string): string {
  if (!code || typeof code !== 'string') {
    return 'XX';
  }
  
  const normalized = code.toUpperCase().trim();
  
  // Nur 2-Buchstaben Codes akzeptieren
  if (!/^[A-Z]{2}$/.test(normalized)) {
    return 'XX';
  }
  
  return normalized;
}

// Country-Namen für Dashboard (ISO 3166-1 alpha-2)
export const COUNTRY_NAMES: Record<string, string> = {
  'XX': 'Unbekannt',
  'DE': 'Deutschland',
  'AT': 'Österreich',
  'CH': 'Schweiz',
  'US': 'USA',
  'GB': 'Großbritannien',
  'FR': 'Frankreich',
  'IT': 'Italien',
  'ES': 'Spanien',
  'NL': 'Niederlande',
  'BE': 'Belgien',
  'PL': 'Polen',
  'CZ': 'Tschechien',
  'SE': 'Schweden',
  'NO': 'Norwegen',
  'DK': 'Dänemark',
  'FI': 'Finnland',
  'PT': 'Portugal',
  'IE': 'Irland',
  'RU': 'Russland',
  'UA': 'Ukraine',
  'TR': 'Türkei',
  'IN': 'Indien',
  'CN': 'China',
  'JP': 'Japan',
  'KR': 'Südkorea',
  'AU': 'Australien',
  'NZ': 'Neuseeland',
  'CA': 'Kanada',
  'MX': 'Mexiko',
  'BR': 'Brasilien',
  'AR': 'Argentinien',
  // Weitere Länder können hinzugefügt werden
};

export function getCountryName(code: string): string {
  return COUNTRY_NAMES[code] || code;
}
