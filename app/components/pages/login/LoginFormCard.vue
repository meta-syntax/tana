<script setup lang="ts">
import type { VNode } from 'vue'

interface Props {
  isSignUp: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  toggle: []
}>()

defineSlots<{
  form(): VNode[]
}>()
</script>

<template>
  <UCard class="border border-white/10 bg-white/95 text-[#111] shadow-2xl">
    <template #header>
      <div class="space-y-2 text-center">
        <p class="text-sm text-gray-500">
          Tana アカウント
        </p>
        <h2 class="text-3xl font-bold text-[#111]">
          {{ props.isSignUp ? '新規登録' : 'ログイン' }}
        </h2>
      </div>
    </template>

    <slot name="form" />

    <template #footer>
      <div class="text-center">
        <UButton
          variant="ghost"
          @click="emit('toggle')"
        >
          {{ props.isSignUp ? 'すでにアカウントをお持ちですか？ログイン' : 'アカウントをお持ちでない方はこちら' }}
        </UButton>
      </div>
    </template>
  </UCard>
</template>
