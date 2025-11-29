package models

import "encoding/json"

// EventType defines the type of message being sent/received
type EventType string

const (
	EventJoinLobby    EventType = "join_lobby"
	EventLeaveLobby   EventType = "leave_lobby"
	EventChatMessage  EventType = "chat_message"
	EventTypingUpdate EventType = "typing_update"
	EventGameStart    EventType = "game_start"
	EventGameEnd      EventType = "game_end"
	EventError        EventType = "error"
)

// WSEvent is the standard wrapper for all WebSocket messages
type WSEvent struct {
	Type    EventType       `json:"type"`
	Payload json.RawMessage `json:"payload"`
}

// TypingPayload carries real-time game stats
type TypingPayload struct {
	UserID   string  `json:"user_id"`
	RoomID   string  `json:"room_id"`
	WPM      int     `json:"wpm"`
	Accuracy float64 `json:"accuracy"`
	Progress int     `json:"progress"` // 0-100%
}

// ChatPayload carries chat messages
type ChatPayload struct {
	UserID  string `json:"user_id"`
	RoomID  string `json:"room_id"`
	Message string `json:"message"`
}

// MatchResult represents the final stats of a completed game
type MatchResult struct {
	ID                string  `json:"id"`
	UserID            string  `json:"user_id"`
	WPM               int     `json:"wpm"`
	RawWPM            int     `json:"raw_wpm"`
	Accuracy          float64 `json:"accuracy"`
	Consistency       float64 `json:"consistency"`
	ErrorCount        int     `json:"error_count"`
	Mode              string  `json:"mode"`
	Language          string  `json:"language"`
	Duration          int     `json:"duration"`
	CreatedAt         string  `json:"created_at"`
	BadKeys           string  `json:"bad_keys"`           // JSON string
	ImprovementNeeded string  `json:"improvement_needed"` // Text description
}
