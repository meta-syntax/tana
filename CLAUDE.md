返答は全て日本語で行うこと

# Tana

```
Tanaは個人向けブックマーク管理アプリ。Nuxt 4 + Supabaseで構築。
主な機能は、ブックマークのCRUD、OGP自動取得、検索、ユーザー認証。
URLを入力するとタイトル・説明・画像を自動取得し、リッチに表示する。RLSでデータ保護。レスポンシブ対応。
```

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

```
components/
├── common/           # 共通コンポーネント（複数ページで再利用）
├── features/         # 機能単位のコンポーネント
└── pages/            # ページ固有のコンポーネント
    ├── dashboard/
    ├── home/
    └── login/
```

| ディレクトリ      | 基準                                       |
|-------------|------------------------------------------|
| `common/`   | 複数ページ・機能で再利用される汎用UI                      |
| `features/` | 特定のドメイン/機能に紐づくが、複数ページで使用される可能性があるコンポーネント |
| `pages/`    | 特定のページでのみ使用されるコンポーネント                    |

#### composables

再利用可能なロジックは積極的にcomposablesに切り出す。
ドメイン別にサブディレクトリを分け、`nuxt.config.ts`の`imports.dirs`で各ディレクトリを自動インポート対象に設定する。
データ操作はCQRSパターン（query / mutations / facade）で分割する。

| ディレクトリ      | 基準                 |
|-------------|--------------------|
| `bookmark/` | ブックマークのデータ操作・UI制御  |
| `auth/`     | ユーザー認証・セッション管理     |
| `tag/`      | タグのデータ操作・UI制御      |
| `ui/`       | ドメインに依存しない汎用UIロジック |

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
// BAD: ランタイムバリデーション
const props = defineProps({
  tech: {
    type: Object,
    required: true
  }
})

// GOOD: TypeScript型定義
interface Props {
  tech: Tech
  index: number
  isVisible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isVisible: false
})
```

### 5. v-model & defineModel

- `v-model`には`defineModel`を使用する

### 6. Styling

- Nuxt UIのデザインシステムに従う
- Tailwind CSSを優先
- カスタムCSSは`assets/css/`に配置
- Nuxt UIのCSS変数を`main.css`で定義し、セマンティッククラス（`text-highlighted`, `bg-default`など）を使用する
- CSS変数を使用する場合、`var()`は不要: `bg-(--tana-accent)`
  - **Bad:** `bg-[var(--tana-accent)]`

### 7. Test

- Vitest + @nuxt/test-utilsでユニットテスト・統合テストを実装
- テスティングトロフィーを意識したテスト設計を行う
  - E2Eは機能を絞って実装すること
  - 統合テスト(Components/)とユニットテスト(Composables/)を主に実装すること

## Quality

コーディング後は**必須で**以下のコマンドを実行し、エラーがある場合は修正して品質を担保すること。

```bash
npm run lint        # Lint
npm run typecheck   # Type check
```
