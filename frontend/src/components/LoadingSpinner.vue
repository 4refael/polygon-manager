<template>
  <div class="bg-white rounded-lg p-4 shadow-xl flex items-center space-x-3 border border-gray-100">
    <div class="relative">
      <div class="animate-spin rounded-full h-8 w-8 border-2 border-blue-200"></div>
      <div class="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent absolute top-0 left-0"></div>
    </div>
    <div>
      <span class="text-gray-800 font-semibold">{{ title }}</span>
      <div v-if="subtitle" class="text-sm text-gray-500 mt-1">{{ subtitle }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  subtitle?: string;
}>();
</script>