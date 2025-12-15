<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useAnalyticsStore } from '@/stores/analytics';
import PeriodSelector from '@/components/PeriodSelector.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';

const store = useAnalyticsStore();

onMounted(() => {
  if (!store.overview) {
    store.fetchAll();
  }
});

const pages = computed(() => store.pageStats);

function formatNumber(n: number): string {
  return new Intl.NumberFormat('de-DE').format(n);
}

function getPageName(path: string): string {
  if (path === '/') return 'Startseite';
  const name = path.replace(/^\/|\/$/g, '').replace(/-|_/g, ' ');
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function selectPage(path: string) {
  store.setPage(path);
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-gray-900">Alle Seiten</h2>
      <PeriodSelector />
    </div>

    <!-- Loading -->
    <LoadingSpinner v-if="store.isLoading && !store.overview" />

    <!-- Pages Table -->
    <div v-else class="card overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="border-b border-gray-100">
            <th class="text-left py-3 px-4 text-sm font-medium text-gray-500">Seite</th>
            <th class="text-right py-3 px-4 text-sm font-medium text-gray-500">Aufrufe (Zeitraum)</th>
            <th class="text-right py-3 px-4 text-sm font-medium text-gray-500">Gesamt</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="page in pages"
            :key="page.path"
            class="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
            @click="selectPage(page.path)"
          >
            <td class="py-3 px-4">
              <div class="flex items-center gap-2">
                <span class="text-lg">📄</span>
                <div>
                  <p class="font-medium text-gray-900">{{ getPageName(page.path) }}</p>
                  <p class="text-xs text-gray-400">{{ page.path }}</p>
                </div>
              </div>
            </td>
            <td class="text-right py-3 px-4 font-medium text-gray-900">
              {{ formatNumber(page.views) }}
            </td>
            <td class="text-right py-3 px-4 text-gray-500">
              {{ formatNumber(page.allTime) }}
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="!pages.length" class="text-center py-12 text-gray-400">
        Keine Daten verfügbar
      </div>
    </div>
  </div>
</template>
