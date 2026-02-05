# Tana

「あとで読む」を、ちゃんと読む。

URLを保存するだけでタイトル・説明・サムネイルを自動取得する、個人向けブックマーク管理アプリ。

**URL:** https://tana.meta-syntax.biz/

Vercelで自動デプロイ（`develop`ブランチへのpushで自動反映）

## 主な機能

- **OGP自動取得** - URLを入力するだけでタイトル・説明・画像を自動で取得
- **ブックマーク管理** - 追加・編集・削除のCRUD操作
- **検索** - タイトルやURLでブックマークを即座に検索
- **ユーザー認証** - メールアドレス/パスワードによるサインアップ・ログイン
- **データ保護** - Supabase RLSによるユーザーごとのデータ分離
- **レスポンシブ対応** - PC / タブレット / スマートフォンに対応

## 技術スタック

| カテゴリ        | 技術                                     |
|-------------|----------------------------------------|
| フレームワーク     | Nuxt 4 / Vue 3                         |
| 言語          | TypeScript                             |
| UI          | Nuxt UI / Tailwind CSS 4               |
| バックエンド / DB | Supabase (PostgreSQL, Auth, RLS)       |
| OGP取得       | metascraper                            |
| バリデーション     | Zod                                    |
| テスト         | Vitest / @nuxt/test-utils / Playwright |
| CI/CD       | GitHub Actions                         |
| デプロイ        | Vercel                                 |
| ユーティリティ     | VueUse                                 |

## 技術的な意思決定

### Nuxt 4の採用

Nuxt 4は2025年にリリースされた最新メジャーバージョン。新しいディレクトリ構造（`app/`
ディレクトリ）や互換性の変更点など、最新のエコシステムをキャッチアップする目的で採用。

### Composablesの責務分離

ブックマーク・タグ操作のcomposablesは、CQRS（Command Query Responsibility Segregation）の考え方を参考に設計した。

**ブックマーク:**
- **`use-bookmark-query.ts`** - データの読み取り（検索・ページネーション・ソート）
- **`use-bookmark-mutations.ts`** - データの書き込み（追加・更新・削除 + 楽観的UI）
- **`use-bookmarks.ts`** - 上記を統合するファサード

**タグ:**
- **`use-tag-query.ts`** - タグ一覧の取得（件数付き）
- **`use-tag-mutations.ts`** - タグのCRUD・ブックマーク紐付け同期
- **`use-tags.ts`** - 上記を統合するファサード

読み取りと書き込みでは要件が異なる（読み取りはリアクティブな依存関係の管理、書き込みは楽観的更新とロールバック）ため、分離することで各composableの責務を明確にし、テスタビリティを高めている。

## ディレクトリ構成

```
app/
├── assets/css/          # グローバルCSS
├── components/
│   ├── common/          # 共通コンポーネント
│   ├── features/
│   │   ├── bookmark/    # ブックマーク関連コンポーネント
│   │   └── tag/         # タグ関連コンポーネント
│   └── pages/           # ページ固有コンポーネント
│       ├── auth/
│       ├── dashboard/
│       └── home/
├── composables/
│   ├── bookmark/       # ブックマーク (query / mutations / facade + UI)
│   ├── auth/           # 認証
│   ├── tag/            # タグ (query / mutations / facade + UI)
│   └── ui/             # UI共通ロジック (OGP, 相対時間, ページネーション等)
├── layouts/             # レイアウト (auth, dashboard, marketing)
├── pages/               # ルーティング
├── server/api/          # サーバーAPI (OGP取得エンドポイント)
├── types/               # 型定義
└── utils/               # ユーティリティ (認証エラーi18n)
```

## セットアップ

### 前提条件

- Node.js 18+
- npm
- [Supabase](https://supabase.com/) プロジェクト

### 1. リポジトリをクローン

```bash
git clone <repository-url>
cd tana
```

### 2. 依存関係をインストール

```bash
npm install
```

### 3. 環境変数を設定

`.env.example` をコピーして `.env` を作成し、Supabaseの認証情報を設定する。

```bash
cp .env.example .env
```

```
NUXT_SUPABASE_URL=https://your-project.supabase.co
NUXT_SUPABASE_API_KEY=your-anon-key
NUXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 4. Supabaseのテーブルを作成

Supabaseダッシュボードで `bookmarks` テーブルを作成し、RLS (Row Level Security) を有効化する。

### 5. 開発サーバーを起動

```bash
npm run dev
```

http://localhost:3000 でアクセスできる。

## スクリプト

| コマンド                 | 説明                |
|----------------------|-------------------|
| `npm run dev`        | 開発サーバー起動          |
| `npm run build`      | プロダクションビルド        |
| `npm run preview`    | ビルドのプレビュー         |
| `npm run lint`       | ESLint実行          |
| `npm run lint:fix`   | ESLint自動修正        |
| `npm run typecheck`  | TypeScript型チェック   |
| `npm run test`       | ユニットテスト実行         |
| `npm run test:watch` | ユニットテスト（watchモード） |
| `npm run db:types`   | Supabaseの型定義を再生成  |

## ライセンス

Private
