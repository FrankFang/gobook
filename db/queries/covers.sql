-- name: CreateCover :one
INSERT INTO covers (book_id, slug)
VALUES (?, ?)
RETURNING *;

-- name: GetCoverBySlug :one
SELECT * FROM covers WHERE slug = ? AND deleted_at IS NULL;
