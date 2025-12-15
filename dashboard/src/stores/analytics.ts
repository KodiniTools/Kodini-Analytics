import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useApi } from '@/composables/useApi';
import type {
  OverviewResponse,
  DailyResponse,
  RegionResponse,
  LiveResponse,
  Period,
} from '@/types';

export const useAnalyticsStore = defineStore('analytics', () => {
  const api = useApi();
  
  // State
  const overview = ref<OverviewResponse | null>(null);
  const daily = ref<DailyResponse | null>(null);
  const regions = ref<RegionResponse | null>(null);
  const live = ref<LiveResponse | null>(null);
  const selectedPeriod = ref<Period>('30d');
  const selectedPage = ref<string>('');
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const totalViews = computed(() => overview.value?.summary.totalViews ?? 0);
  const allTimeViews = computed(() => overview.value?.summary.allTimeViews ?? 0);
  const last24hViews = computed(() => overview.value?.summary.last24hViews ?? 0);
  const pageStats = computed(() => overview.value?.pages ?? []);
  
  const chartData = computed(() => {
    if (!daily.value?.data.length) return null;
    
    return {
      labels: daily.value.data.map(d => {
        const date = new Date(d.date);
        return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
      }),
      datasets: [{
        label: 'Aufrufe',
        data: daily.value.data.map(d => d.views),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.3,
      }],
    };
  });

  const regionChartData = computed(() => {
    if (!regions.value?.regions.length) return null;
    
    const topRegions = regions.value.regions.slice(0, 10);
    
    return {
      labels: topRegions.map(r => r.name),
      datasets: [{
        label: 'Aufrufe',
        data: topRegions.map(r => r.views),
        backgroundColor: [
          '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
          '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
        ],
      }],
    };
  });

  // Actions
  async function fetchOverview() {
    isLoading.value = true;
    error.value = null;
    try {
      overview.value = await api.getOverview(selectedPeriod.value);
      if (api.error.value) {
        error.value = api.error.value;
      }
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchDaily() {
    daily.value = await api.getDaily(selectedPeriod.value, selectedPage.value || undefined);
    if (api.error.value) {
      error.value = api.error.value;
    }
  }

  async function fetchRegions() {
    regions.value = await api.getRegions(selectedPeriod.value, selectedPage.value || undefined);
    if (api.error.value) {
      error.value = api.error.value;
    }
  }

  async function fetchLive() {
    live.value = await api.getLive();
    if (api.error.value) {
      error.value = api.error.value;
    }
  }

  async function fetchAll() {
    await Promise.all([
      fetchOverview(),
      fetchDaily(),
      fetchRegions(),
      fetchLive(),
    ]);
  }

  function setPeriod(period: Period) {
    selectedPeriod.value = period;
    fetchAll();
  }

  function setPage(page: string) {
    selectedPage.value = page;
    fetchDaily();
    fetchRegions();
  }

  return {
    // State
    overview,
    daily,
    regions,
    live,
    selectedPeriod,
    selectedPage,
    isLoading,
    error,
    // Getters
    totalViews,
    allTimeViews,
    last24hViews,
    pageStats,
    chartData,
    regionChartData,
    // Actions
    fetchOverview,
    fetchDaily,
    fetchRegions,
    fetchLive,
    fetchAll,
    setPeriod,
    setPage,
  };
});
