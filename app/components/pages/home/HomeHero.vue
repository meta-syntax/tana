<template>
  <div class="space-y-8">
    <UBadge
      color="primary"
      variant="soft"
      class="w-fit bg-[#f97316]/15 text-[#fdba74] ring-1 ring-[#f97316]/35"
    >
      Personal Use
    </UBadge>
    <div class="space-y-4">
      <h1 class="text-4xl font-bold tracking-tight lg:text-6xl">
        「あとで読む」を、<br>ちゃんと読む。
      </h1>
      <p class="text-lg text-white/70">
        URLを放り込むだけ。タイトルもサムネイルも自動で付くから、あとは読み返すだけ。
      </p>
    </div>
    <UButton
      to="/login"
      size="lg"
      class="bg-(--tana-accent) text-[#111] hover:bg-[#ea580c]"
    >
      使ってみる
    </UButton>
    <div class="grid gap-4 sm:grid-cols-2">
      <UCard class="bg-white/5 ring-1 ring-white/10">
        <div class="space-y-2">
          <p class="text-sm text-white/60">
            貼るだけでOK
          </p>
          <p class="text-lg font-semibold">
            URLからタイトルと画像を自動取得
          </p>
        </div>
      </UCard>
      <UCard class="bg-white/5 ring-1 ring-white/10">
        <div class="space-y-2">
          <p class="text-sm text-white/60">
            すぐ見つかる
          </p>
          <p class="text-lg font-semibold">
            タイトルやURLでさっと検索
          </p>
        </div>
      </UCard>
    </div>
  </div>
</template>
