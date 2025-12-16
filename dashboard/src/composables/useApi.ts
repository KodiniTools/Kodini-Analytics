import { ref } from 'vue';
import type {
  OverviewResponse,
  DailyResponse,
  HourlyResponse,
  RegionResponse,
  LiveResponse,
  Period,
} from '@/types';

const API_BASE = '/analytics/api/stats';

// Token aus localStorage oder URL-Parameter
function getToken(): string {
  const urlParams = new URLSearchParams(window.location.search);
  const urlToken = urlParams.get('token');
  if (urlToken) {
    localStorage.setItem('analytics_token', urlToken);
    return urlToken;
  }
  return localStorage.getItem('analytics_token') || '';
}

async function fetchApi<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const token = getToken();
  const url = new URL(`${API_BASE}${endpoint}`, window.location.origin);

  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
  });

  console.log('[API] Fetching:', url.toString());
  console.log('[API] Token:', token ? 'present' : 'missing');

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  console.log('[API] Response status:', response.status);

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Nicht autorisiert. Bitte Token prüfen.');
    }
    throw new Error(`API Error: ${response.status}`);
  }

  // 204 No Content - leere Antwort ist OK, Cache/Dedup Response
  if (response.status === 204) {
    console.log('[API] 204 No Content - returning null');
    return null as T;
  }

  const text = await response.text();

  console.log('[API] Response text length:', text.length);
  console.log('[API] Response text:', text.substring(0, 200));

  if (!text || text.trim() === '') {
    // Bei leerem Body aber 200 Status, auch null zurückgeben
    console.log('[API] Empty response body - returning null');
    return null as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error('Ungültige JSON-Antwort vom Server.');
  }
}

export function useApi() {
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function getOverview(period: Period = '30d'): Promise<OverviewResponse | null> {
    loading.value = true;
    error.value = null;
    try {
      return await fetchApi<OverviewResponse>('/overview', { period });
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unbekannter Fehler';
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function getDaily(period: Period = '30d', page?: string): Promise<DailyResponse | null> {
    loading.value = true;
    error.value = null;
    try {
      return await fetchApi<DailyResponse>('/daily', { period, page: page || '' });
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unbekannter Fehler';
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function getHourly(): Promise<HourlyResponse | null> {
    loading.value = true;
    error.value = null;
    try {
      return await fetchApi<HourlyResponse>('/hourly');
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unbekannter Fehler';
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function getRegions(period: Period = '30d', page?: string): Promise<RegionResponse | null> {
    loading.value = true;
    error.value = null;
    try {
      return await fetchApi<RegionResponse>('/regions', { period, page: page || '' });
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unbekannter Fehler';
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function getLive(): Promise<LiveResponse | null> {
    loading.value = true;
    error.value = null;
    try {
      return await fetchApi<LiveResponse>('/live');
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Unbekannter Fehler';
      return null;
    } finally {
      loading.value = false;
    }
  }

  return {
    loading,
    error,
    getOverview,
    getDaily,
    getHourly,
    getRegions,
    getLive,
  };
}
