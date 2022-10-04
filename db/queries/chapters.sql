-- name: ListChapters :many
SELECT * FROM chapters
WHERE book_id = ?
AND deleted_at IS NULL
ORDER BY id;

-- name: CreateChapter :one
INSERT INTO chapters (
  book_id,
  name,
  content
) VALUES (
  ?,
  ?,
  ?
)
RETURNING *;

-- name: DeleteChapter :exec
UPDATE chapters
SET deleted_at = date('now')
WHERE id = ?;

-- name: UpdateChapter :one
UPDATE chapters
SET name = coalesce(@name, name),
    content = coalesce(@content, content)
WHERE id = ?
RETURNING *;
