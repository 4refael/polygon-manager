<template>
  <BaseModal :show="show" @close="$emit('cancel')">
    <div class="p-4 md:p-8">
      <div class="text-center mb-6">
        <div class="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl mx-auto mb-3 md:mb-4 flex items-center justify-center">
          <svg class="w-6 h-6 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 data-testid="confirm-dialog-title" class="text-lg md:text-xl font-bold text-gray-900 mb-3 md:mb-4">
          {{ title }}
        </h3>
        <div class="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-3 md:p-4 border border-red-100">
          <p data-testid="confirm-dialog-message" class="text-gray-700 text-sm md:text-base">
            {{ message }}
          </p>
          <p v-if="subtitle" class="text-xs md:text-sm text-gray-500 mt-2">
            {{ subtitle }}
          </p>
        </div>
      </div>
      
      <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
        <ActionButton variant="secondary" @click="$emit('cancel')" data-testid="confirm-cancel-button" class="flex-1 touch-manipulation">
          {{ cancelText }}
        </ActionButton>
        <ActionButton variant="danger" @click="$emit('confirm')" data-testid="confirm-delete-button" class="flex-1 touch-manipulation">
          {{ confirmText }}
        </ActionButton>
      </div>
    </div>
  </BaseModal>
</template>

<script setup lang="ts">
import BaseModal from './BaseModal.vue';
import ActionButton from './ActionButton.vue';

withDefaults(defineProps<{
  show: boolean;
  title: string;
  message: string;
  subtitle?: string;
  confirmText?: string;
  cancelText?: string;
}>(), {
  confirmText: 'Confirm',
  cancelText: 'Cancel'
});

defineEmits<{
  confirm: [];
  cancel: [];
}>();
</script>