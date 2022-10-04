-- name: CreateBook :one
INSERT INTO books (
  name
) VALUES (
  ?
)
RETURNING *;


-- name: ListBooks :many
SELECT * FROM books
ORDER BY id
LIMIT 10 OFFSET ?;
