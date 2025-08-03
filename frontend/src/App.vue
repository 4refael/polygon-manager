<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
    <header class="bg-white/95 backdrop-blur-sm shadow-lg border-b border-gray-200/50 px-3 py-3 md:px-6 md:py-5 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto flex items-center justify-between">
        <div class="flex items-center space-x-2 md:space-x-3">
          <div class="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
            <svg class="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <h1 data-testid="app-title" class="text-lg md:text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
            Polygon Manager
          </h1>
        </div>
      </div>
    </header>

    <main class="max-w-6xl mx-auto p-2 md:p-4 space-y-3 md:space-y-4 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-4 mt-2 md:mt-4 pb-4">
      <div class="lg:col-span-2 order-1">
        <PolygonCanvas :polygons="polygons" @polygon-created="createPolygon" />
      </div>
      <div class="order-2 lg:order-none">
        <PolygonList
          :polygons="polygons"
          :polygon-count="polygonCount"
          :has-polygons="hasPolygons"
          :loading="loading && !hasPolygons"
          @delete-polygon="handleDeleteRequest"
        />
      </div>
    </main>

    <div 
      v-if="globalLoading || (loading && !hasPolygons)"
      data-testid="global-loading"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]"
    >
      <LoadingSpinner 
        :title="globalLoading ? loadingMessage : 'Loading polygons...'"
        subtitle="Please wait"
      />
    </div>

    <ConfirmDialog
      :show="showDeleteConfirm"
      title="Confirm Deletion"
      :message="deleteConfirmMessage"
      subtitle="This action cannot be undone."
      confirm-text="Delete"
      cancel-text="Cancel"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />

  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import PolygonCanvas from './components/PolygonCanvas.vue';
import PolygonList from './components/PolygonList.vue';
import ConfirmDialog from './components/ConfirmDialog.vue';
import LoadingSpinner from './components/LoadingSpinner.vue';
import { usePolygons } from './composables/usePolygons';
import { toast } from 'vue3-toastify';
import type { Polygon, PolygonData } from './types';

const showDeleteConfirm = ref(false);
const polygonToDelete = ref<Polygon | null>(null);
const globalLoading = ref(false);
const loadingMessage = ref('');

const {
  polygons,
  loading,
  error,
  polygonCount,
  hasPolygons,
  loadPolygons,
  createPolygon: originalCreatePolygon,
  deletePolygon: originalDeletePolygon
} = usePolygons();

const deleteConfirmMessage = computed(() => 
  `Are you sure you want to delete "${polygonToDelete.value?.name || ''}"?`
);

const createPolygon = async (data: PolygonData) => {
  globalLoading.value = true;
  loadingMessage.value = 'Creating polygon...';
  
  try {
    await originalCreatePolygon(data);
    toast.success(`Polygon "${data.name}" created successfully! ✨`);
  } catch (err) {
    toast.error('Failed to create polygon. Please try again.');
  } finally {
    globalLoading.value = false;
  }
};

const handleDeleteRequest = (id: string) => {
  const polygon = polygons.value.find(p => p.id === id);
  if (polygon) {
    polygonToDelete.value = polygon;
    showDeleteConfirm.value = true;
  }
};

const confirmDelete = async () => {
  if (polygonToDelete.value) {
    const polygonName = polygonToDelete.value.name;
    globalLoading.value = true;
    loadingMessage.value = 'Deleting polygon...';
    
    try {
      await originalDeletePolygon(polygonToDelete.value.id);
      toast.success(`Polygon "${polygonName}" deleted successfully! 🗑️`);
    } catch (err) {
      toast.error('Failed to delete polygon. Please try again.');
    } finally {
      globalLoading.value = false;
    }
  }
  showDeleteConfirm.value = false;
  polygonToDelete.value = null;
};

const cancelDelete = () => {
  showDeleteConfirm.value = false;
  polygonToDelete.value = null;
};

onMounted(async () => {
  await loadPolygons();
});
</script>
