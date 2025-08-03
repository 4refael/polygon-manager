<template>
  <div
    :data-testid="`polygon-item-${polygon.id}`"
    class="group relative animate-in slide-in-from-left duration-300"
    :style="{ animationDelay: `${index * 50}ms` }"
  >
    <div class="bg-gradient-to-r from-gray-50 to-gray-50/50 hover:from-white hover:to-gray-50 rounded-lg border border-gray-100 p-3 transition-all duration-200 hover:shadow-sm">
      <div class="flex items-center justify-between">
        <!-- Polygon Info -->
        <div class="flex items-center space-x-2 md:space-x-3 flex-1 min-w-0">
          <div class="relative">
            <div
              class="w-4 h-4 md:w-5 md:h-5 rounded-full flex-shrink-0 ring-1 ring-white shadow-sm"
              :style="{ backgroundColor: getPolygonColor(index) }"
            />
            <div class="absolute -top-0.5 -right-0.5 w-3 h-3 md:w-4 md:h-4 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm">
              {{ index + 1 }}
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <div data-testid="polygon-name" class="font-semibold text-gray-800 truncate text-sm md:text-base group-hover:text-gray-900 transition-colors">
              {{ polygon.name }}
            </div>
            <div class="text-xs md:text-sm text-gray-500 flex items-center space-x-1.5 md:space-x-2 mt-0.5 md:mt-0">
              <svg class="w-3 h-3 md:w-4 md:h-4 md:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span data-testid="polygon-points">{{ polygon.points.length }} {{ polygon.points.length === 1 ? 'point' : 'points' }}</span>
            </div>
          </div>
        </div>

        <!-- Delete Button -->
        <button
          @click="$emit('deletePolygon', polygon.id)"
          data-testid="delete-polygon-button"
          class="flex-shrink-0 p-2 md:p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 touch-manipulation md:opacity-0 md:group-hover:opacity-100"
          title="Delete polygon"
        >
          <svg class="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Polygon } from '../types';

defineProps<{
  polygon: Polygon;
  index: number;
}>();

defineEmits<{
  deletePolygon: [id: string];
}>();

const getPolygonColor = (index: number): string => {
  const colors = ['#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
  return colors[index % colors.length] ?? colors[0]!;
};
</script>