package assets

import (
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

type FileLoader struct {
	http.Handler
}

func NewFileLoader() *FileLoader {
	return &FileLoader{}
}

func (h *FileLoader) ServeHTTP(res http.ResponseWriter, req *http.Request) {
	var err error
	requestedFilename := strings.TrimPrefix(req.URL.Path, "/")
	println("Requesting file:", requestedFilename)
	wd, _ := os.Getwd()
	p := filepath.Join(wd, "gobook_data", "images", requestedFilename)
	fileData, err := os.ReadFile(p)
	if err != nil {
		res.WriteHeader(http.StatusNotFound)
	} else {
		res.Write(fileData)
	}
}
