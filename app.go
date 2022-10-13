package main

import (
	"bytes"
	"context"
	"database/sql"
	_ "embed"
	"errors"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"

	epub "github.com/bmaupin/go-epub"
	"github.com/google/uuid"
	_ "github.com/mattn/go-sqlite3"
	cp "github.com/otiai10/copy"
	"github.com/skratchdot/open-golang/open"
	"github.com/vincent-petithory/dataurl"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"github.com/yuin/goldmark"
	"github.com/yuin/goldmark/extension"
	"github.com/yuin/goldmark/parser"
	"github.com/yuin/goldmark/renderer/html"
	"golang.org/x/exp/slices"
)

type BookWithChapters struct {
	Book
	Chapters []Chapter `json:"chapters"`
}

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
		Content: Ptr(""),
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
	if c.ParentID == nil {
		c.ParentID = new(int64)
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

func (a *App) UploadImage(bookId, chapterId int64, url string) (string, error) {
	d, err := dataurl.DecodeString(url)
	if err != nil {
		log.Fatalln(err)
	}
	if d.MediaType.Type == "image" {
		fmt.Println("image")
	}
	p, err := os.Getwd()
	if err != nil {
		log.Fatalln(err)
	}
	dir := filepath.Join(p, "gobook_data", fmt.Sprintf("book_%d", bookId), "images")
	err = os.MkdirAll(dir, 0755)
	if err != nil {
		log.Fatalln(err)
	}
	filename := uuid.NewString() + "." + d.Subtype
	err = os.WriteFile(filepath.Join(dir, filename), d.Data, 0644)
	if err != nil {
		log.Fatalln(err)
	}
	q, _, err := createQuery("books.db")
	if err != nil {
		log.Fatalln(err)
	}
	img, err := q.CreateImage(ctx, CreateImageParams{
		BookID:    &bookId,
		ChapterID: &chapterId,
		Slug:      &filename,
	})
	if err != nil {
		log.Fatalln(err)
	}
	return "images/" + *img.Slug, nil
}

func newMd() goldmark.Markdown {
	md := goldmark.New(
		goldmark.WithExtensions(extension.GFM, extension.CJK),
		goldmark.WithParserOptions(
			parser.WithAutoHeadingID(),
		),
		goldmark.WithRendererOptions(
			html.WithHardWraps(),
			html.WithXHTML(),
		),
	)
	return md
}

func (a *App) RenderMarkdown(source string) (string, error) {
	ctx := parser.NewContext(parser.WithIDs(&myIDs{}))
	var buf bytes.Buffer
	if err := md.Convert([]byte(source), &buf, parser.WithContext(ctx)); err != nil {
		log.Fatalln(err)
	}
	return buf.String(), nil
}

func (a *App) SelectCover(bookId int64) (string, error) {
	cover, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "选择封面",
		Filters: []runtime.FileFilter{
			{DisplayName: "图片", Pattern: "*.png;*.jpg;*.jpeg;"},
		},
	})
	if err != nil {
		log.Fatalln(err)
	}
	if cover == "" {
		return "", errors.New("no cover selected")
	}
	ext := filepath.Ext(cover)
	bytes, err := os.ReadFile(cover)
	if err != nil {
		log.Fatalln(err)
	}
	p, _ := os.Getwd()
	dir := filepath.Join(p, "gobook_data", fmt.Sprintf("book_%d", bookId), "covers")
	err = os.MkdirAll(dir, 0755)
	if err != nil {
		log.Fatalln(err)
	}
	filename := uuid.NewString() + ext
	err = os.WriteFile(filepath.Join(dir, filename), bytes, 0644)
	if err != nil {
		log.Fatalln(err)
	}
	q, _, err := createQuery("books.db")
	if err != nil {
		log.Fatalln(err)
	}
	c, err := q.CreateCover(ctx, CreateCoverParams{
		BookID: &bookId,
		Slug:   &filename,
	})
	if err != nil {
		log.Fatalln(err)
	}
	return "covers/" + *c.Slug, nil
}

type ChapterTreeNode struct {
	Chapter
	Children []*ChapterTreeNode `json:"children"`
}

func findNodeByID(id int64, nodes []*ChapterTreeNode) *ChapterTreeNode {
	for i := range nodes {
		if nodes[i].ID == id {
			return nodes[i]
		}
		if len(nodes[i].Children) > 0 {
			node := findNodeByID(id, nodes[i].Children)
			if node != nil {
				return node
			}
		}
	}
	return nil
}

