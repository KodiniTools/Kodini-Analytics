export interface PageStat {
  path: string;
  views: number;
  allTime: number;
}

export interface DailyData {
  date: string;
  views: number;
}

export interface HourlyData {
  hour: string;
  views: number;
}

export interface RegionData {
  code: string;
  name: string;
  views: number;
  percentage: string;
}

export interface OverviewResponse {
  period: string;
  startDate: string;
  endDate: string;
  summary: {
    totalViews: number;
    allTimeViews: number;
    last24hViews: number;
    pageCount: number;
  };
  pages: PageStat[];
}

export interface DailyResponse {
  period: string;
  page: string;
  data: DailyData[];
}

export interface HourlyResponse {
  period: string;
  data: HourlyData[];
}

export interface RegionResponse {
  period: string;
  page: string;
  total: number;
  regions: RegionData[];
}

export interface LiveResponse {
  last24h: number;
  pages: Array<{ page_path: string; views: number }>;
  hourly: HourlyData[];
}

export type Period = '7d' | '30d' | '90d' | 'year' | 'all';
