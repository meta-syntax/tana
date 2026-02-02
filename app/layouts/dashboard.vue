<script setup lang="ts">
const { user, signOut, redirectIfUnauthenticated } = useAuth()

redirectIfUnauthenticated()

defineSlots<{
  default(): VNode[]
}>()

const signingOut = ref(false)

const handleSignOut = async () => {
  if (signingOut.value) return

  signingOut.value = true
  try {
    await signOut()
  } finally {
    signingOut.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-(--tana-bg)">
    <DashboardHeader
      :user-email="user?.email"
      :signing-out="signingOut"
      @sign-out="handleSignOut"
    />
    <slot />
  </div>
</template>
