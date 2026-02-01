<template>
  <nav class="flex items-center justify-between">
    <div class="flex items-center gap-3">
      <div
        class="flex h-10 w-10 items-center justify-center rounded-2xl bg-(--tana-accent) text-lg font-bold text-[#111]"
      >
        T
      </div>
      <div>
        <p class="text-sm text-white/60">
          知識をつなぐ
        </p>
        <p class="text-lg font-semibold">
          Tana
        </p>
      </div>
    </div>
    <UButton
      to="/login"
      variant="ghost"
      class="border border-white/15 text-white hover:bg-white/10"
    >
      ログイン
    </UButton>
  </nav>
</template>
