-- 给 chapters 表删除 deleted_at 列
ALTER TABLE chapters
DROP COLUMN deleted_at;