func chapters2Trees(chapters []Chapter) []*ChapterTreeNode {
	trees := make([]*ChapterTreeNode, 0, len(chapters))
	nodeCache := make(map[int64]*ChapterTreeNode)
	futureChildren := make(map[int64][]*ChapterTreeNode)
	clone := slices.Clone(chapters)
	for chapter := range clone {
		node := ChapterTreeNode{
			Chapter:  chapters[chapter],
			Children: make([]*ChapterTreeNode, 0),
		}
		nodeCache[node.ID] = &node
		if node.ParentID == nil || *node.ParentID == 0 {
			trees = append(trees, &node)
		}
		parent, has := nodeCache[*node.ParentID]
		if has {
			parent.Children = append(parent.Children, &node)
		} else {
			futureChildren[*node.ParentID] = append(futureChildren[*node.ParentID], &node)
		}

		children, has := futureChildren[node.ID]
		if has {
			node.Children = append(node.Children, children...)
		}
	}
	return trees
}

func sortTrees(trees []*ChapterTreeNode) []*ChapterTreeNode {
	sort.Slice(trees, func(i, j int) bool {
		return *trees[i].Sequence < *trees[j].Sequence
	})
	for i := range trees {
		trees[i].Children = sortTrees(trees[i].Children)
	}
	return trees
}

type traverseCallbackParams struct {
	current *ChapterTreeNode
	index   int
	parents []int
	prev    *ChapterTreeNode
	next    *ChapterTreeNode
	parent  *ChapterTreeNode
}

func traverseTrees(trees []*ChapterTreeNode, parent *ChapterTreeNode, parents []int, fn func(params traverseCallbackParams)) {
	for i := range trees {
		var prev *ChapterTreeNode
		if i > 0 {
			prev = trees[i-1]
		}
		var next *ChapterTreeNode
		if i < len(trees)-1 {
			next = trees[i+1]
		}
		fn(traverseCallbackParams{
			current: trees[i],
			index:   i,
			parents: parents,
			prev:    prev,
			next:    next,
			parent:  parent,
		})
		if len(trees[i].Children) > 0 {
			newParents := append(parents, i)
			traverseTrees(trees[i].Children, trees[i], newParents, fn)
		}
	}
}
func generatePrefix(i int, parents []int) string {
	prefix := fmt.Sprintf("%d", i+1)
	for _, parent := range parents {
		prefix = fmt.Sprintf("%d.%s", parent+1, prefix)
	}
	return prefix
}
func (a *App) PublishBook(bookId int64, format []string, author, summary, cover string) error {
	q, _, err := createQuery("books.db")
	if err != nil {
		log.Fatalln(err)
	}
	book, err := q.UpdateBook(ctx, UpdateBookParams{
		ID:      bookId,
		Summary: &summary,
		Cover:   &cover,
		Author:  &author,
	})
	if err != nil {
		log.Fatalln(err)
	}
	chapters, err := q.ListChapters(ctx, &bookId)
	if err != nil {
		log.Fatalln(err)
	}
	trees := chapters2Trees(chapters)
	sortTrees(trees)
	p, _ := os.Getwd()
	outputDir := filepath.Join(p, "gobook_data", fmt.Sprintf("book_%d_output", book.ID), *book.Name)
	err = os.MkdirAll(outputDir, 0755)
	if err != nil {
		log.Fatalln(err)
	}
	fromDir := filepath.Join(p, "gobook_data", fmt.Sprintf("book_%d", book.ID))
	// 如果 params.format 中包含 markdown，则生成 markdown
	if true {
		// 首先用 book 信息创建 index.md
		sb := strings.Builder{}
		sb.WriteString(fmt.Sprintf("# %s \n\n", *book.Name))
		sb.WriteString(fmt.Sprintf("%s \n\n", *book.Summary))
		sb.WriteString(fmt.Sprintf("![封面](%s)\n\n", *book.Cover))
		if len(chapters) > 0 {
			sb.WriteString("## 目录 \n\n")
		}
		traverseTrees(trees, nil, []int{}, func(params traverseCallbackParams) {
			prefix := generatePrefix(params.index, params.parents)
			sb.WriteString(strings.Repeat("    ", len(params.parents)) +
				fmt.Sprintf("%d. [%s](%s_%s.md)\n", params.index+1, *params.current.Name, prefix, *params.current.Name))
		})
		err = os.WriteFile(filepath.Join(outputDir, "0_index.md"), []byte(sb.String()), 0644)
		if err != nil {
			return err
		}
		traverseTrees(trees, nil, []int{}, func(params traverseCallbackParams) {
			chaptersDir := outputDir
			err := os.MkdirAll(chaptersDir, 0755)
			if err != nil {
				log.Fatalln(err)
			}
			prefix := generatePrefix(params.index, params.parents)
			p := filepath.Join(chaptersDir, fmt.Sprintf("%s_%s.md", prefix, *params.current.Name))
			sb := strings.Builder{}
			sb.WriteString(*params.current.Content)
			sb.WriteString("\n\n")
			if params.parent != nil {
				sb.WriteString(fmt.Sprintf("[返回](%s_%s.md)\n",
					generatePrefix(
						params.parents[len(params.parents)-1],
						params.parents[:len(params.parents)-1],
					),
					*params.parent.Name),
				)
			}
			if params.prev != nil && params.next == nil {
				sb.WriteString(fmt.Sprintf("[上一页](%s_%s.md)\n",
					generatePrefix(params.index-1, params.parents), *params.prev.Name))
			}
			if params.prev == nil && params.next != nil {
				sb.WriteString(fmt.Sprintf("[下一页](%s_%s.md)\n",
					generatePrefix(params.index+1, params.parents), *params.next.Name))
			}
			if params.prev != nil && params.next != nil {
				sb.WriteString(fmt.Sprintf("[上一页](%s_%s.md) [下一页](%s_%s.md)\n",
					generatePrefix(params.index-1, params.parents), *params.prev.Name,
					generatePrefix(params.index+1, params.parents), *params.next.Name))
			}
			err = os.WriteFile(p, []byte(sb.String()), 0644)
			if err != nil {
				log.Fatalln(err)
			}
		})
		err := cp.Copy(fromDir, outputDir)
		if err != nil {
			log.Fatalln(err)
		}
	}
	if false {
		e := epub.NewEpub(*book.Name)
		// Set the author
		e.SetAuthor(*book.Author)
		c, err := q.GetCoverByBookID(ctx, &book.ID)
		if err != nil {
			log.Fatalln(err)
		}
		coverPath := filepath.Join(fromDir, "covers", *c.Slug)
		ext := filepath.Ext(coverPath)
		epubCoverPath, err := e.AddImage(coverPath, "cover"+ext)
		if err != nil {
			log.Fatalln(err)
		}
		e.SetCover(epubCoverPath, "")
		e.SetDescription(*book.Summary)

		e.AddSection(fmt.Sprintf(`<img src="../images/%s"/>`, "cover"+ext), "封面", "cover.xhtml", "")
		e.AddSection(fmt.Sprintf(`<p>%s</p>`, *book.Summary), "简介", "summary.xhtml", "")

		images, err := q.ListImagesForBook(ctx, &book.ID)
		if err != nil {
			log.Fatalln(err)
		}
		for _, img := range images {
			imgPath := filepath.Join(fromDir, "images", *img.Slug)
			_, err := e.AddImage(imgPath, *img.Slug)
			if err != nil {
				log.Fatalln(err)
			}
		}

		addSectionToEpub(e, trees, 0, "")

		p := filepath.Join(outputDir, *book.Name+".epub")
		// Write the EPUB
		err = e.Write(p)
		if err != nil {
			log.Fatalln(err)
		}
	}
	open.Start(outputDir)
	return nil
}

