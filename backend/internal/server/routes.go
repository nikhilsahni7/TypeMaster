package server

import (
	"encoding/json"
	"net/http"
)

func (s *Server) RegisterRoutes() http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("/health", s.HealthHandler)

	return s.corsMiddleware(mux)
}

func (s *Server) HealthHandler(w http.ResponseWriter, r *http.Request) {
	health := map[string]string{
		"status":  "healthy",
		"message": "Type Master Backend is running",
	}

	if s.db != nil {
		if err := s.db.DB.Ping(r.Context()); err != nil {
			health["db_status"] = "unhealthy"
			health["db_error"] = err.Error()
		} else {
			health["db_status"] = "connected"
		}

		if err := s.db.Redis.Ping(r.Context()).Err(); err != nil {
			health["redis_status"] = "unhealthy"
			health["redis_error"] = err.Error()
		} else {
			health["redis_status"] = "connected"
		}
	} else {
		health["db_status"] = "not_initialized"
	}

	jsonResp, _ := json.Marshal(health)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write(jsonResp)
}

func (s *Server) corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}
