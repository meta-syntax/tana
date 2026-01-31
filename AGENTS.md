# Tana

返答は全て日本語で行うこと

## Tech Stack

- Nuxt 4 + Vue 3
- TypeScript
- Tailwind CSS
- Nuxt UI

## Architecture

- Composition API + TypeScript

### Directory

#### components

**UIはNuxt UIを優先的に使用する**

それ以外の構成はAtomic Designに基づく構成とし、積極的に再利用可能なコンポーネントを作成する

#### composables

再利用可能なロジックは積極的にcomposablesに切り出す

## Coding Rules

### 1. Style

- ESLint設定に従う
- コミット前に必ずlintとtype checkを通す

### 2. File Naming

- コンポーネント: PascalCase (例: `AboutSection.vue`)
- その他: kebab-case

### 3. Component Structure

```vue

<script setup lang="ts">
</script>

<template>
</template>
```

### 4. Props Definition

- TypeScriptのジェネリック型を使用する
- ランタイムバリデーション（type: Object など）は使わない
- デフォルト値は`withDefaults`を使用

```typescript
// ❌ BAD: ランタイムバリデーション
const props = defineProps({
  tech: {
    type: Object,
    required: true
  }
})

// ✅ GOOD: TypeScript型定義
interface Props {
  tech: Tech
  index: number
  isVisible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isVisible: false
})
```

### 5. Styling

- Tailwind CSSを優先
- カスタムCSSは`assets/css/`
- カラー変数は統一: `#111`, `#22c55e`, `#e8e8e8` など

## Commands

```bash
npm run dev         # 開発サーバー
npm run build       # ビルド
npm run lint        # Lint
npm run typecheck   # Type check
```
