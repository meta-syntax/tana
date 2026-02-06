<script setup lang="ts">
const features = [
  {
    icon: 'i-heroicons-link',
    title: 'OGP自動取得',
    description: 'URLを貼るだけでタイトル・説明・サムネイルを自動取得。手入力ゼロで見やすいカードが完成。',
    accent: false
  },
  {
    icon: 'i-heroicons-sparkles',
    title: 'AIがページを要約',
    description: 'ブックマークのページ内容をAIが2〜3文で要約。リンクを開かなくても内容を把握できる。',
    accent: true
  },
  {
    icon: 'i-heroicons-tag',
    title: 'AIタグ提案',
    description: 'ページの内容を分析してタグを自動提案。既存タグを優先的に再利用するから、タグが散らからない。',
    accent: true
  },
  {
    icon: 'i-heroicons-swatch',
    title: 'カラータグで整理',
    description: '10色のカラータグで直感的に分類。複数タグでフィルタリングして、必要な情報にすぐアクセス。',
    accent: false
  },
  {
    icon: 'i-heroicons-rss',
    title: 'RSSフィードで自動収集',
    description: 'お気に入りサイトのRSSを登録すれば、新着記事を自動でブックマークに追加。情報収集を自動化。',
    accent: false
  },
  {
    icon: 'i-heroicons-arrows-up-down',
    title: 'ドラッグ&ドロップで並び替え',
    description: '好きな順番に自由に並び替え。優先度の高いものを上に、あとで読むものは下に。',
    accent: false
  }
]
</script>

<template>
  <section class="space-y-8">
    <div class="space-y-3 text-center">
      <h2 class="text-3xl font-bold tracking-tight lg:text-4xl">
        Tanaなら、こう変わる
      </h2>
      <p class="text-white/60">
        AIとスマートな整理機能で、ブックマークが「使える資産」に
      </p>
    </div>
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <UCard
        v-for="feature in features"
        :key="feature.title"
        :class="[
          'ring-1',
          feature.accent
            ? 'bg-[#f97316]/5 ring-[#f97316]/25'
            : 'bg-white/5 ring-white/10'
        ]"
      >
        <div class="space-y-3">
          <UIcon
            :name="feature.icon"
            :class="[
              'size-8',
              feature.accent ? 'text-(--tana-accent)' : 'text-white/70'
            ]"
          />
          <p class="text-lg font-semibold">
            {{ feature.title }}
          </p>
          <p class="text-sm text-white/60">
            {{ feature.description }}
          </p>
        </div>
      </UCard>
    </div>
  </section>
</template>
