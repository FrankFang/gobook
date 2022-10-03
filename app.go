package main

import (
	"context"
	"fmt"
)

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
