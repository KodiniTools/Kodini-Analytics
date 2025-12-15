<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { Doughnut } from 'vue-chartjs';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { useAnalyticsStore } from '@/stores/analytics';
import PeriodSelector from '@/components/PeriodSelector.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';

ChartJS.register(ArcElement, Tooltip, Legend);

const store = useAnalyticsStore();

onMounted(() => {
  if (!store.regions) {
    store.fetchAll();
  }
});

const regions = computed(() => store.regions?.regions ?? []);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right' as const,
      labels: {
        usePointStyle: true,
        padding: 16,
      },
    },
    tooltip: {
      backgroundColor: '#1f2937',
      titleColor: '#fff',
      bodyColor: '#fff',
      padding: 12,
      cornerRadius: 8,
    },
  },
};

function formatNumber(n: number): string {
  return new Intl.NumberFormat('de-DE').format(n);
}

// Flaggen-Emoji aus Country-Code
function getFlag(code: string): string {
  if (code === 'XX') return '🌐';
  const codePoints = code
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-gray-900">Regionen</h2>
      <PeriodSelector />
    </div>

    <!-- Loading -->
    <LoadingSpinner v-if="store.isLoading && !store.regions" />

    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Chart -->
      <div class="card">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Verteilung</h3>
        <div class="h-80">
          <Doughnut
            v-if="store.regionChartData"
            :data="store.regionChartData"
            :options="chartOptions"
          />
          <div v-else class="flex items-center justify-center h-full text-gray-400">
            Keine Daten verfügbar
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="card">
        <h3 class="text-lg font-semibold text-gray-900 mb-4">Alle Regionen</h3>
        <div class="space-y-2 max-h-80 overflow-y-auto">
          <div
            v-for="region in regions"
            :key="region.code"
            class="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50"
          >
            <div class="flex items-center gap-3">
              <span class="text-2xl">{{ getFlag(region.code) }}</span>
              <div>
                <p class="font-medium text-gray-900">{{ region.name }}</p>
                <p class="text-xs text-gray-400">{{ region.code }}</p>
              </div>
            </div>
            <div class="text-right">
              <p class="font-medium text-gray-900">{{ formatNumber(region.views) }}</p>
              <p class="text-xs text-gray-400">{{ region.percentage }}%</p>
            </div>
          </div>

          <div v-if="!regions.length" class="text-center py-8 text-gray-400">
            Keine Daten verfügbar
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
