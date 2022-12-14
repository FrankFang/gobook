// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.15.0

package main

import (
	"time"
)

type Book struct {
	ID           int64      `json:"id"`
	Name         *string    `json:"name"`
	Author       *string    `json:"author"`
	Summary      *string    `json:"summary"`
	Cover        *string    `json:"cover"`
	AfterPublish *string    `json:"after_publish"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    *time.Time `json:"updated_at"`
	DeletedAt    *time.Time `json:"deleted_at"`
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

type Cover struct {
	ID        int64      `json:"id"`
	BookID    *int64     `json:"book_id"`
	Slug      *string    `json:"slug"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt *time.Time `json:"updated_at"`
	DeletedAt *time.Time `json:"deleted_at"`
}

type Image struct {
	ID        int64      `json:"id"`
	BookID    *int64     `json:"book_id"`
	ChapterID *int64     `json:"chapter_id"`
	Slug      *string    `json:"slug"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt *time.Time `json:"updated_at"`
	DeletedAt *time.Time `json:"deleted_at"`
}
