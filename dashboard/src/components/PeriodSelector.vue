<script setup lang="ts">
import { useAnalyticsStore } from '@/stores/analytics';
import type { Period } from '@/types';

const store = useAnalyticsStore();

const periods: Array<{ value: Period; label: string }> = [
  { value: '7d', label: '7 Tage' },
  { value: '30d', label: '30 Tage' },
  { value: '90d', label: '90 Tage' },
  { value: 'year', label: '1 Jahr' },
  { value: 'all', label: 'Alle' },
];

function selectPeriod(period: Period) {
  store.setPeriod(period);
}
</script>

<template>
  <div class="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
    <button
      v-for="period in periods"
      :key="period.value"
      :class="[
        'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
        store.selectedPeriod === period.value
          ? 'bg-white text-gray-900 shadow-sm'
          : 'text-gray-600 hover:text-gray-900'
      ]"
      @click="selectPeriod(period.value)"
    >
      {{ period.label }}
    </button>
  </div>
</template>
