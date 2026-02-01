<script setup lang="ts">
import type { VNode } from 'vue'

const { user, signOut, redirectIfUnauthenticated } = useAuth()

redirectIfUnauthenticated()

defineSlots<{
  default(): VNode[]
}>()
</script>

<template>
  <div class="min-h-screen bg-(--tana-bg)">
    <DashboardHeader
      :user-email="user?.email"
      @sign-out="signOut"
    />
    <slot />
  </div>
</template>
