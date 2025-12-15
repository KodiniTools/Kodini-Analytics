import { Router, Request, Response } from 'express';
import { recordPageView } from '../services/database.js';
import { getCountryFromRequest, normalizeCountryCode } from '../services/geo.js';

const router = Router();

// Erlaubte Seiten (Whitelist)
const ALLOWED_PAGES = new Set([
  '/',
  '/audiokonverter/',
  '/mp3konverter/',
  '/audioequalizer/',
  '/modernermusikplayer/',
  '/ultimativermusikplayer/',
  '/playlist_generator/',
  '/playlistkonverter/',
  '/alarmtool/',
  '/audionormalisierer/',
  '/visualizer/',
  '/equaliser19/',
  '/bildkonverter/',
  '/bilderseriebearbeiten/',
  '/collagemaker/',
  '/kodini-color-extractor/',
  '/videokonverter/',
  '/kontaktformular/',
  '/datenschutz/',
]);

/**
 * Normalisiert einen Seitenpfad
 */
function normalizePath(path: string): string | null {
  if (!path || typeof path !== 'string') {
    return null;
  }

  // Bereinigen
  let normalized = path.toLowerCase().trim();
  
  // Query-Parameter und Hash entfernen
  normalized = normalized.split('?')[0].split('#')[0];
  
  // Trailing Slash sicherstellen (außer für Root)
  if (normalized !== '/' && !normalized.endsWith('/')) {
    normalized += '/';
  }
  
  // Leading Slash sicherstellen
  if (!normalized.startsWith('/')) {
    normalized = '/' + normalized;
  }

  // Gegen Whitelist prüfen
  if (!ALLOWED_PAGES.has(normalized)) {
    return null;
  }

  return normalized;
}

/**
 * POST /track
 * Empfängt einen Page View
 * 
 * Body: { page: "/audiokonverter/" }
 * 
 * Keine Nutzerdaten werden gespeichert!
 */
router.post('/track', (req: Request, res: Response): void => {
  try {
    const { page } = req.body;

    // Seite validieren
    const normalizedPath = normalizePath(page);
    if (!normalizedPath) {
      res.status(400).json({ error: 'Invalid page' });
      return;
    }

    // Country aus Headers extrahieren (IP wird NICHT gespeichert)
    const country = normalizeCountryCode(
      getCountryFromRequest(req.headers as Record<string, string | string[] | undefined>)
    );

    // View registrieren (nur aggregierte Daten)
    recordPageView(normalizedPath, country);

    // Minimale Antwort (1x1 transparent pixel alternativ möglich)
    res.status(204).send();
  } catch (error) {
    console.error('Track error:', error);
    res.status(500).json({ error: 'Internal error' });
  }
});

/**
 * GET /pixel.gif
 * Tracking-Pixel Alternative (für img-Tag Einbindung)
 */
router.get('/pixel.gif', (req: Request, res: Response): void => {
  try {
    const page = req.query.p as string;
    
    const normalizedPath = normalizePath(page);
    if (normalizedPath) {
      const country = normalizeCountryCode(
        getCountryFromRequest(req.headers as Record<string, string | string[] | undefined>)
      );
      recordPageView(normalizedPath, country);
    }

    // 1x1 transparent GIF
    const pixel = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64'
    );

    res.set({
      'Content-Type': 'image/gif',
      'Content-Length': pixel.length,
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      'Pragma': 'no-cache',
      'Expires': '0',
    });

    res.send(pixel);
  } catch (error) {
    console.error('Pixel error:', error);
    res.status(204).send();
  }
});

export default router;
