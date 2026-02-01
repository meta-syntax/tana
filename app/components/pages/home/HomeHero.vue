<template>
  <div class="space-y-8">
    <UBadge
      color="primary"
      variant="soft"
      class="w-fit bg-[#f97316]/15 text-[#fdba74] ring-1 ring-[#f97316]/35"
    >
      2026年版 リニューアル
    </UBadge>
    <div class="space-y-4">
      <h1 class="text-4xl font-bold tracking-tight lg:text-6xl">
        ブックマークを、<br class="hidden sm:block">
        いつでも取り出せる資産に。
      </h1>
      <p class="text-lg text-white/70">
        Tanaは個人向けブックマーク管理Webアプリ。URLの保存・編集・削除に加え、OGP自動取得とサムネイル表示で、見返しやすいコレクションを作れます。
      </p>
    </div>
    <div class="flex flex-wrap gap-4">
      <UButton
        to="/login"
        size="lg"
        class="bg-(--tana-accent) text-[#111] hover:bg-[#ea580c]"
      >
        無料で始める
      </UButton>
      <UButton
        variant="ghost"
        size="lg"
        class="border border-white/20 text-white hover:bg-white/10"
      >
        デモを見る
      </UButton>
    </div>
    <div class="grid gap-4 sm:grid-cols-2">
      <UCard class="bg-white/5 ring-1 ring-white/10">
        <div class="space-y-2">
          <p class="text-sm text-white/60">
            OGP自動取得
          </p>
          <p class="text-lg font-semibold">
            タイトルや説明を自動補完
          </p>
        </div>
      </UCard>
      <UCard class="bg-white/5 ring-1 ring-white/10">
        <div class="space-y-2">
          <p class="text-sm text-white/60">
            快適検索
          </p>
          <p class="text-lg font-semibold">
            必要なリンクにすぐ到達
          </p>
        </div>
      </UCard>
    </div>
  </div>
</template>
