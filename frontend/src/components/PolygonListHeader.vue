<template>
  <div class="flex items-center justify-between mb-4">
    <div class="flex items-center space-x-3">
      <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </div>
      <div>
        <h2 class="text-base md:text-lg font-bold text-gray-800">
          Polygons
        </h2>
        <div data-testid="polygon-count" class="text-sm text-gray-500">
          {{ polygonCount }} {{ polygonCount === 1 ? 'polygon' : 'polygons' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  polygonCount: number;
}>();
</script>