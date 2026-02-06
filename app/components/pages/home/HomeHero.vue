<template>
  <div class="space-y-8">
    <UBadge
      color="primary"
      variant="soft"
      class="w-fit bg-[#f97316]/15 text-[#fdba74] ring-1 ring-[#f97316]/35"
    >
      AI-Powered Bookmark Manager
    </UBadge>
    <div class="space-y-4">
      <h1 class="text-4xl font-bold tracking-tight lg:text-6xl">
        「あとで読む」を、<br>ちゃんと読む。
      </h1>
      <p class="text-lg text-white/70">
        URLを放り込むだけ。タイトルもサムネイルも自動で付いて、AIが要約とタグまで提案してくれる。
      </p>
    </div>
    <div class="flex items-center gap-3">
      <UButton
        to="/register"
        size="lg"
        class="bg-(--tana-accent) text-[#111] hover:bg-[#ea580c]"
      >
        使ってみる
      </UButton>
      <UButton
        to="/login"
        size="lg"
        variant="ghost"
        class="border border-white/15 text-white hover:bg-white/10 hover:text-white"
      >
        ログイン
      </UButton>
    </div>
    <div class="grid gap-4 sm:grid-cols-3">
      <UCard class="bg-white/5 ring-1 ring-white/10">
        <div class="space-y-2">
          <UIcon
            name="i-heroicons-link"
            class="size-5 text-(--tana-accent)"
          />
          <p class="text-sm text-white/60">
            貼るだけでOK
          </p>
          <p class="font-semibold">
            URLからタイトルと画像を自動取得
          </p>
        </div>
      </UCard>
      <UCard class="bg-white/5 ring-1 ring-white/10">
        <div class="space-y-2">
          <UIcon
            name="i-heroicons-sparkles"
            class="size-5 text-(--tana-accent)"
          />
          <p class="text-sm text-white/60">
            AIがサポート
          </p>
          <p class="font-semibold">
            ページ要約とタグ提案を自動生成
          </p>
        </div>
      </UCard>
      <UCard class="bg-white/5 ring-1 ring-white/10">
        <div class="space-y-2">
          <UIcon
            name="i-heroicons-tag"
            class="size-5 text-(--tana-accent)"
          />
          <p class="text-sm text-white/60">
            迷わず整理
          </p>
          <p class="font-semibold">
            カラータグで直感的に分類
          </p>
        </div>
      </UCard>
    </div>
  </div>
</template>
