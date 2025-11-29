package server

import (
	"context"
	"encoding/json"
	"log"

	"github.com/nikhilsahni7/typeMaster/backend/internal/database"
	"github.com/nikhilsahni7/typeMaster/backend/internal/handlers"
	"github.com/nikhilsahni7/typeMaster/backend/internal/models"
	"github.com/redis/go-redis/v9"
)

// Hub maintains the set of active clients and broadcasts messages to the
// clients.
type Hub struct {
	clients    map[*Client]bool
	broadcast  chan []byte
	register   chan *Client
	unregister chan *Client
	redis      *redis.Client
	handler    *handlers.Handler
}

func NewHub(db *database.Service, handler *handlers.Handler) *Hub {
	return &Hub{
		broadcast:  make(chan []byte),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		clients:    make(map[*Client]bool),
		redis:      db.Redis,
		handler:    handler,
	}
}

func (h *Hub) Run() {
	pubsub := h.redis.Subscribe(context.Background(), "global_broadcast")
	ch := pubsub.Channel()

	go func() {
		for msg := range ch {
			h.broadcast <- []byte(msg.Payload)
		}
	}()

	for {
		select {
		case client := <-h.register:
			h.clients[client] = true
		case client := <-h.unregister:
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
			}
		case message := <-h.broadcast:
			for client := range h.clients {
				select {
				case client.send <- message:
				default:
					close(client.send)
					delete(h.clients, client)
				}
			}
		}
	}
}

// PublishToRedis sends a message to all other server instances
func (h *Hub) PublishToRedis(event models.WSEvent) {
	data, err := json.Marshal(event)
	if err != nil {
		log.Printf("Error marshaling event for redis: %v", err)
		return
	}
	h.redis.Publish(context.Background(), "global_broadcast", data)
}
