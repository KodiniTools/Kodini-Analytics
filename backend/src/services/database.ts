import Database, { type Database as DatabaseType } from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, '../../data/analytics.db');

// Datenbank initialisieren
const db: DatabaseType = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

// Schema erstellen
db.exec(`
  -- Tägliche Page-Views pro Seite
  CREATE TABLE IF NOT EXISTS page_views (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    page_path TEXT NOT NULL,
    view_date DATE NOT NULL,
    view_count INTEGER DEFAULT 0,
    UNIQUE(page_path, view_date)
  );

  -- Tägliche Views pro Region (nur Country-Code)
  CREATE TABLE IF NOT EXISTS region_views (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    page_path TEXT NOT NULL,
    country_code TEXT NOT NULL,
    view_date DATE NOT NULL,
    view_count INTEGER DEFAULT 0,
    UNIQUE(page_path, country_code, view_date)
  );

  -- Stündliche Views für Live-Statistik (7 Tage aufbewahren)
  CREATE TABLE IF NOT EXISTS hourly_views (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    page_path TEXT NOT NULL,
    view_hour DATETIME NOT NULL,
    view_count INTEGER DEFAULT 0,
    UNIQUE(page_path, view_hour)
  );

  -- Indizes für Performance
  CREATE INDEX IF NOT EXISTS idx_page_views_date ON page_views(view_date);
  CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views(page_path);
  CREATE INDEX IF NOT EXISTS idx_region_views_date ON region_views(view_date);
  CREATE INDEX IF NOT EXISTS idx_hourly_views_hour ON hourly_views(view_hour);
`);

// Prepared Statements für Performance
const statements = {
  // Page View inkrementieren
  incrementPageView: db.prepare(`
    INSERT INTO page_views (page_path, view_date, view_count)
    VALUES (?, date('now'), 1)
    ON CONFLICT(page_path, view_date) 
    DO UPDATE SET view_count = view_count + 1
  `),

  // Region View inkrementieren
  incrementRegionView: db.prepare(`
    INSERT INTO region_views (page_path, country_code, view_date, view_count)
    VALUES (?, ?, date('now'), 1)
    ON CONFLICT(page_path, country_code, view_date) 
    DO UPDATE SET view_count = view_count + 1
  `),

  // Stündliche Views inkrementieren
  incrementHourlyView: db.prepare(`
    INSERT INTO hourly_views (page_path, view_hour, view_count)
    VALUES (?, datetime('now', 'start of hour'), 1)
    ON CONFLICT(page_path, view_hour) 
    DO UPDATE SET view_count = view_count + 1
  `),

  // Stats abrufen: Alle Seiten mit Gesamtzahlen
  getTotalStats: db.prepare(`
    SELECT 
      page_path,
      SUM(view_count) as total_views
    FROM page_views
    GROUP BY page_path
    ORDER BY total_views DESC
  `),

  // Stats für Zeitraum
  getStatsForPeriod: db.prepare(`
    SELECT 
      page_path,
      SUM(view_count) as views
    FROM page_views
    WHERE view_date BETWEEN ? AND ?
    GROUP BY page_path
    ORDER BY views DESC
  `),

  // Tägliche Views für eine Seite
  getDailyViewsForPage: db.prepare(`
    SELECT 
      view_date,
      view_count
    FROM page_views
    WHERE page_path = ? AND view_date BETWEEN ? AND ?
    ORDER BY view_date ASC
  `),

  // Alle täglichen Views
  getAllDailyViews: db.prepare(`
    SELECT 
      view_date,
      SUM(view_count) as total_views
    FROM page_views
    WHERE view_date BETWEEN ? AND ?
    GROUP BY view_date
    ORDER BY view_date ASC
  `),

  // Region-Stats
  getRegionStats: db.prepare(`
    SELECT 
      country_code,
      SUM(view_count) as views
    FROM region_views
    WHERE view_date BETWEEN ? AND ?
    GROUP BY country_code
    ORDER BY views DESC
  `),

  // Region-Stats für eine Seite
  getRegionStatsForPage: db.prepare(`
    SELECT 
      country_code,
      SUM(view_count) as views
    FROM region_views
    WHERE page_path = ? AND view_date BETWEEN ? AND ?
    GROUP BY country_code
    ORDER BY views DESC
  `),

  // Live-Stats (letzte 24h)
  getLiveStats: db.prepare(`
    SELECT 
      page_path,
      SUM(view_count) as views
    FROM hourly_views
    WHERE view_hour >= datetime('now', '-24 hours')
    GROUP BY page_path
    ORDER BY views DESC
  `),

  // Stündliche Views für Chart
  getHourlyViews: db.prepare(`
    SELECT 
      view_hour,
      SUM(view_count) as views
    FROM hourly_views
    WHERE view_hour >= datetime('now', '-24 hours')
    GROUP BY view_hour
    ORDER BY view_hour ASC
  `),

  // Cleanup: Alte stündliche Daten löschen (> 7 Tage)
  cleanupHourlyViews: db.prepare(`
    DELETE FROM hourly_views
    WHERE view_hour < datetime('now', '-7 days')
  `)
};

