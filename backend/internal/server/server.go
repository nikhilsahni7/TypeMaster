package server

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	_ "github.com/joho/godotenv/autoload"
	"github.com/nikhilsahni7/typeMaster/backend/internal/database"
	"github.com/nikhilsahni7/typeMaster/backend/internal/handlers"
	"github.com/nikhilsahni7/typeMaster/backend/internal/repository"
)

type Server struct {
	port      int
	db        *database.Service
	hub       *Hub
	matchRepo *repository.MatchRepository
}

func NewServer() *http.Server {
	port := 8080

	db, err := database.New()
	if err != nil {
		log.Fatalf("cannot connect to database: %v\n", err)
	}

	matchRepo := repository.NewMatchRepository(db.DB)
	userRepo := repository.NewUserRepository(db.DB)
	redisCache := repository.NewRedisCache(db.Redis)
	handler := handlers.NewHandler(matchRepo, userRepo, redisCache)

	hub := NewHub(db, handler)
	go hub.Run()

	s := &Server{
		port:      port,
		db:        db,
		hub:       hub,
		matchRepo: matchRepo,
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

func (s *Server) handleGetHistory(w http.ResponseWriter, r *http.Request) {
	userID := r.URL.Query().Get("user_id")
	if userID == "" {
		http.Error(w, "user_id is required", http.StatusBadRequest)
		return
	}

	matches, err := s.matchRepo.GetMatchesByUserID(r.Context(), userID, 50)
	if err != nil {
		http.Error(w, "failed to fetch history", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(matches)
}
