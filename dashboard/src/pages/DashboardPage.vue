<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue';
import { useAnalyticsStore } from '@/stores/analytics';
import StatCard from '@/components/StatCard.vue';
import PeriodSelector from '@/components/PeriodSelector.vue';
import ViewsChart from '@/components/ViewsChart.vue';
import TopPages from '@/components/TopPages.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import ErrorMessage from '@/components/ErrorMessage.vue';

const store = useAnalyticsStore();

onMounted(() => {
  store.fetchAll();
});

// Auto-Refresh alle 60 Sekunden
let refreshInterval: ReturnType<typeof setInterval> | undefined;
onMounted(() => {
  refreshInterval = setInterval(() => {
    store.fetchLive();
  }, 60000);
});

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});

watch(() => store.selectedPeriod, () => {
  // Wird automatisch durch setPeriod gehandled
});
</script>

<template>
  <div class="space-y-6">
    <!-- Header mit Period Selector -->
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-gray-900">Übersicht</h2>
      <PeriodSelector />
    </div>

    <!-- Error -->
    <ErrorMessage v-if="store.error" :message="store.error" />

    <!-- Loading -->
    <LoadingSpinner v-if="store.isLoading && !store.overview" />

    <!-- Stats Cards -->
    <div v-else class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <StatCard
        title="Aufrufe (Zeitraum)"
        :value="store.totalViews"
        icon="📈"
        :trend="store.selectedPeriod"
      />
      <StatCard
        title="Letzte 24 Stunden"
        :value="store.last24hViews"
        icon="⚡"
        trend="live"
      />
      <StatCard
        title="Gesamt (alle Zeit)"
        :value="store.allTimeViews"
        icon="📊"
        trend="all"
      />
    </div>

    <!-- Charts Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Views Chart -->
      <div class="card">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Tägliche Aufrufe</h3>
        <ViewsChart />
      </div>

      <!-- Top Pages -->
      <div class="card">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Top Seiten</h3>
        <TopPages />
      </div>
    </div>
  </div>
</template>
