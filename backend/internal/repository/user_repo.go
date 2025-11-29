package repository

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type UserRepository struct {
	db *pgxpool.Pool
}

func NewUserRepository(db *pgxpool.Pool) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) CreateGuest(ctx context.Context, id string, username string) error {
	query := `
		INSERT INTO users (id, username, is_guest, created_at, updated_at)
		VALUES ($1, $2, TRUE, $3, $3)
		ON CONFLICT (id) DO NOTHING
	`
	_, err := r.db.Exec(ctx, query, id, username, time.Now())
	return err
}

func (r *UserRepository) GetUser(ctx context.Context, id string) (string, error) {
	var username string
	query := `SELECT username FROM users WHERE id = $1`
	err := r.db.QueryRow(ctx, query, id).Scan(&username)
	return username, err
}
