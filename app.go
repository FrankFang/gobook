package main

import (
	"context"
	"database/sql"
	_ "embed"
	"fmt"
	"os"
	"path"

	_ "github.com/mattn/go-sqlite3"
)

//go:embed db/schema.sql
var ddl string

var ctx = context.Background()

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

func createQuery(filename string) (*Queries, *sql.DB, error) {
	// 获取当前工作目录
	p, _ := os.Getwd()
	fullPath := path.Join(p, "gobook_data", filename)
	sqlDB, err := sql.Open("sqlite3", fullPath)
	if err != nil {
		return nil, nil, err
	}

	if _, err := sqlDB.ExecContext(ctx, ddl); err != nil {
		return nil, nil, err
	}

	return New(sqlDB), sqlDB, nil
}

// Book API
func (a *App) ListBooks(page int64) ([]Book, error) {
	if page == 0 {
		page = 1
	}
	q, _, err := createQuery("books.db")
	if err != nil {
		return nil, err
	}
	books, err := q.ListBooks(ctx, (page-1)*10)
	if err != nil {
		return nil, err
	}
	return books, nil
}

func (a *App) CreateBook(name *string) (Book, error) {
	filename := "books.db"
	q, _, err := createQuery(filename)
	if err != nil {
		panic(err)
	}
	if err != nil {
		return Book{}, err
	}
	b, err := q.CreateBook(ctx, name)
	if err != nil {
		panic(err)
	}
	if _, err = a.CreateChapter(CreateChapterParams{
		BookID:  &b.ID,
		Name:    Ptr("第一章"),
		Content: Ptr("请开始你的创作"),
	}); err != nil {
		panic(err)
	}
	return b, nil
}
func (a *App) DeleteBook(id int64) error {
	q, _, err := createQuery("books.db")
	if err != nil {
		panic(err)
	}
	err = q.DeleteBook(ctx, id)
	if err != nil {
		panic(err)
	}
	return nil
}
func (a *App) GetBook(id int64) (Book, error) {
	q, _, err := createQuery("books.db")
	if err != nil {
		panic(err)
	}
	b, err := q.GetBook(ctx, id)
	if err != nil {
		panic(err)
	}
	return b, nil
}

type BookWithChapters struct {
	Book
	Chapters []Chapter `json:"chapters"`
}

func (a *App) GetBookWithChapters(id int64) (bwc BookWithChapters, err error) {
	q, _, err := createQuery("books.db")
	if err != nil {
		panic(err)
	}
	b, err := q.GetBook(ctx, id)
	if err != nil {
		panic(err)
	}
	bwc.Book = b
	chapters, err := q.ListChapters(ctx, &id)
	if err != nil {
		panic(err)
	}
	bwc.Chapters = chapters
	return bwc, nil
}

// Chapter API
func (a *App) ListChapters(bookID int64) ([]Chapter, error) {
	q, _, err := createQuery("books.db")
	if err != nil {
		panic(err)
	}
	chapters, err := q.ListChapters(ctx, &bookID)
	if err != nil {
		panic(err)
	}
	return chapters, nil
}

func (a *App) UpdateChapter(u UpdateChapterParams) (Chapter, error) {
	q, _, err := createQuery("books.db")
	if err != nil {
		panic(err)
	}
	chapter, err := q.UpdateChapter(ctx, u)
	if err != nil {
		panic(err)
	}
	return chapter, nil
}

func (a *App) CreateChapter(c CreateChapterParams) (Chapter, error) {
	q, _, err := createQuery("books.db")
	if err != nil {
		panic(err)
	}
	r, err := q.CalcMaxSequence(ctx, CalcMaxSequenceParams{
		BookID:   c.BookID,
		ParentID: c.ParentID,
	})
	if err != nil {
		panic(err)
	}
	max := 0.0
	if r != nil {
		if rFloat, ok := r.(float64); ok {
			max = rFloat
		}
	}
	c.Sequence = Ptr(max + 1)
	chapter, err := q.CreateChapter(ctx, c)
	if err != nil {
		panic(err)
	}
	return chapter, nil
}

func (a *App) InsertChapterAfter(chapterID int64, c CreateChapterParams) (Chapter, error) {
	q, _, err := createQuery("books.db")
	if err != nil {
		panic(err)
	}
	c1, err := q.GetChapter(ctx, chapterID)
	if err != nil {
		panic(err)
	}
	bookID := c1.BookID
	seqs, err := q.CalcNextSequence(ctx, CalcNextSequenceParams{
		BookID:   bookID,
		ParentID: c1.ParentID,
		Sequence: c1.Sequence,
	})
	if err != nil {
		panic(err)
	}
	seq := 0.0
	if len(seqs) > 0 {
		seq = (*c1.Sequence + *seqs[0]) / 2
	} else {
		seq = *c1.Sequence + 1.0
	}
	newChapter, err := a.CreateChapter(CreateChapterParams{
		BookID:   bookID,
		ParentID: c1.ParentID,
		Name:     c.Name,
		Content:  c.Content,
		Sequence: Ptr(seq),
	})
	if err != nil {
		panic(err)
	}
	return newChapter, nil
}

// helpers
func Ptr[T any](v T) *T {
	return &v
}
