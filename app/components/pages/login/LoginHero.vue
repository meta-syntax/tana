<template>
  <div class="space-y-6">
    <UBadge
      color="primary"
      variant="soft"
      class="w-fit bg-[#f97316]/15 text-[#fdba74] ring-1 ring-[#f97316]/35"
    >
      セキュアログイン
    </UBadge>
    <h1 class="text-4xl font-bold tracking-tight lg:text-5xl">
      あなたのブックマークを、<br class="hidden sm:block">
      もっと見返しやすく。
    </h1>
    <p class="text-lg text-white/70">
      URLを保存して自動でOGP情報を取得。サムネイルと検索で、必要なリンクにすぐ辿り着けます。
    </p>
    <div class="grid gap-4 sm:grid-cols-2">
      <UCard class="bg-white/5 ring-1 ring-white/10">
        <div class="space-y-2">
          <p class="text-sm text-white/60">
            OGP自動取得
          </p>
          <p class="text-base font-semibold">
            タイトル・説明を補完
          </p>
        </div>
      </UCard>
      <UCard class="bg-white/5 ring-1 ring-white/10">
        <div class="space-y-2">
          <p class="text-sm text-white/60">
            レスポンシブ対応
          </p>
          <p class="text-base font-semibold">
            スマホでも快適に閲覧
          </p>
        </div>
      </UCard>
    </div>
  </div>
</template>
