<script setup lang="ts">
import { RouterView, RouterLink, useRoute } from 'vue-router';
import { computed } from 'vue';

const route = useRoute();

const navigation = [
  { name: 'Dashboard', path: '/', icon: '📊' },
  { name: 'Seiten', path: '/pages', icon: '📄' },
  { name: 'Regionen', path: '/regions', icon: '🌍' },
];

const isActive = (path: string) => computed(() => route.path === path);
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center gap-3">
            <span class="text-2xl">📈</span>
            <h1 class="text-xl font-semibold text-gray-900">
              KodiniTools Analytics
            </h1>
          </div>
          
          <nav class="flex items-center gap-1">
            <RouterLink
              v-for="item in navigation"
              :key="item.path"
              :to="item.path"
              :class="[
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                isActive(item.path).value
                  ? 'bg-primary-100 text-primary-700'
                  : 'text-gray-600 hover:bg-gray-100'
              ]"
            >
              <span class="mr-2">{{ item.icon }}</span>
              {{ item.name }}
            </RouterLink>
          </nav>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <RouterView />
    </main>

    <!-- Footer -->
    <footer class="border-t border-gray-200 bg-white mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <p class="text-sm text-gray-500 text-center">
          🔒 Privacy-First Analytics · Keine Cookies · Keine IP-Speicherung
        </p>
      </div>
    </footer>
  </div>
</template>
