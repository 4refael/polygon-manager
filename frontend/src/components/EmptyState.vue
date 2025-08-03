<template>
  <div data-testid="empty-state" class="text-center py-8">
    <div class="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl mx-auto mb-3 flex items-center justify-center">
      <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
      </svg>
    </div>
    <div class="text-gray-600 font-semibold mb-2">
      No polygons yet
    </div>
    <div class="text-gray-400 text-sm max-w-xs mx-auto">
      Start drawing on the canvas to create your first polygon
    </div>
  </div>
</template>

<script setup lang="ts">
// This component doesn't need any props as it's purely presentational
</script>