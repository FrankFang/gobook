package main

import (
	"context"
	"database/sql"
	_ "embed"
	"fmt"
	"gobook/db"
	"os"
	"path"

	_ "github.com/mattn/go-sqlite3"

	"github.com/google/uuid"
)

//go:embed db/schema.sql
var ddl string

var ctx = context.Background()

type Book struct {
	ID        string `json:"id"`
	Path      string `json:"path"`
	Name      string `json:"name"`
	CreatedAt string `json:"createdAt"`
	UpdatedAt string `json:"updatedAt"`
}
type Chapters []*Chapter
type Chapter struct {
	ID       string   `json:"id"`
	Level    int      `json:"-"`
	Name     string   `json:"name"`
	Content  string   `json:"content"`
	Parent   *Chapter `json:"-"`
	Children Chapters `json:"children"`
}

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// Greet returns a greeting for the given name
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}

func createQuery(filename string) (*db.Queries, error) {
	// 获取当前工作目录
	p, _ := os.Getwd()
	fullPath := path.Join(p, "gobook_data", filename)
	conn, err := sql.Open("sqlite3", fullPath)
	if err != nil {
		return nil, err
	}

	if _, err := conn.ExecContext(ctx, ddl); err != nil {
		return nil, err
	}

	return db.New(conn), nil
}

// Book API
// TODO: 改成并发
func (a *App) ListBooks() ([]db.Book, error) {
	p, err := os.Getwd()
	if err != nil {
		return nil, err
	}
	files, err := os.ReadDir(path.Join(p, "gobook_data"))
	if err != nil {
		return nil, err
	}
	var books []db.Book
	for _, file := range files {
		if file.IsDir() {
			continue
		}
		if path.Ext(file.Name()) != ".db" {
			continue
		}
		db, err := createQuery(file.Name())
		if err != nil {
			continue
		}
		book, err := db.GetFirstBook(ctx)
		if err != nil {
			continue
		}
		books = append(books, book)
	}
	return books, nil
}
func (a *App) CreateBook(name string) (db.Book, error) {
	filename := uuid.New().String() + ".db"
	q, err := createQuery(filename)
	if err != nil {
		panic(err)
	}
	b, err := q.CreateBook(ctx, name)
	if err != nil {
		panic(err)
	}
	return b, nil
}
