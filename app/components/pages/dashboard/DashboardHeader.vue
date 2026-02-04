<script setup lang="ts">
interface Props {
  userEmail?: string | null
  signingOut?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  signingOut: false
})

const emit = defineEmits<{
  signOut: []
}>()
</script>

<template>
  <header class="relative overflow-hidden bg-(--tana-ink) text-white">
    <div class="absolute inset-0 bg-[radial-gradient(800px_circle_at_10%_20%,rgba(249,115,22,0.18),transparent_60%)]" />
    <UContainer class="relative py-3 sm:py-5">
      <div class="flex items-center justify-between">
        <p class="text-xl font-bold tracking-tight text-white/60">
          <span class="text-(--tana-accent)">T</span>ana
        </p>
        <div class="flex items-center gap-4">
          <div class="hidden rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 sm:block">
            {{ props.userEmail }}
          </div>
          <UColorModeButton
            variant="ghost"
            class="border border-white/20 text-white hover:bg-white/10 hover:text-white"
          />
          <UButton
            variant="ghost"
            class="border border-white/20 text-white hover:bg-white/10 hover:text-white"
            :loading="props.signingOut"
            :disabled="props.signingOut"
            @click="emit('signOut')"
          >
            ログアウト
          </UButton>
        </div>
      </div>
    </UContainer>
  </header>
</template>
