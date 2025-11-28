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
		// In production, you might want to retry or fail harder,
		// but for now logging is fine as we might run without DB locally sometimes
		fmt.Printf("Warning: Could not connect to database: %v\n", err)
	}

	NewServer := &Server{
		port: port,
		db:   db,
	}

	// Declare Server config
	server := &http.Server{
		Addr:         fmt.Sprintf(":%d", NewServer.port),
		Handler:      NewServer.RegisterRoutes(),
		IdleTimeout:  time.Minute,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 30 * time.Second,
	}

	return server
}
