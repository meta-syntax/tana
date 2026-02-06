-- bookmarks テーブル
CREATE TABLE bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  title TEXT,
  description TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) を有効化
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のブックマークのみ閲覧可能
CREATE POLICY "Users can view their own bookmarks"
  ON bookmarks FOR SELECT
  USING (auth.uid() = user_id);

-- ユーザーは自分のブックマークを作成可能
CREATE POLICY "Users can create their own bookmarks"
  ON bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分のブックマークを更新可能
CREATE POLICY "Users can update their own bookmarks"
  ON bookmarks FOR UPDATE
  USING (auth.uid() = user_id);

-- ユーザーは自分のブックマークを削除可能
CREATE POLICY "Users can delete their own bookmarks"
  ON bookmarks FOR DELETE
  USING (auth.uid() = user_id);

-- インデックス作成（パフォーマンス向上）
CREATE INDEX bookmarks_user_id_idx ON bookmarks(user_id);
CREATE INDEX bookmarks_created_at_idx ON bookmarks(created_at DESC);
