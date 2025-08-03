<template>
  <button
    :disabled="disabled"
    :class="[
      'px-4 py-3 md:px-6 md:py-3 rounded-xl font-semibold transition-all duration-200 transform touch-manipulation min-h-[44px]',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      variantClasses,
      'hover:scale-[1.02] active:scale-[0.98]'
    ]"
    v-bind="$attrs"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}>();

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'primary':
      return 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl disabled:hover:from-blue-500 disabled:hover:to-purple-600';
    case 'danger':
      return 'bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 text-red-700 border border-red-200/50';
    case 'secondary':
    default:
      return 'text-gray-600 hover:text-gray-800 hover:bg-gray-50';
  }
});
</script>