<template>
  <nav class="flex items-center justify-between">
    <NuxtLink
      to="/"
      class="text-xl font-bold tracking-tight"
    >
      <span class="text-(--tana-accent)">T</span>ana
    </NuxtLink>
    <div class="flex items-center gap-3">
      <UButton
        to="https://github.com/meta-syntax/tana"
        target="_blank"
        variant="ghost"
        icon="i-simple-icons-github"
        class="text-white/60 hover:bg-white/10 hover:text-white"
      />
      <UButton
        to="/login"
        variant="ghost"
        class="text-white/60 hover:bg-white/10 hover:text-white"
      >
        ログイン
      </UButton>
      <UButton
        to="/register"
        class="bg-(--tana-accent) text-[#111] hover:bg-[#ea580c]"
      >
        使ってみる
      </UButton>
    </div>
  </nav>
</template>
