<script setup lang="ts">
const steps = [
  {
    step: '1',
    title: 'URLを貼るだけ',
    description: '保存したいページのURLを入力するだけ。それだけで準備完了。'
  },
  {
    step: '2',
    title: 'タイトルと画像を自動取得',
    description: 'OGP情報を自動で取得。サムネイル付きで何のページか一目瞭然。'
  },
  {
    step: '3',
    title: '自分だけのメモを残せる',
    description: '「なぜ保存したか」「どう使うか」を自分の言葉で書き添えられる。'
  },
  {
    step: '4',
    title: 'いつでもどこでもアクセス',
    description: 'PC・スマホ・タブレット。ブラウザでどの端末からでも自分の棚にアクセスできる。'
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
        シンプルだから続けられる
      </p>
    </div>
    <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="item in steps"
        :key="item.step"
        class="space-y-3"
      >
        <div
          class="flex size-10 items-center justify-center rounded-full bg-(--tana-accent) text-lg font-bold text-[#111]"
        >
          {{ item.step }}
        </div>
        <p class="text-lg font-semibold">
          {{ item.title }}
        </p>
        <p class="text-sm text-white/60">
          {{ item.description }}
        </p>
      </div>
    </div>
  </section>
</template>
