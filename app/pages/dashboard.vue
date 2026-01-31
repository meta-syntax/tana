<script setup lang="ts">
const { user, signOut, redirectIfUnauthenticated } = useAuth()

redirectIfUnauthenticated()
</script>

<template>
  <div class="min-h-screen bg-[var(--tana-bg)]">
    <header class="relative overflow-hidden bg-[var(--tana-ink)] text-white">
      <div class="absolute inset-0 bg-[radial-gradient(800px_circle_at_10%_20%,rgba(249,115,22,0.18),transparent_60%)]"></div>
      <UContainer class="relative py-8">
        <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div class="space-y-2">
            <p class="text-sm text-white/60">
              ようこそ、Tanaへ
            </p>
            <h1 class="text-3xl font-bold lg:text-4xl">
              ダッシュボード
            </h1>
            <p class="text-white/70">
              保存したブックマークを、素早く検索・整理できます。
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-4">
            <div class="rounded-full border border-white/15 px-4 py-2 text-sm text-white/70">
              {{ user?.email }}
            </div>
            <UButton
              variant="ghost"
              class="border border-white/20 text-white hover:bg-white/10"
              @click="signOut"
            >
              ログアウト
            </UButton>
          </div>
        </div>
      </UContainer>
    </header>

    <main class="-mt-10 pb-12">
      <UContainer class="space-y-6">
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <UCard class="border border-[var(--tana-border)] bg-white">
            <div class="space-y-2">
              <p class="text-sm text-gray-500">
                総ブックマーク
              </p>
              <p class="text-3xl font-bold text-[#111]">
                0
              </p>
              <p class="text-xs text-gray-400">
                最初のURLを保存しましょう
              </p>
            </div>
          </UCard>
          <UCard class="border border-[var(--tana-border)] bg-white">
            <div class="space-y-2">
              <p class="text-sm text-gray-500">
                OGP取得待ち
              </p>
              <p class="text-3xl font-bold text-[#111]">
                0
              </p>
              <p class="text-xs text-gray-400">
                自動補完を待っています
              </p>
            </div>
          </UCard>
          <UCard class="border border-[var(--tana-border)] bg-white">
            <div class="space-y-2">
              <p class="text-sm text-gray-500">
                今週の追加数
              </p>
              <p class="text-3xl font-bold text-[#111]">
                0
              </p>
              <p class="text-xs text-gray-400">
                まずは数件から
              </p>
            </div>
          </UCard>
        </div>

        <UCard class="border border-[var(--tana-border)] bg-white">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div class="space-y-2">
              <h2 class="text-2xl font-bold text-[#111]">
                ブックマーク一覧
              </h2>
              <p class="text-sm text-gray-500">
                保存したURLがここに表示されます。検索してすぐ見つけられます。
              </p>
            </div>
            <UButton
              variant="soft"
              class="bg-[#f97316]/15 text-[#f97316] hover:bg-[#f97316]/25"
            >
              URLを追加
            </UButton>
          </div>
          <div class="mt-6 rounded-2xl border border-dashed border-[var(--tana-border)] bg-white p-8 text-center text-sm text-gray-500">
            ここにサムネイル付きで表示されます。
          </div>
        </UCard>
      </UContainer>
    </main>
  </div>
</template>
