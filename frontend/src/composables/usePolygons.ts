import { ref, computed } from 'vue';
import { polygonApi } from '../services/api';
import type { Polygon, PolygonData } from '../types';

export const usePolygons = () => {
  const polygons = ref<Polygon[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const polygonCount = computed(() => polygons.value.length);
  const hasPolygons = computed(() => polygonCount.value > 0);

  const withErrorHandling = async <T>(fn: () => Promise<T>): Promise<T | null> => {
    try {
      loading.value = true;
      error.value = null;
      return await fn();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred';
      return null;
    } finally {
      loading.value = false;
    }
  };

  const loadPolygons = () => withErrorHandling(async () => {
    polygons.value = await polygonApi.getAll();
    return polygons.value;
  });

  const createPolygon = (data: PolygonData) => withErrorHandling(async () => {
    const newPolygon = await polygonApi.create(data);
    if (newPolygon) polygons.value.push(newPolygon);
    return newPolygon;
  });

  const deletePolygon = (id: string) => withErrorHandling(async () => {
    await polygonApi.delete(id);
    polygons.value = polygons.value.filter(p => p.id !== id);
    return true;
  });

  return {
    polygons: computed(() => polygons.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    polygonCount,
    hasPolygons,
    loadPolygons,
    createPolygon,
    deletePolygon
  };
};