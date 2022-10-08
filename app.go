package main

import (
	"context"
	"database/sql"
	_ "embed"
	"errors"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"

	"github.com/google/uuid"
	_ "github.com/mattn/go-sqlite3"
	"github.com/vincent-petithory/dataurl"
)

func init() {
	wd, err := os.Getwd()
	if err != nil {
		log.Fatalln(err)
	}
	p := filepath.Join(wd, "gobook.log")
	f, err := os.OpenFile(p, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
	if err != nil {
		log.Fatalf("error opening file: %v", err)
	}
	log.SetOutput(f)
}

//go:embed db/schema.sql
var ddl string

const sequenceStep = 128.0

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
	p, _ := os.Getwd()
	dir := filepath.Join(p, "gobook_data")
	if _, err := os.Stat(dir); os.IsNotExist(err) {
		os.Mkdir(dir, 0755)
	}
	fullPath := filepath.Join(dir, filename)
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
		log.Fatalln(err)
	}
	if err != nil {
		return Book{}, err
	}
	b, err := q.CreateBook(ctx, name)
	if err != nil {
		log.Fatalln(err)
	}
	if _, err = a.CreateChapter(CreateChapterParams{
		BookID:  &b.ID,
		Name:    Ptr("第一章"),
		Content: Ptr("请开始你的创作"),
	}); err != nil {
		log.Fatalln(err)
	}
	return b, nil
}
func (a *App) DeleteBook(id int64) error {
	q, sdb, err := createQuery("books.db")
	if err != nil {
		log.Fatalln(err)
	}
	tx, err := sdb.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()
	qtx := q.WithTx(tx)
	err = qtx.DeleteBook(ctx, id)
	if err != nil {
		log.Fatalln(err)
	}
	err = qtx.DeleteChapters(ctx, &id)
	if err != nil {
		log.Fatalln(err)
	}
	return tx.Commit()
}
func (a *App) GetBook(id int64) (Book, error) {
	q, _, err := createQuery("books.db")
	if err != nil {
		log.Fatalln(err)
	}
	b, err := q.GetBook(ctx, id)
	if err != nil {
		log.Fatalln(err)
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
		log.Fatalln(err)
	}
	b, err := q.GetBook(ctx, id)
	if err != nil {
		log.Fatalln(err)
	}
	bwc.Book = b
	chapters, err := q.ListChapters(ctx, &id)
	if err != nil {
		log.Fatalln(err)
	}
	bwc.Chapters = chapters
	return bwc, nil
}

// Chapter API
func (a *App) ListChapters(bookID int64) ([]Chapter, error) {
	q, _, err := createQuery("books.db")
	if err != nil {
		log.Fatalln(err)
	}
	chapters, err := q.ListChapters(ctx, &bookID)
	if err != nil {
		log.Fatalln(err)
	}
	return chapters, nil
}

func (a *App) UpdateChapter(u UpdateChapterParams) (Chapter, error) {
	q, _, err := createQuery("books.db")
	if err != nil {
		log.Fatalln(err)
	}
	chapter, err := q.UpdateChapter(ctx, u)
	if err != nil {
		log.Fatalln(err)
	}
	return chapter, nil
}
func getFloat(r any, fallback float64) float64 {
	if r == nil {
		return fallback
	}
	if rFloat, ok := r.(float64); ok {
		return rFloat
	}
	return fallback
}

// 获取小数的小数部分的长度
func getDecimalLength(f float64) int {
	s := fmt.Sprintf("%f", f)
	if i := strings.Index(s, "."); i >= 0 {
		return len(s) - i - 1
	}
	return 0
}

func (a *App) CreateChapter(c CreateChapterParams) (Chapter, error) {
	q, _, err := createQuery("books.db")
	if err != nil {
		log.Fatalln(err)
	}
	if c.Sequence == nil {
		r, err := q.CalcMaxSequence(ctx, CalcMaxSequenceParams{
			BookID:   c.BookID,
			ParentID: c.ParentID,
		})
		if err != nil {
			log.Fatalln(err)
		}
		max := getFloat(r, 0)
		c.Sequence = Ptr(max + sequenceStep)
	}
	if l := getDecimalLength(*c.Sequence); l > 5 {
		// TODO 对 sequence 进行重排
		chapters, err := q.ListChaptersWithParentID(ctx, ListChaptersWithParentIDParams{
			BookID:   c.BookID,
			ParentID: c.ParentID,
		})
		if err != nil {
			log.Fatalln(err)
		}
		for i, chapter := range chapters {
			chapter.Sequence = Ptr(float64(i + sequenceStep))
			_, err := q.UpdateChapter(ctx, UpdateChapterParams{
				Sequence: chapter.Sequence,
				ID:       chapter.ID,
			})
			if err != nil {
				log.Fatalln(err)
			}
		}
	}
	chapter, err := q.CreateChapter(ctx, c)
	if err != nil {
		log.Fatalln(err)
	}
	return chapter, nil
}

