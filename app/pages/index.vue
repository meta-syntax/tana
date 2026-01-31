<script setup lang="ts">
</script>

<template>
  <div class="relative min-h-screen overflow-hidden bg-[var(--tana-ink)] text-white">
    <div class="absolute inset-0 bg-[radial-gradient(1200px_circle_at_15%_15%,rgba(249,115,22,0.28),transparent_60%)]"></div>
    <div class="absolute -top-24 right-[-10%] h-72 w-72 rounded-full bg-[#f97316]/20 blur-3xl"></div>
    <div class="absolute bottom-[-20%] left-[-10%] h-96 w-96 rounded-full bg-white/10 blur-3xl"></div>

    <UContainer class="relative py-16 lg:py-24">
      <nav class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--tana-accent)] text-lg font-bold text-[#111]">
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

      <div class="mt-12 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
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
              ブックマークを、<br class="hidden sm:block" />
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
              class="bg-[var(--tana-accent)] text-[#111] hover:bg-[#ea580c]"
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

        <div class="relative">
          <div class="absolute -inset-4 rounded-[32px] bg-[#f97316]/10 blur-2xl"></div>
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
      </div>
    </UContainer>
  </div>
</template>
