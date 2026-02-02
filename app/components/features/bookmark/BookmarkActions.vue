<script setup lang="ts">
const emit = defineEmits<{
  edit: []
  delete: []
}>()
</script>

<template>
  <div class="absolute right-2 top-2 flex gap-1 opacity-100 transition-opacity duration-200 sm:opacity-0 sm:group-hover:opacity-100">
    <UButton
      icon="i-heroicons-pencil-square"
      size="xs"
      color="neutral"
      variant="solid"
      class="bg-white/90 shadow-sm backdrop-blur-sm hover:bg-white"
      @click.prevent="emit('edit')"
    />
    <UButton
      icon="i-heroicons-trash"
      size="xs"
      color="error"
      variant="solid"
      class="bg-white/90 shadow-sm backdrop-blur-sm hover:bg-red-50"
      @click.prevent="emit('delete')"
    />
  </div>
</template>
