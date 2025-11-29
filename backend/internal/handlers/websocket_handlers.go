package handlers

import (
	"context"
	"encoding/json"
	"log"

	"github.com/nikhilsahni7/typeMaster/backend/internal/models"
	"github.com/nikhilsahni7/typeMaster/backend/internal/repository"
)

type Handler struct {
	MatchRepo  *repository.MatchRepository
	UserRepo   *repository.UserRepository
	RedisCache *repository.RedisCache
}

func NewHandler(matchRepo *repository.MatchRepository, userRepo *repository.UserRepository, redisCache *repository.RedisCache) *Handler {
	return &Handler{
		MatchRepo:  matchRepo,
		UserRepo:   userRepo,
		RedisCache: redisCache,
	}
}

// HandleEvent routes messages
func (h *Handler) HandleEvent(message []byte) {
	var event models.WSEvent
	if err := json.Unmarshal(message, &event); err != nil {
		log.Printf("Error unmarshaling event: %v", err)
		return
	}

	switch event.Type {
	case models.EventJoinLobby:
		h.handleJoinLobby(event.Payload)
	case models.EventTypingUpdate:
		h.handleTypingUpdate(event.Payload)
	case models.EventChatMessage:
		h.handleChatMessage(event.Payload)
	case models.EventGameEnd:
		h.handleGameEnd(event.Payload)
	default:
		log.Printf("Unknown event type: %s", event.Type)
	}
}

func (h *Handler) handleJoinLobby(payload json.RawMessage) {
	type JoinPayload struct {
		UserID   string `json:"user_id"`
		Username string `json:"username"`
		RoomID   string `json:"room_id"`
	}

	var p JoinPayload
	if err := json.Unmarshal(payload, &p); err != nil {
		log.Printf("Error unmarshaling join payload: %v", err)
		return
	}

	log.Printf("User %s joined lobby %s", p.UserID, p.RoomID)

	// Create guest if needed
	if p.UserID != "" {
		username := p.Username
		if username == "" {
			username = "Guest_" + p.UserID[:8]
		}

		err := h.UserRepo.CreateGuest(context.Background(), p.UserID, username)
		if err != nil {
			log.Printf("Failed to create guest user: %v", err)
		}
	}
}

func (h *Handler) handleTypingUpdate(payload json.RawMessage) {
	var p models.TypingPayload
	if err := json.Unmarshal(payload, &p); err != nil {
		return
	}
	log.Printf("User %s is at %d%% progress (WPM: %d)", p.UserID, p.Progress, p.WPM)
}

func (h *Handler) handleChatMessage(payload json.RawMessage) {
	var p models.ChatPayload
	if err := json.Unmarshal(payload, &p); err != nil {
		return
	}
	log.Printf("Chat from %s: %s", p.UserID, p.Message)
}

func (h *Handler) handleGameEnd(payload json.RawMessage) {
	var temp struct {
		UserID            string  `json:"user_id"`
		WPM               int     `json:"wpm"`
		RawWPM            int     `json:"raw_wpm"`
		Accuracy          float64 `json:"accuracy"`
		Consistency       float64 `json:"consistency"`
		ErrorCount        int     `json:"error_count"`
		Mode              string  `json:"mode"`
		Language          string  `json:"language"`
		Duration          int     `json:"duration"`
		BadKeys           any     `json:"bad_keys"`
		ImprovementNeeded string  `json:"improvement_needed"`
	}

	if err := json.Unmarshal(payload, &temp); err != nil {
		log.Printf("error parsing game end payload: %v", err)
		return
	}

	// Convert BadKeys to JSON string
	badKeysJSON := "{}"
	if temp.BadKeys != nil {
		bytes, err := json.Marshal(temp.BadKeys)
		if err == nil {
			badKeysJSON = string(bytes)
		}
	}

	match := &models.MatchResult{
		UserID:            temp.UserID,
		WPM:               temp.WPM,
		RawWPM:            temp.RawWPM,
		Accuracy:          temp.Accuracy,
		Consistency:       temp.Consistency,
		ErrorCount:        temp.ErrorCount,
		Mode:              temp.Mode,
		Language:          temp.Language,
		Duration:          temp.Duration,
		BadKeys:           badKeysJSON,
		ImprovementNeeded: temp.ImprovementNeeded,
	}

	log.Printf("Received game_end: WPM=%d, BadKeys=%s", match.WPM, match.BadKeys)

	err := h.MatchRepo.CreateMatch(context.Background(), match)
	if err != nil {
		log.Printf("Failed to save match result: %v", err)
		return
	}
	log.Printf("Match saved successfully! ID: %s", match.ID)

	// Update Leaderboard
	username, err := h.UserRepo.GetUser(context.Background(), match.UserID)
	if err == nil && username != "" {
		err = h.RedisCache.UpdateLeaderboard(context.Background(), match.UserID, username, match.WPM)
		if err != nil {
			log.Printf("Failed to update leaderboard: %v", err)
		} else {
			log.Printf("Leaderboard updated for %s with WPM %d", username, match.WPM)
		}
	}
}
