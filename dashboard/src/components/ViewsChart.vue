<script setup lang="ts">
import { computed } from 'vue';
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { useAnalyticsStore } from '@/stores/analytics';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const store = useAnalyticsStore();

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: '#1f2937',
      titleColor: '#fff',
      bodyColor: '#fff',
      padding: 12,
      cornerRadius: 8,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        maxTicksLimit: 10,
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        color: '#f3f4f6',
      },
      ticks: {
        precision: 0,
      },
    },
  },
  interaction: {
    intersect: false,
    mode: 'index' as const,
  },
};

const hasData = computed(() => store.chartData !== null);
</script>

<template>
  <div class="h-64">
    <Line
      v-if="hasData"
      :data="store.chartData!"
      :options="chartOptions"
    />
    <div v-else class="flex items-center justify-center h-full text-gray-400">
      Keine Daten verfügbar
    </div>
  </div>
</template>
