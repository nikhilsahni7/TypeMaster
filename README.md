# TypeMaster

TypeMaster is a high-performance, real-time typing speed test application built to handle live multiplayer competitions with zero lag.

## Architecture

The system is designed for concurrency and low latency:

- **Backend**: Go (Golang)
- **Frontend**: React + Vite
- **Database**: PostgreSQL (Persistent Storage)
- **Cache/PubSub**: Redis (Leaderboards & Live Match State)
- **Infrastructure**: Docker & Docker Compose

## Project Structure

- `backend/`: Go API server using standard library `net/http` and `pgx` for database interactions.
- `frontend/`: React application (Planned).
- `docker-compose.yml`: Orchestrates the local development environment (Postgres, Redis, Backend).

## Getting Started

### Prerequisites

- Docker & Docker Compose
- Go 1.22+ (for local development outside Docker)

### Running Locally

1. Start the infrastructure:
   ```bash
   docker compose up --build
   ```

2. The backend will be available at `http://localhost:8080`.
   - Health Check: `GET /health`

### Development

The backend is configured with **Air** for hot-reloading. Changes made to files in `backend/` will automatically rebuild and restart the server inside the container.
