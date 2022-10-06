// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.15.0

package main

import (
	"time"
)

type Book struct {
	ID        int64      `json:"id"`
	Name      *string    `json:"name"`
	Author    *string    `json:"author"`
	Summary   *string    `json:"summary"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt *time.Time `json:"updated_at"`
	DeletedAt *time.Time `json:"deleted_at"`
}

type Chapter struct {
	ID        int64      `json:"id"`
	Name      *string    `json:"name"`
	BookID    *int64     `json:"book_id"`
	ParentID  *int64     `json:"parent_id"`
	Sequence  *float64   `json:"sequence"`
	Content   *string    `json:"content"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt *time.Time `json:"updated_at"`
	DeletedAt *time.Time `json:"deleted_at"`
}
