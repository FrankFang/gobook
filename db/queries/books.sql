-- name: CreateBook :one
INSERT INTO books (
  name
) VALUES (
  ?
)
RETURNING *;


-- name: ListBooks :many
SELECT * FROM books
WHERE deleted_at IS NULL
ORDER BY id
LIMIT 10 OFFSET ?;

-- name: DeleteBook :exec
UPDATE books
SET deleted_at = date('now')
WHERE id = ?;

-- name: GetBook :one
SELECT * FROM books
WHERE id = ? AND deleted_at IS NULL;
