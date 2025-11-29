package repository

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/nikhilsahni7/typeMaster/backend/internal/models"
)

type MatchRepository struct {
	db *pgxpool.Pool
}

func NewMatchRepository(db *pgxpool.Pool) *MatchRepository {
	return &MatchRepository{db: db}
}

func (r *MatchRepository) CreateMatch(ctx context.Context, match *models.MatchResult) error {
	query := `
		INSERT INTO matches (
			user_id, wpm, raw_wpm, accuracy, consistency, error_count,
			mode, language, duration_seconds, bad_keys, improvement_needed
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
		RETURNING id, created_at
	`

	if match.BadKeys == "" {
		match.BadKeys = "{}"
	}

	var createdAt time.Time
	err := r.db.QueryRow(ctx, query,
		match.UserID, match.WPM, match.RawWPM, match.Accuracy,
		match.Consistency, match.ErrorCount, match.Mode, match.Language,
		match.Duration, match.BadKeys, match.ImprovementNeeded,
	).Scan(&match.ID, &createdAt)

	if err == nil {
		match.CreatedAt = createdAt.Format(time.RFC3339)
	}

	return err
}

func (r *MatchRepository) GetMatchesByUserID(ctx context.Context, userID string, limit int) ([]*models.MatchResult, error) {
	query := `
		SELECT id, user_id, wpm, raw_wpm, accuracy, consistency, error_count,
		       mode, language, duration_seconds, created_at, bad_keys, improvement_needed
		FROM matches
		WHERE user_id = $1
		ORDER BY created_at DESC
		LIMIT $2
	`

	rows, err := r.db.Query(ctx, query, userID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var matches []*models.MatchResult
	for rows.Next() {
		var m models.MatchResult
		var createdAt time.Time
		var badKeys, improvementNeeded []byte

		if err := rows.Scan(
			&m.ID, &m.UserID, &m.WPM, &m.RawWPM, &m.Accuracy,
			&m.Consistency, &m.ErrorCount, &m.Mode, &m.Language,
			&m.Duration, &createdAt, &badKeys, &improvementNeeded,
		); err != nil {
			return nil, err
		}
		m.CreatedAt = createdAt.Format(time.RFC3339)
		m.BadKeys = string(badKeys)
		m.ImprovementNeeded = string(improvementNeeded)
		matches = append(matches, &m)
	}
	return matches, nil
}
