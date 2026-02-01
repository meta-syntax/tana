<template>
  <div class="relative">
    <div class="absolute -inset-4 rounded-4xl bg-[#f97316]/10 blur-2xl" />
    <UCard class="relative border border-white/10 bg-white/5 backdrop-blur">
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <p class="text-sm text-white/60">
            今日のフォーカス
          </p>
          <UBadge class="bg-[#f97316]/20 text-[#fdba74] ring-1 ring-[#f97316]/35">
            ライブ同期
          </UBadge>
        </div>
        <div class="space-y-3">
          <div class="rounded-2xl border border-white/10 bg-white/10 p-4">
            <p class="text-sm text-white/60">
              仕事
            </p>
            <p class="text-base font-semibold">
              参考資料を整理
            </p>
            <p class="mt-2 text-xs text-white/50">
              12件のリンク
            </p>
          </div>
          <div class="rounded-2xl border border-white/10 bg-white/10 p-4">
            <p class="text-sm text-white/60">
              学習
            </p>
            <p class="text-base font-semibold">
              Nuxt 3/4の移行メモ
            </p>
            <p class="mt-2 text-xs text-white/50">
              6件のリンク
            </p>
          </div>
          <div class="rounded-2xl border border-white/10 bg-white/10 p-4">
            <p class="text-sm text-white/60">
              趣味
            </p>
            <p class="text-base font-semibold">
              デザイン記事を保存
            </p>
            <p class="mt-2 text-xs text-white/50">
              4件のリンク
            </p>
          </div>
        </div>
        <div class="flex items-center justify-between text-sm text-white/60">
          <span>次の整理タイミング</span>
          <span class="text-white">今夜 21:00</span>
        </div>
      </div>
    </UCard>
  </div>
</template>
