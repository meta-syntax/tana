-- ブックマークの並び替え関数
CREATE OR REPLACE FUNCTION reorder_bookmarks(p_user_id uuid, p_updates jsonb)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.bookmarks b
  SET sort_order = (item->>'sort_order')::integer, updated_at = now()
  FROM jsonb_array_elements(p_updates) AS item
  WHERE b.id = (item->>'id')::uuid AND b.user_id = p_user_id;
END;
$$;
