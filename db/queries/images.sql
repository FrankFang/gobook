-- name: CreateImage :one
INSERT INTO images (book_id, chapter_id, slug)
VALUES (?, ?, ?)
RETURNING *;

-- name: ListImagesForBook :many
SELECT * FROM images
WHERE book_id = ?
AND deleted_at IS NULL
ORDER BY id;

-- name: GetImageBySlug :one
SELECT * FROM images
WHERE slug = ?
AND deleted_at IS NULL;
