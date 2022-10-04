// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.15.0
// source: books.sql

package db

import (
	"context"
)

const createBook = `-- name: CreateBook :one
INSERT INTO books (
  name
) VALUES (
  ?
)
RETURNING id, name, author, created_at, updated_at, summary
`

func (q *Queries) CreateBook(ctx context.Context, name string) (Book, error) {
	row := q.db.QueryRowContext(ctx, createBook, name)
	var i Book
	err := row.Scan(
		&i.ID,
		&i.Name,
		&i.Author,
		&i.CreatedAt,
		&i.UpdatedAt,
		&i.Summary,
	)
	return i, err
}

const listBooks = `-- name: ListBooks :many
SELECT id, name, author, created_at, updated_at, summary FROM books
ORDER BY id
LIMIT 10 OFFSET ?
`

func (q *Queries) ListBooks(ctx context.Context, offset int64) ([]Book, error) {
	rows, err := q.db.QueryContext(ctx, listBooks, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []Book
	for rows.Next() {
		var i Book
		if err := rows.Scan(
			&i.ID,
			&i.Name,
			&i.Author,
			&i.CreatedAt,
			&i.UpdatedAt,
			&i.Summary,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}
