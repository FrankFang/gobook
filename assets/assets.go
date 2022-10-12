package assets

import (
	"net/http"
	"strings"
)

type ResolverType = func(path string) ([]byte, error)
type FileLoader struct {
	http.Handler
	resolver ResolverType
}

func NewFileLoader(resolver ResolverType) *FileLoader {
	return &FileLoader{resolver: resolver}
}

func (h *FileLoader) ServeHTTP(res http.ResponseWriter, req *http.Request) {
	var err error
	fullPath := strings.TrimPrefix(req.URL.Path, "/")
	fileData, err := h.resolver(fullPath)
	if err != nil {
		res.WriteHeader(http.StatusNotFound)
	} else {
		res.Write(fileData)
	}
}
