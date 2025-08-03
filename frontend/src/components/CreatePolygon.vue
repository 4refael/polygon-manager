<template>
  <BaseModal :show="show" @close="cancel">
    <div class="p-4 md:p-6">
      <div class="text-center mb-5">
        <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mx-auto mb-3 flex items-center justify-center">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
        <h3 data-testid="create-polygon-title" class="text-lg font-bold text-gray-900 mb-2">
          Name Your Polygon
        </h3>
        <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl px-4 py-2 border border-blue-100">
          <div class="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
            <span class="font-medium">{{ pointCount }} {{ pointCount === 1 ? 'point' : 'points' }}</span>
          </div>
        </div>
      </div>
      
      <div class="mb-6">
        <input
          ref="nameInput"
          v-model="polygonName"
          data-testid="polygon-name-input"
          type="text"
          placeholder="Enter polygon name..."
          class="w-full px-3 py-3 md:px-4 md:py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-800 placeholder-gray-400 text-base md:text-sm touch-manipulation"
          maxlength="100"
          @keyup.enter="save"
          @keyup.escape="cancel"
        >
        
        <div v-if="error" data-testid="validation-error" class="bg-red-50 border border-red-200 text-red-700 text-sm mt-3 p-3 rounded-xl">
          {{ error }}
        </div>
      </div>
      
      <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
        <ActionButton variant="secondary" @click="cancel" data-testid="cancel-button" class="flex-1 touch-manipulation">
          Cancel
        </ActionButton>
        <ActionButton 
          variant="primary" 
          @click="save" 
          :disabled="!polygonName.trim() || !!error"
          data-testid="create-button"
          class="flex-1 touch-manipulation"
        >
          Create Polygon
        </ActionButton>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import BaseModal from './BaseModal.vue';
import ActionButton from './ActionButton.vue';

const props = defineProps<{
  show: boolean;
  pointCount: number;
}>();

const emit = defineEmits<{
  save: [name: string];
  cancel: [];
}>();

const nameInput = ref<HTMLInputElement | null>(null);
const polygonName = ref('');

const error = computed(() => {
  const name = polygonName.value.trim();
  if (!name) return null;
  if (name.length > 100) return 'Name too long (max 100 characters)';
  return null;
});

const save = () => {
  const name = polygonName.value.trim();
  if (!name || error.value) return;
  
  emit('save', name);
  polygonName.value = '';
};

const cancel = () => {
  emit('cancel');
  polygonName.value = '';
};

watch(() => props.show, async (show) => {
  if (show) {
    await nextTick();
    nameInput.value?.focus();
  }
});
</script>