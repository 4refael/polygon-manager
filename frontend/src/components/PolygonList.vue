<template>
  <div class="bg-white rounded-lg shadow-md border border-gray-100 p-3 md:p-4">
    <PolygonListHeader :polygon-count="polygonCount" />

    <LoadingSpinner v-if="loading" title="Loading polygons..." />
    
    <EmptyState v-else-if="!hasPolygons" />

    <div v-else class="space-y-2">
      <PolygonItem
        v-for="(polygon, index) in polygons"
        :key="polygon.id"
        :polygon="polygon"
        :index="index"
        @delete-polygon="$emit('deletePolygon', $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Polygon } from '../types';
import PolygonListHeader from './PolygonListHeader.vue';
import PolygonItem from './PolygonItem.vue';
import LoadingSpinner from './LoadingSpinner.vue';
import EmptyState from './EmptyState.vue';

defineProps<{
  polygons: Polygon[];
  polygonCount: number;
  hasPolygons: boolean;
  loading: boolean;
}>();

defineEmits<{
  deletePolygon: [id: string];
}>();
</script>