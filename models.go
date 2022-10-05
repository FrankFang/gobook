// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.15.0

package main

import (
	"time"
)

type Book struct {
	ID        int64      `json:"id"`
	Name      string     `json:"name"`
	Author    *string    `json:"author"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt *time.Time `json:"updated_at"`
	Summary   *string    `json:"summary"`
	DeletedAt *time.Time `json:"deleted_at"`
}

type Chapter struct {
	ID        int64      `json:"id"`
	Name      string     `json:"name"`
	BookID    int64      `json:"book_id"`
	Content   *string    `json:"content"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt *time.Time `json:"updated_at"`
	ParentID  int64      `json:"parent_id"`
	DeletedAt *time.Time `json:"deleted_at"`
}