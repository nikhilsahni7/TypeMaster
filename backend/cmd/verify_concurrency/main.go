package main

import (
	"log"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

const (
	url     = "ws://localhost:8080/ws"
	clients = 50 // Simulate 50 concurrent clients
)

func main() {
	var wg sync.WaitGroup
	wg.Add(clients)

	for i := 0; i < clients; i++ {
		go func(id int) {
			defer wg.Done()
			c, _, err := websocket.DefaultDialer.Dial(url, nil)
			if err != nil {
				log.Printf("Client %d failed to connect: %v", id, err)
				return
			}
			defer c.Close()

			// Join Lobby
			joinMsg := map[string]interface{}{
				"type": "join_lobby",
				"payload": map[string]string{
					"room_id": "global_arena",
					"user_id": "test_user",
				},
			}
			if err := c.WriteJSON(joinMsg); err != nil {
				log.Printf("Client %d failed to join: %v", id, err)
				return
			}

			// Simulate typing updates
			for j := 0; j < 5; j++ {
				updateMsg := map[string]interface{}{
					"type": "typing_update",
					"payload": map[string]interface{}{
						"user_id":  "test_user",
						"wpm":      60 + j,
						"progress": j * 20,
					},
				}
				if err := c.WriteJSON(updateMsg); err != nil {
					log.Printf("Client %d failed to send update: %v", id, err)
					return
				}
				time.Sleep(100 * time.Millisecond)
			}
		}(i)
	}

	wg.Wait()
	log.Println("Concurrency test completed.")
}
