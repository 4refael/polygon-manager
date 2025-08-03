<template>
  <div class="relative w-full">

    <div class="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden shadow-md border border-gray-200 transition-all duration-300"
         :class="{ 
           'ring-2 ring-blue-300 ring-opacity-50 shadow-xl': isDrawing,
           'hover:shadow-lg hover:border-gray-300': !isDrawing
         }" 
         style="aspect-ratio: 3/2; min-height: 200px;">
      <canvas
        ref="canvasRef"
        data-testid="polygon-canvas"
        class="absolute inset-0 w-full h-full touch-none transition-all duration-200"
        :class="{ 
          'cursor-crosshair': isDrawing && (!canClosePolygon || hoveredPointIndex !== 0),
          'cursor-pointer': !isDrawing,
        }"
        @click="handleClick"
        @touchstart.prevent="handleTouchStart"
        @touchend.prevent="handleTouchEnd"
        @mousemove="handleMouseMove"
        @touchmove.prevent="handleTouchMove"
      />
      
      <div 
        v-if="isDrawing" 
        class="absolute top-2 left-2 right-2 md:top-3 md:left-3 md:right-3 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 z-10 pointer-events-none animate-in slide-in-from-top-2 duration-300"
      >
        <div class="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-2 py-1.5 md:px-3 md:py-2 rounded-lg text-xs md:text-sm shadow-lg border border-blue-400/20 backdrop-blur-sm">
          <div class="flex items-center space-x-1.5 md:space-x-2">
            <div class="w-1.5 h-1.5 md:w-2 md:h-2 bg-white rounded-full animate-pulse"></div>
            <div class="font-semibold">Drawing</div>
            <span class="font-medium">{{ currentPointCount }}pts</span>
          </div>
          <div v-if="canClosePolygon" class="text-green-100 mt-1 text-xs font-medium">
            Tap green point to close
          </div>
        </div>
        
        <button
          @click="cancelDrawing"
          class="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white p-1.5 md:p-2 rounded-lg shadow-lg transition-all duration-200 pointer-events-auto border border-red-400/20 hover:scale-105 active:scale-95 touch-manipulation"
          title="Cancel drawing (ESC)"
        >
          <svg class="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div 
        v-else
        data-testid="drawing-instructions"
        class="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm p-2 md:p-3 text-center z-10 pointer-events-none border-t border-gray-100"
      >
        <div class="text-xs md:text-sm flex items-center justify-center space-x-1.5 md:space-x-2">
          <svg class="w-3 h-3 md:w-4 md:h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
          </svg>
          <span class="font-medium">Tap to start drawing</span>
        </div>
      </div>
      
      <div 
        v-if="isLoading"
        class="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center rounded-lg z-20 animate-in fade-in duration-200"
      >
        <LoadingSpinner title="Saving polygon..." subtitle="Please wait" />
      </div>
    </div>

    <CreatePolygon
      :show="showNaming"
      :point-count="pendingPolygon.length"
      @save="savePolygon"
      @cancel="cancelNaming"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useCanvas } from '../composables/useCanvas';
import CreatePolygon from './CreatePolygon.vue';
import LoadingSpinner from './LoadingSpinner.vue';
import type { Polygon, PolygonData } from '../types';

const props = defineProps<{
  polygons: Polygon[];
}>();

const emit = defineEmits<{
  polygonCreated: [data: PolygonData];
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const showNaming = ref(false);
const pendingPolygon = ref<[number, number][]>([]);
const lastTouchTime = ref(0);
const isLoading = ref(false);

const {
  currentPolygon,
  isDrawing,
  canClosePolygon,
  currentPointCount,
  hoveredPointIndex,
  setupCanvas,
  getCanvasCoordinates,
  findClickedPoint,
  findHoveredPoint,
  drawPolygon,
  drawPreviewLine,
  getPolygonColor,
  redraw,
  startDrawing: canvasStartDrawing,
  stopDrawing,
  addPoint,
  clearCurrent,
  setHoveredPoint,
  finishPolygon
} = useCanvas(canvasRef);

const render = () => {
  redraw();
  // Always show all existing polygons
  props.polygons.forEach((polygon, i) => 
    drawPolygon(polygon.points, getPolygonColor(i))
  );
  // Show current drawing polygon if in drawing mode
  if (isDrawing.value && currentPolygon.value.length > 0) {
    drawPolygon(currentPolygon.value, '#3b82f6', true);
  }
};

const handleClick = (event: MouseEvent) => {
  if (isLoading.value) return;
  
  const point = getCanvasCoordinates(event);
  
  if (!isDrawing.value) {
    // Start drawing on any click
    canvasStartDrawing();
    addPoint(point);
    render();
    return;
  }
  
  // Check if clicking on first point to close polygon
  if (canClosePolygon.value) {
    const clickedIndex = findClickedPoint(point);
    if (clickedIndex === 0) {
      completePolygon();
      return;
    }
  }
  
  addPoint(point);
  render();
};

const handleTouchStart = () => {
  lastTouchTime.value = Date.now();
};

const handleTouchEnd = (event: TouchEvent) => {
  if (isLoading.value) return;
  
  const touchDuration = Date.now() - lastTouchTime.value;
  
  // Prevent accidental touches (too short) or long presses
  if (touchDuration < 50 || touchDuration > 500) return;
  
  const point = getCanvasCoordinates(event);
  
  if (!isDrawing.value) {
    // Start drawing on any touch
    canvasStartDrawing();
    addPoint(point);
    render();
    return;
  }
  
  // Check if touching first point to close polygon
  if (canClosePolygon.value) {
    const clickedIndex = findClickedPoint(point);
    if (clickedIndex === 0) {
      completePolygon();
      return;
    }
  }
  
  addPoint(point);
  render();
};

const handleMouseMove = (event: MouseEvent) => {
  if (!isDrawing.value || currentPolygon.value.length === 0 || isLoading.value) return;
  
  const mousePos = getCanvasCoordinates(event);
  const hoveredIndex = findHoveredPoint(mousePos);
  setHoveredPoint(hoveredIndex);
  
  render();
  drawPreviewLine(mousePos);
};

const handleTouchMove = (event: TouchEvent) => {
  if (!isDrawing.value || currentPolygon.value.length === 0 || isLoading.value) return;
  
  const touchPos = getCanvasCoordinates(event);
  const hoveredIndex = findHoveredPoint(touchPos);
  setHoveredPoint(hoveredIndex);
  
  render();
  drawPreviewLine(touchPos);
};

const cancelDrawing = () => {
  stopDrawing();
  clearCurrent();
  setHoveredPoint(-1);
  render();
};

const completePolygon = () => {
  if (currentPolygon.value.length >= 3) {
    pendingPolygon.value = finishPolygon().map(point => [point[0], point[1]] as [number, number]);
    setHoveredPoint(-1);
    showNaming.value = true;
  }
  render();
};

const savePolygon = async (name: string) => {
  if (pendingPolygon.value.length >= 3) {
    isLoading.value = true;
    
    try {
      emit('polygonCreated', { 
        name, 
        points: pendingPolygon.value 
      });
    } finally {
      isLoading.value = false;
    }
  }
  
  showNaming.value = false;
  pendingPolygon.value = [];
};

const cancelNaming = () => {
  showNaming.value = false;
  pendingPolygon.value = [];
};

onMounted(() => {
  setupCanvas();
});

// Always render when polygons change
watch(() => props.polygons, render, { deep: true });

// Initial render after component mounts
watch(canvasRef, () => {
  if (canvasRef.value) {
    // Delay to ensure canvas is properly sized
    setTimeout(render, 100);
  }
});
</script>
