-- tags テーブル
CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3b82f6',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, name)
);
CREATE INDEX idx_tags_user_id ON public.tags(user_id);

-- bookmark_tags 中間テーブル
CREATE TABLE public.bookmark_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bookmark_id UUID NOT NULL REFERENCES public.bookmarks(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(bookmark_id, tag_id)
);
CREATE INDEX idx_bookmark_tags_bookmark_id ON public.bookmark_tags(bookmark_id);
CREATE INDEX idx_bookmark_tags_tag_id ON public.bookmark_tags(tag_id);

-- RLSポリシー: tags
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tags" ON public.tags
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tags" ON public.tags
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own tags" ON public.tags
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own tags" ON public.tags
  FOR DELETE USING (auth.uid() = user_id);

-- RLSポリシー: bookmark_tags
ALTER TABLE public.bookmark_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookmark_tags" ON public.bookmark_tags
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.bookmarks WHERE id = bookmark_id AND user_id = auth.uid())
  );
CREATE POLICY "Users can insert own bookmark_tags" ON public.bookmark_tags
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.bookmarks WHERE id = bookmark_id AND user_id = auth.uid())
  );
CREATE POLICY "Users can delete own bookmark_tags" ON public.bookmark_tags
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.bookmarks WHERE id = bookmark_id AND user_id = auth.uid())
  );
