<script setup lang="ts">
defineProps<{
  message: string;
}>();
</script>

<template>
  <div class="bg-red-50 border border-red-200 rounded-lg p-4">
    <div class="flex items-center gap-3">
      <span class="text-red-500 text-xl">⚠️</span>
      <div>
        <h4 class="font-medium text-red-800">Fehler</h4>
        <p class="text-sm text-red-600">{{ message }}</p>
      </div>
    </div>
  </div>
</template>