export interface PageStat {
  page_path: string;
  total_views?: number;
  views?: number;
}

export interface DailyView {
  view_date: string;
  view_count?: number;
  total_views?: number;
}

export interface RegionStat {
  country_code: string;
  views: number;
}

export interface HourlyStat {
  view_hour: string;
  views: number;
}

/**
 * Registriert einen Page View (anonymisiert)
 */
export function recordPageView(pagePath: string, countryCode: string): void {
  // Alle drei Tabellen atomar aktualisieren
  const transaction = db.transaction(() => {
    statements.incrementPageView.run(pagePath);
    statements.incrementRegionView.run(pagePath, countryCode);
    statements.incrementHourlyView.run(pagePath);
  });
  transaction();
}

/**
 * Holt Gesamtstatistiken aller Seiten
 */
export function getTotalStats(): PageStat[] {
  return statements.getTotalStats.all() as PageStat[];
}

/**
 * Holt Stats für einen Zeitraum
 */
export function getStatsForPeriod(startDate: string, endDate: string): PageStat[] {
  return statements.getStatsForPeriod.all(startDate, endDate) as PageStat[];
}

/**
 * Holt tägliche Views für eine Seite
 */
export function getDailyViewsForPage(pagePath: string, startDate: string, endDate: string): DailyView[] {
  return statements.getDailyViewsForPage.all(pagePath, startDate, endDate) as DailyView[];
}

/**
 * Holt alle täglichen Views (aggregiert)
 */
export function getAllDailyViews(startDate: string, endDate: string): DailyView[] {
  return statements.getAllDailyViews.all(startDate, endDate) as DailyView[];
}

/**
 * Holt Region-Statistiken
 */
export function getRegionStats(startDate: string, endDate: string): RegionStat[] {
  return statements.getRegionStats.all(startDate, endDate) as RegionStat[];
}

/**
 * Holt Region-Stats für eine Seite
 */
export function getRegionStatsForPage(pagePath: string, startDate: string, endDate: string): RegionStat[] {
  return statements.getRegionStatsForPage.all(pagePath, startDate, endDate) as RegionStat[];
}

/**
 * Holt Live-Stats (letzte 24h)
 */
export function getLiveStats(): PageStat[] {
  return statements.getLiveStats.all() as PageStat[];
}

/**
 * Holt stündliche Views für Chart
 */
export function getHourlyViews(): HourlyStat[] {
  return statements.getHourlyViews.all() as HourlyStat[];
}

/**
 * Räumt alte Daten auf
 */
export function cleanup(): void {
  statements.cleanupHourlyViews.run();
}

// Cleanup beim Start
cleanup();

// Periodischer Cleanup (alle 6 Stunden)
setInterval(cleanup, 6 * 60 * 60 * 1000);

export default db;
