-- name: ListChapters :many
SELECT * FROM chapters
WHERE book_id = ?
AND deleted_at IS NULL
ORDER BY id;

-- name: ListChaptersWithParentID :many
SELECT * FROM chapters
WHERE book_id = ?
AND parent_id = ?
AND deleted_at IS NULL
ORDER BY sequence;

-- name: GetChapter :one
SELECT * FROM chapters WHERE id = ? AND deleted_at IS NULL;

-- name: CalcMaxSequence :one
SELECT MAX(sequence) AS max_sequence FROM chapters
WHERE book_id = ? AND parent_id = ? AND deleted_at IS NULL;

-- name: CalcNextSequence :many
SELECT sequence FROM chapters
WHERE book_id = ? AND parent_id = ?  AND deleted_at IS NULL
AND sequence > ?
ORDER BY sequence
LIMIT 1;

-- name: CalcPrevSequence :many
SELECT sequence FROM chapters
WHERE book_id = ? AND parent_id = ?  AND deleted_at IS NULL
AND sequence < ?
ORDER BY sequence DESC
LIMIT 1;

-- name: CreateChapter :one
INSERT INTO chapters ( book_id, name, content, parent_id, sequence)
VALUES ( ?, ?, ?, ?, ?)
RETURNING *;

-- name: DeleteChapter :exec
UPDATE chapters
SET deleted_at = datetime('now')
WHERE id = ?;

-- name: DeleteChapters :exec
UPDATE chapters
SET deleted_at = datetime('now')
WHERE book_id = ?;

-- name: UpdateChapter :one
UPDATE chapters
SET name = coalesce(@name, name),
    sequence = coalesce(@sequence, sequence),
    content = coalesce(@content, content),
    parent_id = coalesce(@parent_id, parent_id)
WHERE id = ?
RETURNING *;

