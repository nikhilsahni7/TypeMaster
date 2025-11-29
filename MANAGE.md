# Application Management

## Stopping the Application
To stop all running services (Frontend, Backend, Database, Redis):
```bash
docker compose down
```
*Note: This stops and removes the containers, but your data in the database volume is preserved.*

## Starting the Application
To start the application again:
```bash
docker compose up -d
```
* The `-d` flag runs the containers in the background.
* The frontend will be available at `http://localhost:5173`.
* The backend will be available at `http://localhost:8080`.

## Viewing Logs
To view logs for all services:
```bash
docker compose logs -f
```
To view logs for a specific service (e.g., backend):
```bash
docker compose logs -f backend
```
