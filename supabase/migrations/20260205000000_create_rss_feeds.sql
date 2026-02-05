-- RSSフィード管理テーブル
CREATE TABLE public.rss_feeds (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  url             TEXT NOT NULL,
  title           TEXT,
  description     TEXT,
  site_url        TEXT,
  last_fetched_at TIMESTAMPTZ,
  last_error      TEXT,
  error_count     INTEGER NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT rss_feeds_user_url_unique UNIQUE (user_id, url)
);

ALTER TABLE public.rss_feeds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own feeds"
  ON public.rss_feeds FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_rss_feeds_user_active ON public.rss_feeds(user_id, is_active);

-- bookmarksテーブルにrss_feed_id列を追加
ALTER TABLE public.bookmarks
  ADD COLUMN rss_feed_id UUID REFERENCES public.rss_feeds(id) ON DELETE SET NULL;

CREATE INDEX idx_bookmarks_rss_feed_id ON public.bookmarks(rss_feed_id);
CREATE INDEX idx_bookmarks_url_user ON public.bookmarks(url, user_id);

-- updated_at 自動更新トリガー
CREATE OR REPLACE FUNCTION public.update_rss_feeds_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_rss_feeds_updated_at
  BEFORE UPDATE ON public.rss_feeds
  FOR EACH ROW
  EXECUTE FUNCTION public.update_rss_feeds_updated_at();
