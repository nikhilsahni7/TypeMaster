package repository

import (
	"context"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"
)

type RedisCache struct {
	client *redis.Client
}

func NewRedisCache(client *redis.Client) *RedisCache {
	return &RedisCache{
		client: client,
	}
}

// UpdateLeaderboard adds a user's score to the leaderboard
func (c *RedisCache) UpdateLeaderboard(ctx context.Context, userID string, username string, wpm int) error {
	// Member format: "username:userID" to avoid extra lookups
	member := fmt.Sprintf("%s:%s", username, userID)

	// ZADD updates the score if member exists, or adds new member
	err := c.client.ZAdd(ctx, "leaderboard:global", redis.Z{
		Score:  float64(wpm),
		Member: member,
	}).Err()

	return err
}

// GetTopPlayers returns the top N players from the leaderboard
func (c *RedisCache) GetTopPlayers(ctx context.Context, limit int64) ([]string, error) {
	// ZREVRANGE returns elements from high to low scores
	result, err := c.client.ZRevRange(ctx, "leaderboard:global", 0, limit-1).Result()
	return result, err
}

// CacheMatchHistory caches the recent match history for a user to reduce DB load
func (c *RedisCache) CacheMatchHistory(ctx context.Context, userID string, historyJSON []byte) error {
	key := fmt.Sprintf("history:%s", userID)
	return c.client.Set(ctx, key, historyJSON, 5*time.Minute).Err()
}

// GetCachedMatchHistory retrieves cached history
func (c *RedisCache) GetCachedMatchHistory(ctx context.Context, userID string) (string, error) {
	key := fmt.Sprintf("history:%s", userID)
	return c.client.Get(ctx, key).Result()
}
