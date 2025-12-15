import { Router, Request, Response } from 'express';
import {
  getTotalStats,
  getStatsForPeriod,
  getDailyViewsForPage,
  getAllDailyViews,
  getRegionStats,
  getRegionStatsForPage,
  getLiveStats,
  getHourlyViews,
} from '../services/database.js';
import { getCountryName } from '../services/geo.js';

const router = Router();

/**
 * Hilfsfunktion: Datum formatieren
 */
function getDateRange(period: string): { startDate: string; endDate: string } {
  const now = new Date();
  const endDate = now.toISOString().split('T')[0];
  
  let startDate: string;
  
  switch (period) {
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      break;
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      break;
    case 'year':
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      break;
    case 'all':
      startDate = '2020-01-01';
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  }
  
  return { startDate, endDate };
}

/**
 * GET /stats/overview
 * Übersicht aller Seiten
 */
router.get('/overview', (_req: Request, res: Response): void => {
  try {
    const period = (_req.query.period as string) || '30d';
    const { startDate, endDate } = getDateRange(period);
    
    const stats = getStatsForPeriod(startDate, endDate);
    const totalStats = getTotalStats();
    const liveStats = getLiveStats();
    
    // Total Views berechnen
    const totalViews = stats.reduce((sum, s) => sum + (s.views || 0), 0);
    const allTimeViews = totalStats.reduce((sum, s) => sum + (s.total_views || 0), 0);
    const last24hViews = liveStats.reduce((sum, s) => sum + (s.views || 0), 0);
    
    res.json({
      period,
      startDate,
      endDate,
      summary: {
        totalViews,
        allTimeViews,
        last24hViews,
        pageCount: stats.length,
      },
      pages: stats.map(s => ({
        path: s.page_path,
        views: s.views || 0,
        allTime: totalStats.find(t => t.page_path === s.page_path)?.total_views || 0,
      })),
    });
  } catch (error) {
    console.error('Stats overview error:', error);
    res.status(500).json({ error: 'Internal error' });
  }
});

/**
 * GET /stats/daily
 * Tägliche Views (für Chart)
 */
router.get('/daily', (req: Request, res: Response): void => {
  try {
    const period = (req.query.period as string) || '30d';
    const page = req.query.page as string;
    const { startDate, endDate } = getDateRange(period);
    
    let data;
    if (page) {
      data = getDailyViewsForPage(page, startDate, endDate);
    } else {
      data = getAllDailyViews(startDate, endDate);
    }
    
    res.json({
      period,
      page: page || 'all',
      data: data.map(d => ({
        date: d.view_date,
        views: d.view_count || d.total_views || 0,
      })),
    });
  } catch (error) {
    console.error('Daily stats error:', error);
    res.status(500).json({ error: 'Internal error' });
  }
});

/**
 * GET /stats/hourly
 * Stündliche Views (letzte 24h)
 */
router.get('/hourly', (_req: Request, res: Response): void => {
  try {
    const data = getHourlyViews();
    
    res.json({
      period: '24h',
      data: data.map(d => ({
        hour: d.view_hour,
        views: d.views,
      })),
    });
  } catch (error) {
    console.error('Hourly stats error:', error);
    res.status(500).json({ error: 'Internal error' });
  }
});

/**
 * GET /stats/regions
 * Regionen-Statistik
 */
router.get('/regions', (req: Request, res: Response): void => {
  try {
    const period = (req.query.period as string) || '30d';
    const page = req.query.page as string;
    const { startDate, endDate } = getDateRange(period);
    
    let data;
    if (page) {
      data = getRegionStatsForPage(page, startDate, endDate);
    } else {
      data = getRegionStats(startDate, endDate);
    }
    
    const totalViews = data.reduce((sum, d) => sum + d.views, 0);
    
    res.json({
      period,
      page: page || 'all',
      total: totalViews,
      regions: data.map(d => ({
        code: d.country_code,
        name: getCountryName(d.country_code),
        views: d.views,
        percentage: totalViews > 0 ? ((d.views / totalViews) * 100).toFixed(1) : '0',
      })),
    });
  } catch (error) {
    console.error('Region stats error:', error);
    res.status(500).json({ error: 'Internal error' });
  }
});

/**
 * GET /stats/live
 * Live-Statistik (letzte 24h)
 */
router.get('/live', (_req: Request, res: Response): void => {
  try {
    const stats = getLiveStats();
    const hourly = getHourlyViews();
    
    const totalLast24h = stats.reduce((sum, s) => sum + (s.views || 0), 0);
    
    res.json({
      last24h: totalLast24h,
      pages: stats,
      hourly: hourly.map(h => ({
        hour: h.view_hour,
        views: h.views,
      })),
    });
  } catch (error) {
    console.error('Live stats error:', error);
    res.status(500).json({ error: 'Internal error' });
  }
});

export default router;
