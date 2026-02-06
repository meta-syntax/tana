-- sort_orderカラム追加
ALTER TABLE public.bookmarks ADD COLUMN sort_order integer;

-- 既存データにsort_orderを付与（user毎にcreated_at降順で1000刻み）
WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) * 1000 AS new_sort_order
  FROM public.bookmarks
)
UPDATE public.bookmarks b SET sort_order = r.new_sort_order FROM ranked r WHERE b.id = r.id;

-- NOT NULL制約 + デフォルト値 + インデックス
ALTER TABLE public.bookmarks ALTER COLUMN sort_order SET NOT NULL;
ALTER TABLE public.bookmarks ALTER COLUMN sort_order SET DEFAULT 0;
CREATE INDEX idx_bookmarks_user_sort_order ON public.bookmarks (user_id, sort_order ASC);
