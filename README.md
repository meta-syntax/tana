# Tana

「あとで読む」を、ちゃんと読む。

URLを保存するだけでタイトル・説明・サムネイルを自動取得する、AI搭載の個人向けブックマーク管理アプリ。

**URL:** https://tana.meta-syntax.biz/

Vercelで自動デプロイ（`develop`ブランチへのpushで自動反映）

## 既存ブックマークアプリとの差別化

| 観点 | 一般的なブックマークアプリ | Tana |
|------|--------------------------|------|
| 保存体験 | URLをコピペして手動でタイトル・タグを入力 | URLを貼るだけでOGP自動取得、AIがタグまで提案 |
| 情報の把握 | リンクを開かないと内容がわからない | AIが要約を生成、開かずに内容を把握できる |
| 情報収集 | 記事を見つけるたびに手動で保存 | RSSフィードを登録すれば新着記事を自動でブックマーク |
| 整理 | フォルダ分けやタグ付けが面倒で放置しがち | AIタグ提案+カラータグで手間なく整理 |
| 並び順 | 追加順や名前順の固定ソート | ドラッグ&ドロップで自由に並び替え |
| 操作感 | 保存→サーバー応答待ち→反映 | 楽観的UIで即座に反映、ストレスフリー |

## 主な機能

### ブックマーク管理

- **OGP自動取得** - URLを入力するだけでタイトル・説明・サムネイル画像を自動取得
- **ブックマークCRUD** - 追加・編集・削除、楽観的UIで即座に反映
- **検索** - タイトル・URL・説明文から部分一致検索（debounce付き）
- **ソート** - 作成日 / タイトル / URL / カスタム順で並び替え
- **ドラッグ&ドロップ** - 自由な並び替え（中間値計算+自動リバランス）
- **ページネーション** - 12 / 24 / 48件ずつ表示
- **カードサイズ切り替え** - Large / Medium / Small の3段階

### AI機能（Claude 3.5 Haiku）

- **AI要約** - ブックマークのページ内容を2〜3文に自動要約、DBにキャッシュして2回目以降は即表示
- **AIタグ提案** - タイトル・説明を元にタグを3〜5個提案、既存タグを優先的に再利用
- **レート制限** - 要約: 20回/日、タグ提案: 50回/日（ユーザーごと）

### タグ管理

- **カラータグ** - 10色のプリセットカラーでタグを作成
- **タグCRUD** - 追加・編集（インライン）・削除
- **タグフィルター** - 複数タグを選択してブックマークを絞り込み
- **ブックマーク紐付け件数** - 各タグに紐づくブックマーク数を表示

### RSSフィード

- **フィード登録** - RSS/AtomフィードのURLを登録（上限50件）
- **自動ブックマーク追加** - 新着記事を自動でブックマークに追加（重複排除付き）
- **手動同期 / CRON同期** - 手動での即座同期とCRONによる定期自動同期
- **一時停止 / 再開** - フィードごとに同期のON/OFF切り替え
- **自動停止** - エラー3回で自動停止、ステータス表示

### 認証・セキュリティ

- **ユーザー認証** - メールアドレス/パスワードによるサインアップ・ログイン
- **データ保護** - Supabase RLSによるユーザーごとのデータ分離
- **SSRF対策** - OGP取得・AI要約時にプライベートIPアドレスへのアクセスを防止（DNS解決+リダイレクト先検証）
- **レート制限** - OGP取得（20req/min/IP）、AI機能（ユーザーごと日次制限）
- **セキュリティヘッダー** - X-Frame-Options, X-Content-Type-Options, Referrer-Policy等

### UI/UX

- **レスポンシブ対応** - PC / タブレット / スマートフォン
- **ダークモード** - ライト/ダーク切り替え対応
- **楽観的UI** - CRUD操作を即座に反映、エラー時はスナップショットからロールバック
- **日本語UI** - エラーメッセージ含め全て日本語対応
- **トランジション** - ページ遷移・カードリスト表示にアニメーション
- **相対時間表示** - 「3分前」「2時間前」形式で直感的に表示

## 技術スタック

| カテゴリ | 技術 |
|----------|------|
| フレームワーク | Nuxt 4 / Vue 3 |
| 言語 | TypeScript |
| UI | Nuxt UI / Tailwind CSS 4 |
| バックエンド / DB | Supabase (PostgreSQL, Auth, RLS) |
| AI | Claude 3.5 Haiku (Anthropic SDK) |
| OGP取得 | metascraper |
| RSSパース | rss-parser |
| ドラッグ&ドロップ | vue-draggable-plus |
| バリデーション | Zod |
| テスト | Vitest / @nuxt/test-utils / Playwright |
| CI/CD | GitHub Actions |
| デプロイ | Vercel |
| ユーティリティ | VueUse |

## 技術的な意思決定

### Nuxt 4の採用

Nuxt 4は2025年にリリースされた最新メジャーバージョン。新しいディレクトリ構造（`app/`ディレクトリ）や互換性の変更点など、最新のエコシステムをキャッチアップする目的で採用。

