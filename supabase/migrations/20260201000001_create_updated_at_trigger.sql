-- updated_at を自動更新する関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガー設定
CREATE TRIGGER update_bookmarks_updated_at
  BEFORE UPDATE ON bookmarks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
