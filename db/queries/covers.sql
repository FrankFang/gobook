-- name: CreateCover :one
INSERT INTO covers (book_id, slug)
VALUES (?, ?)
RETURNING *;

-- name: GetCoverBySlug :one
SELECT * FROM covers WHERE slug = ? AND deleted_at IS NULL;

-- name: GetCoverByBookID :one
SELECT * FROM covers
WHERE book_id = ?
AND deleted_at IS NULL
ORDER BY created_at DESC
LIMIT 1;