### Composablesの責務分離（CQRSパターン）

ブックマーク・タグ・フィード操作のcomposablesは、CQRS（Command Query Responsibility Segregation）の考え方を参考に設計した。

**ブックマーク:**
- **`use-bookmark-query.ts`** - データの読み取り（検索・ページネーション・ソート・タグフィルター）
- **`use-bookmark-mutations.ts`** - データの書き込み（追加・更新・削除・並び替え + 楽観的UI）
- **`use-bookmarks.ts`** - 上記を統合するファサード

**タグ:**
- **`use-tag-query.ts`** - タグ一覧の取得（件数付き）
- **`use-tag-mutations.ts`** - タグのCRUD・ブックマーク紐付け同期
- **`use-tags.ts`** - 上記を統合するファサード

**フィード:**
- **`use-feed-query.ts`** - フィード一覧の取得
- **`use-feed-mutations.ts`** - フィードCRUD・同期・一時停止
- **`use-feeds.ts`** - 上記を統合するファサード

読み取りと書き込みでは要件が異なる（読み取りはリアクティブな依存関係の管理、書き込みは楽観的更新とロールバック）ため、分離することで各composableの責務を明確にし、テスタビリティを高めている。

### 楽観的UIの設計

全CRUD操作で楽観的UIを採用。操作直後に仮データでUIを更新し、サーバー応答後に正式データで差し替える。エラー時はスナップショットから即座にロールバックすることで、操作のストレスを最小限に抑えている。

### ドラッグ&ドロップの並び替え

`sort_order`カラムに中間値を割り当てる方式を採用。前後アイテムのsort_orderから中間値を計算し、ギャップが2未満になった場合は全アイテムを1000刻みで自動リバランスする。これにより、並び替えのたびに全レコードを更新する必要がなく、パフォーマンスを維持している。

## ディレクトリ構成

```
app/
├── assets/css/          # グローバルCSS
├── components/
│   ├── common/          # 共通コンポーネント
│   ├── features/
│   │   ├── bookmark/    # ブックマーク関連コンポーネント
│   │   ├── tag/         # タグ関連コンポーネント
│   │   └── feed/        # RSSフィード関連コンポーネント
│   └── pages/           # ページ固有コンポーネント
│       ├── auth/
│       ├── dashboard/
│       └── home/
├── composables/
│   ├── bookmark/       # ブックマーク (query / mutations / facade + UI)
│   ├── auth/           # 認証
│   ├── tag/            # タグ (query / mutations / facade + UI)
│   ├── feed/           # RSSフィード (query / mutations / facade)
│   ├── ai/             # AI機能 (要約 / タグ提案 / エラーハンドリング)
│   └── ui/             # UI共通ロジック (OGP, 相対時間, ページネーション等)
├── layouts/             # レイアウト (auth, dashboard, marketing)
├── pages/               # ルーティング
├── server/
│   ├── api/
│   │   ├── ogp/        # OGP取得エンドポイント
│   │   ├── ai/         # AI機能エンドポイント (要約 / タグ提案)
│   │   └── rss/        # RSSフィードエンドポイント (CRUD / 同期)
│   └── utils/          # サーバーユーティリティ (認証 / レート制限 / SSRF検証)
├── types/               # 型定義
└── utils/               # ユーティリティ (認証エラーi18n)
```

## セットアップ

### 前提条件

- Node.js 18+
- npm
- [Supabase](https://supabase.com/) プロジェクト
- [Anthropic API Key](https://console.anthropic.com/)（AI機能を使用する場合）

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

`.env.example` をコピーして `.env` を作成し、各種認証情報を設定する。

```bash
cp .env.example .env
```

```
NUXT_SUPABASE_URL=https://your-project.supabase.co
NUXT_SUPABASE_API_KEY=your-anon-key
NUXT_PUBLIC_SITE_URL=http://localhost:3000
ANTHROPIC_API_KEY=your-anthropic-api-key
```

### 4. Supabaseのテーブルを作成

Supabaseダッシュボードで `bookmarks`, `tags`, `bookmark_tags`, `rss_feeds` テーブルを作成し、RLS (Row Level Security) を有効化する。

### 5. 開発サーバーを起動

```bash
npm run dev
```

http://localhost:3000 でアクセスできる。

## スクリプト

| コマンド | 説明 |
|--------|------|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | プロダクションビルド |
| `npm run preview` | ビルドのプレビュー |
| `npm run lint` | ESLint実行 |
| `npm run lint:fix` | ESLint自動修正 |
| `npm run typecheck` | TypeScript型チェック |
| `npm run test` | ユニットテスト実行 |
| `npm run test:watch` | ユニットテスト（watchモード） |
| `npm run test:e2e` | E2Eテスト実行 |
| `npm run db:types` | Supabaseの型定義を再生成 |
| `npm run db:seed` | テストデータ投入 |
| `npm run db:push` | マイグレーション適用 |

## ライセンス

Private
