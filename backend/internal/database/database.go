package database

import (
	"context"
	"crypto/tls"
	"fmt"
	"log"
	"os"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	_ "github.com/joho/godotenv/autoload"
	"github.com/redis/go-redis/v9"
)

type Service struct {
	DB    *pgxpool.Pool
	Redis *redis.Client
}

func New() (*Service, error) {
	db, err := connectToPostgres()
	if err != nil {
		return nil, err
	}

	rdb, err := connectToRedis()
	if err != nil {
		return nil, err
	}

	return &Service{
		DB:    db,
		Redis: rdb,
	}, nil
}

func connectToPostgres() (*pgxpool.Pool, error) {
	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	dbUser := os.Getenv("DB_USER")
	dbPassword := os.Getenv("DB_PASSWORD")
	dbName := os.Getenv("DB_NAME")

	// Supabase requires SSL
	connStr := fmt.Sprintf("postgres://%s:%s@%s:%s/%s?sslmode=require", dbUser, dbPassword, dbHost, dbPort, dbName)

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	config, err := pgxpool.ParseConfig(connStr)
	if err != nil {
		return nil, fmt.Errorf("unable to parse database config: %v", err)
	}

	pool, err := pgxpool.NewWithConfig(ctx, config)
	if err != nil {
		return nil, fmt.Errorf("unable to create connection pool: %v", err)
	}

	if err := pool.Ping(ctx); err != nil {
		return nil, fmt.Errorf("unable to connect to database: %v", err)
	}

	log.Println("Connected to PostgreSQL")
	return pool, nil
}

func connectToRedis() (*redis.Client, error) {
	redisAddr := os.Getenv("REDIS_ADDR")
	redisPassword := os.Getenv("REDIS_PASSWORD")

	if redisAddr == "" {
		redisAddr = "localhost:6379"
	}

	rdb := redis.NewClient(&redis.Options{
		Addr:     redisAddr,
		Password: redisPassword,
		// Upstash requires TLS
		TLSConfig: &tls.Config{
			MinVersion: tls.VersionTLS12,
		},
	})

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := rdb.Ping(ctx).Err(); err != nil {
		return nil, fmt.Errorf("unable to connect to redis: %v", err)
	}

	log.Println("Connected to Redis")
	return rdb, nil
}

func (s *Service) Close() {
	if s.DB != nil {
		s.DB.Close()
	}
	if s.Redis != nil {
		s.Redis.Close()
	}
}
