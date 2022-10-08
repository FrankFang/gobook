package main

import (
	"fmt"
	"strings"

	"github.com/mozillazg/go-pinyin"
	"github.com/yuin/goldmark/ast"
	"github.com/yuin/goldmark/util"
)

type myIDs struct {
	values map[string]bool
}

func (s *myIDs) Generate(value []byte, kind ast.NodeKind) []byte {
	if s.values == nil {
		s.values = make(map[string]bool)
	}
	result := strings.Join(pinyin.LazyPinyin(string(value), pinyin.NewArgs()), "-")
	if _, ok := s.values[result]; !ok {
		s.values[result] = true
		return []byte(result)
	}
	for i := 1; ; i++ {
		newResult := fmt.Sprintf("%s-%d", result, i)
		if _, ok := s.values[newResult]; !ok {
			s.values[newResult] = true
			return []byte(newResult)
		}

	}
}
func (s *myIDs) Put(value []byte) {
	s.values[util.BytesToReadOnlyString(value)] = true
}