var match = regexp.MustCompile(`!\[(.*?)\]\((images/.+?)\)`)
var md = newMd()

// helpers
func addSectionToEpub(e *epub.Epub, trees []*ChapterTreeNode, parentId int64, parentFilename string) {
	for _, node := range trees {
		content := match.ReplaceAllString(*node.Content, `![$1](../$2)`)
		var buf bytes.Buffer
		if err := md.Convert([]byte(content), &buf); err != nil {
			log.Fatalln(err)
		}
		body := buf.String()
		var filename string
		var err error
		filename, err = e.AddSubSection(parentFilename, body, *node.Name,
			fmt.Sprintf("%d_%s.xhtml", node.ID, *node.Name), "")
		if err != nil {
			log.Fatal(err)
		}
		if len(node.Children) > 0 {
			if parentFilename == "" {
				addSectionToEpub(e, node.Children, node.ID, filename)
			} else {
				addSectionToEpub(e, node.Children, node.ID, parentFilename)
			}
		}
	}
}
func Ptr[T any](v T) *T {
	return &v
}

func ResolveAsset(path string) ([]byte, error) {
	parts := strings.Split(path, "/")
	if len(parts) < 2 {
		return nil, fmt.Errorf("invalid path: %s", path)
	}
	q, _, err := createQuery("books.db")
	if err != nil {
		return nil, err
	}
	kind := parts[0]
	slug := parts[1]
	var b []byte
	switch kind {
	case "images":
		img, err := q.GetImageBySlug(ctx, &slug)
		if err != nil {
			return nil, err
		}
		imgDir := filepath.Join("gobook_data", fmt.Sprintf("book_%d", *img.BookID), "images")
		imgPath := filepath.Join(imgDir, *img.Slug)
		b, err = os.ReadFile(imgPath)
		if err != nil {
			return nil, err
		}
	case "covers":
		c, err := q.GetCoverBySlug(ctx, &slug)
		if err != nil {
			return nil, err
		}
		coverDir := filepath.Join("gobook_data", fmt.Sprintf("book_%d", *c.BookID), "covers")
		coverPath := filepath.Join(coverDir, *c.Slug)
		b, err = os.ReadFile(coverPath)
		if err != nil {
			return nil, err
		}
	}
	return b, nil
}
