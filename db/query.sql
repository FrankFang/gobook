-- name: CreateBook :one
INSERT INTO books (
  name
) VALUES (
  ?
)
RETURNING *;


-- name: GetFirstBook :one
SELECT * FROM books LIMIT 1;