func (a *App) InsertChapterAfter(chapterID int64, c CreateChapterParams) (Chapter, error) {
	q, _, err := createQuery("books.db")
	if err != nil {
		log.Fatalln(err)
	}
	c1, err := q.GetChapter(ctx, chapterID)
	if err != nil {
		log.Fatalln(err)
	}
	bookID := c1.BookID
	seqs, err := q.CalcNextSequence(ctx, CalcNextSequenceParams{
		BookID:   bookID,
		ParentID: c1.ParentID,
		Sequence: c1.Sequence,
	})
	if err != nil {
		log.Fatalln(err)
	}
	var seq float64
	if len(seqs) > 0 {
		seq = (*c1.Sequence + *seqs[0]) / 2
	} else {
		seq = *c1.Sequence + sequenceStep
	}
	newChapter, err := a.CreateChapter(CreateChapterParams{
		BookID:   bookID,
		ParentID: c1.ParentID,
		Name:     c.Name,
		Content:  c.Content,
		Sequence: Ptr(seq),
	})
	if err != nil {
		log.Fatalln(err)
	}
	return newChapter, nil
}

const (
	InsertAfter int = iota
	InsertBefore
	Append
)

func (a *App) MoveChapter(t int, chapterId int64, targetId int64) (Chapter, error) {
	q, _, err := createQuery("books.db")
	if err != nil {
		log.Fatalln(err)
	}
	chapter, err := q.GetChapter(ctx, chapterId)
	if err != nil {
		log.Fatalln(err)
	}
	target, err := q.GetChapter(ctx, targetId)
	if err != nil {
		log.Fatalln(err)
	}
	if *chapter.BookID != *target.BookID {
		return Chapter{}, errors.New("chapter and target must be in the same book")
	}
	switch t {
	case Append:
		chapter.ParentID = &target.ID
		r, err := q.CalcMaxSequence(ctx, CalcMaxSequenceParams{
			BookID:   chapter.BookID,
			ParentID: chapter.ParentID,
		})
		if err != nil {
			log.Fatalln(err)
		}
		max := getFloat(r, 0)
		chapter.Sequence = Ptr(max + sequenceStep)
		newChapter, err := q.UpdateChapter(ctx, UpdateChapterParams{
			ID:       chapter.ID,
			Sequence: chapter.Sequence,
			ParentID: chapter.ParentID,
		})
		if err != nil {
			log.Fatalln(err)
		}
		return newChapter, nil
	case InsertAfter:
		chapter.ParentID = target.ParentID
		if chapter.ParentID == nil {
			chapter.ParentID = new(int64)
		}
		seqs, err := q.CalcNextSequence(ctx, CalcNextSequenceParams{
			BookID:   chapter.BookID,
			ParentID: chapter.ParentID,
			Sequence: target.Sequence,
		})
		if err != nil {
			log.Fatalln(err)
		}
		seq := 0.0
		if len(seqs) > 0 {
			seq = (*target.Sequence + *seqs[0]) / 2
		} else {
			seq = *target.Sequence + sequenceStep
		}
		chapter.Sequence = Ptr(seq)
		newChapter, err := q.UpdateChapter(ctx, UpdateChapterParams{
			ID:       chapter.ID,
			Sequence: chapter.Sequence,
			ParentID: chapter.ParentID,
		})
		if err != nil {
			log.Fatalln(err)
		}
		return newChapter, nil
	case InsertBefore:
		chapter.ParentID = target.ParentID
		if chapter.ParentID == nil {
			chapter.ParentID = new(int64)
		}
		seqs, err := q.CalcPrevSequence(ctx, CalcPrevSequenceParams{
			BookID:   chapter.BookID,
			ParentID: chapter.ParentID,
			Sequence: target.Sequence,
		})
		if err != nil {
			log.Fatalln(err)
		}
		seq := 0.0
		if len(seqs) > 0 {
			seq = (*target.Sequence + *seqs[0]) / 2
		} else {
			seq = *target.Sequence - sequenceStep
		}
		chapter.Sequence = Ptr(seq)
		newChapter, err := q.UpdateChapter(ctx, UpdateChapterParams{
			ID:       chapter.ID,
			Sequence: chapter.Sequence,
			ParentID: chapter.ParentID,
		})
		if err != nil {
			log.Fatalln(err)
		}
		return newChapter, nil
	}
	return Chapter{}, errors.New("unknown move type")
}

func (a *App) DeleteChapter(id int64) error {
	q, _, err := createQuery("books.db")
	if err != nil {
		log.Fatalln(err)
	}
	err = q.DeleteChapter(ctx, id)
	if err != nil {
		log.Fatalln(err)
	}
	return nil
}

func (a *App) GetChapter(id int64) (Chapter, error) {
	q, _, err := createQuery("books.db")
	if err != nil {
		log.Fatalln(err)
	}
	chapter, err := q.GetChapter(ctx, id)
	if err != nil {
		log.Fatalln(err)
	}
	return chapter, nil
}

func (a *App) UploadImage(url string) (string, error) {
	d, err := dataurl.DecodeString(url)
	if err != nil {
		log.Fatalln(err)
	}
	if d.MediaType.Type == "image" {
		fmt.Println("image")
	}
	// 将 dataURL.Data 保存到文件中
	p, err := os.Getwd()
	if err != nil {
		log.Fatalln(err)
	}
	dir := filepath.Join(p, "gobook_data", "images")
	err = os.MkdirAll(dir, 0755)
	if err != nil {
		log.Fatalln(err)
	}
	filename := uuid.NewString() + "." + d.Subtype
	err = os.WriteFile(filepath.Join(dir, filename), d.Data, 0644)
	if err != nil {
		log.Fatalln(err)
	}
	return filename, nil
}

// helpers
func Ptr[T any](v T) *T {
	return &v
}
