<script setup lang="ts">
interface PreviewTag {
  name: string
  color: string
}

interface PreviewItem {
  title: string
  description: string
  domain: string
  time: string
  thumbnail: string
  tags: PreviewTag[]
  summary?: string
}

const previewItems: PreviewItem[] = [
  {
    title: 'Nuxt 4 移行ガイド - 公式ドキュメント',
    description: 'Nuxt 3からNuxt 4への移行手順を解説します',
    domain: 'nuxt.com',
    time: '3分前',
    thumbnail: 'https://nuxt.com/new-social.jpg',
    tags: [
      { name: 'フロントエンド', color: '#3b82f6' },
      { name: 'マイグレーション', color: '#ef4444' }
    ],
    summary: 'Nuxt 4はapp/ディレクトリ構造の標準化、TypeScript統合の強化、パフォーマンス改善が主な変更点。既存プロジェクトは互換性レイヤーで段階移行可能。'
  },
  {
    title: 'Tailwind CSS v4 の新機能まとめ',
    description: 'パフォーマンス改善と新ユーティリティを紹介',
    domain: 'tailwindcss.com',
    time: '1時間前',
    thumbnail: 'https://tailwindcss.com/opengraph-image.jpg',
    tags: [
      { name: 'CSS', color: '#8b5cf6' },
      { name: 'フロントエンド', color: '#3b82f6' }
    ]
  },
  {
    title: 'Vite 6 ビルドツールの進化',
    description: '次世代フロントエンドツールの最新アップデート',
    domain: 'vite.dev',
    time: '3時間前',
    thumbnail: 'https://vite.dev/og-image.jpg',
    tags: [
      { name: 'ツール', color: '#10b981' }
    ]
  },
  {
    title: 'Supabase で始めるリアルタイムアプリ開発',
    description: 'PostgreSQLベースのBaaSで高速プロトタイピング',
    domain: 'supabase.com',
    time: '昨日',
    thumbnail: 'https://supabase.com/images/og/supabase-og.png',
    tags: [
      { name: 'BaaS', color: '#f59e0b' }
    ]
  }
]
</script>

<template>
  <div class="relative">
    <div class="absolute -inset-4 rounded-4xl bg-[#f97316]/10 blur-2xl" />

    <!-- ダッシュボード風フレーム -->
    <div class="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur">
      <!-- フレームヘッダー -->
      <div class="flex items-center gap-2 border-b border-white/10 px-4 py-3">
        <span class="size-2.5 rounded-full bg-white/20" />
        <span class="size-2.5 rounded-full bg-white/20" />
        <span class="size-2.5 rounded-full bg-white/20" />
        <span class="ml-2 text-xs text-white/40">ダッシュボード</span>
      </div>

      <!-- カードグリッド -->
      <div class="grid grid-cols-2 gap-3 p-4">
        <div
          v-for="item in previewItems"
          :key="item.title"
          class="overflow-hidden rounded-lg border border-white/10 bg-white/5"
        >
          <div class="aspect-[1.91/1] overflow-hidden">
            <img
              :src="item.thumbnail"
              :alt="item.title"
              loading="lazy"
              width="600"
              height="314"
              class="h-full w-full object-cover"
            >
          </div>
          <div class="p-3">
            <!-- タグバッジ -->
            <div class="mb-1.5 flex flex-wrap gap-1">
              <span
                v-for="tag in item.tags"
                :key="tag.name"
                class="inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-medium"
                :style="{
                  backgroundColor: `${tag.color}20`,
                  color: tag.color
                }"
              >
                {{ tag.name }}
              </span>
            </div>
            <p class="line-clamp-1 text-sm font-medium text-white">
              {{ item.title }}
            </p>
            <!-- AI要約 -->
            <p
              v-if="item.summary"
              class="mt-1 line-clamp-2 text-[10px] leading-relaxed text-[#fdba74]/80"
            >
              <UIcon
                name="i-heroicons-sparkles"
                class="mr-0.5 inline-block size-2.5 align-text-top"
              />
              {{ item.summary }}
            </p>
            <p
              v-else
              class="mt-1 line-clamp-1 text-xs text-white/50"
            >
              {{ item.description }}
            </p>
            <div class="mt-2 flex items-center justify-between text-[10px] text-white/40">
              <span class="flex items-center gap-1">
                <UIcon
                  name="i-heroicons-globe-alt"
                  class="size-3"
                />
                {{ item.domain }}
              </span>
              <span>{{ item.time }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
