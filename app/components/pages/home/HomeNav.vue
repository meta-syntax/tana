<template>
  <nav class="flex items-center justify-between">
    <NuxtLink
      to="/"
      class="text-xl font-bold tracking-tight"
    >
      <span class="text-(--tana-accent)">T</span>ana
    </NuxtLink>
    <UButton
      to="/login"
      variant="ghost"
      class="border border-white/15 text-white hover:bg-white/10 hover:text-white"
    >
      ログイン
    </UButton>
  </nav>
</template>
