<script setup lang="ts">
import { computed } from 'vue';
import { useAnalyticsStore } from '@/stores/analytics';

const store = useAnalyticsStore();

const topPages = computed(() => {
  return store.pageStats.slice(0, 10);
});

const maxViews = computed(() => {
  if (!topPages.value.length) return 1;
  return Math.max(...topPages.value.map(p => p.views));
});

function formatNumber(n: number): string {
  return new Intl.NumberFormat('de-DE').format(n);
}

function getPageName(path: string): string {
  if (path === '/') return 'Startseite';
  
  // Pfad bereinigen und formatieren
  const name = path.replace(/^\/|\/$/g, '').replace(/-|_/g, ' ');
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function getBarWidth(views: number): string {
  return `${(views / maxViews.value) * 100}%`;
}
</script>

<template>
  <div class="space-y-3">
    <div v-if="!topPages.length" class="text-center text-gray-400 py-8">
      Keine Daten verfügbar
    </div>
    
    <div
      v-for="page in topPages"
      :key="page.path"
      class="group"
    >
      <div class="flex items-center justify-between mb-1">
        <span class="text-sm text-gray-700 truncate" :title="page.path">
          {{ getPageName(page.path) }}
        </span>
        <span class="text-sm font-medium text-gray-900">
          {{ formatNumber(page.views) }}
        </span>
      </div>
      <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          class="h-full bg-primary-500 rounded-full transition-all duration-500"
          :style="{ width: getBarWidth(page.views) }"
        />
      </div>
    </div>
  </div>
</template>
