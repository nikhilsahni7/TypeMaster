package server

import (
	"fmt"
	"net/http"
	"time"

	"github.com/nikhilsahni7/typeMaster/backend/internal/database"
)

type Server struct {
	port int
	db   *database.Service
}

func NewServer() *http.Server {
	port := 8080

	db, err := database.New()
	if err != nil {
		fmt.Printf("cannot connect to database: %v\n", err)
	}

	s := &Server{
		port: port,
		db:   db,
	}

	server := &http.Server{
		Addr:         fmt.Sprintf(":%d", s.port),
		Handler:      s.RegisterRoutes(),
		IdleTimeout:  time.Minute,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 30 * time.Second,
	}

	return server
}
