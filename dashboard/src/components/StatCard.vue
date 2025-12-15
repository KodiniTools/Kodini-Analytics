<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  title: string;
  value: number;
  icon: string;
  trend?: string;
}>();

const formattedValue = computed(() => {
  return new Intl.NumberFormat('de-DE').format(props.value);
});

const trendLabel = computed(() => {
  switch (props.trend) {
    case '7d': return 'letzte 7 Tage';
    case '30d': return 'letzte 30 Tage';
    case '90d': return 'letzte 90 Tage';
    case 'year': return 'letztes Jahr';
    case 'live': return 'live';
    case 'all': return 'seit Beginn';
    default: return '';
  }
});
</script>

<template>
  <div class="card">
    <div class="flex items-start justify-between">
      <div>
        <p class="text-sm font-medium text-gray-500">{{ title }}</p>
        <p class="mt-2 text-3xl font-bold text-gray-900">{{ formattedValue }}</p>
        <p v-if="trendLabel" class="mt-1 text-xs text-gray-400">{{ trendLabel }}</p>
      </div>
      <span class="text-3xl">{{ icon }}</span>
    </div>
  </div>
</template>
