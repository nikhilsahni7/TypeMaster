ate a # 🚀 Master Deployment Guide: Bun (Backend) + Next.js (Frontend) + Jenkins

This guide covers the complete end-to-end deployment pipeline for a modern web stack, customized for **cheatcoder.nikhilsahni.xyz**.

## 🏗️ The Stack
-   **Backend**: Node.js / TypeScript (Running on **Bun**)
-   **Frontend**: Next.js (React)
-   **Database**: PostgreSQL (Managed/Outsourced e.g., Aiven, Supabase)
-   **Infrastructure**: Docker (Multi-stage builds), Nginx (Reverse Proxy)
-   **CI/CD**: Jenkins (Automated Pipeline)
-   **Domain**: `cheatcoder.nikhilsahni.xyz`
-   **Ports**: Frontend (`3015`), Backend (`8087`)

---

## 1. Dockerization (Optimized Multi-Stage Builds)

We use **multi-stage builds** to keep images tiny. We build in one stage and copy only the artifacts to the final stage.

### A. Backend Dockerfile ([backend/Dockerfile](file:///home/nikhil-sahni/Coding/typeMaster/backend/Dockerfile))
Using `oven/bun` for extreme speed and small size.

```dockerfile
# Stage 1: Builder
FROM oven/bun:1 as builder
WORKDIR /app

# Install dependencies (cached if package.json hasn't changed)
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Copy source and build (if using a build step like tsc)
COPY . .
# RUN bun run build  <-- Uncomment if you have a build step

# Stage 2: Production Runner
FROM oven/bun:1-slim
WORKDIR /app

# Copy only necessary files
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/package.json ./

# Environment variables
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080
CMD ["bun", "run", "src/index.ts"]
```

### B. Frontend Dockerfile ([frontend/Dockerfile](file:///home/nikhil-sahni/Coding/typeMaster/frontend/Dockerfile))
Using Next.js **Standalone Mode** to reduce image size from >1GB to ~100MB.

**Prerequisite**: Update `next.config.js`:
```javascript
module.exports = {
  output: 'standalone',
}
```

**The Dockerfile**:
```dockerfile
# Stage 1: Builder
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Inject API URL at build time (or use public env vars)
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build

# Stage 2: Runner
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy standalone build
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

### C. Production Compose ([docker-compose.prod.yml](file:///home/nikhil-sahni/Coding/typeMaster/docker-compose.prod.yml))
Orchestrates the services with custom port mappings.

```yaml
services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    restart: always
    ports:
      - "8087:8080" # Host Port 8087 -> Container Port 8080
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - PORT=8080
    networks:
      - app-network
    dns:
      - 8.8.8.8  # Force Google DNS for Aiven/Supabase resolution

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        - NEXT_PUBLIC_API_URL=/api
    restart: always
    ports:
      - "3015:3000" # Host Port 3015 -> Container Port 3000
    networks:
      - app-network

networks:
  app-network:
    driver: bridge
```

---

## 2. Jenkins CI/CD Pipeline

### A. Jenkinsfile
Create a [Jenkinsfile](file:///home/nikhil-sahni/Coding/typeMaster/Jenkinsfile) in the root of your repo.

```groovy
pipeline {
    agent any

    environment {
        // Credentials from Jenkins
        DATABASE_URL = credentials('DATABASE_URL')
    }

    stages {
        stage('Build & Test') {
            steps {
                sh "docker compose -f docker-compose.prod.yml build"
            }
        }

        stage('Deploy') {
            steps {
                // Restart containers with new code
                sh "docker compose -f docker-compose.prod.yml up -d"
                sh "docker system prune -f" // Cleanup
            }
        }
    }
}
```

### B. Jenkins Setup
1.  **Credentials**: Go to *Manage Jenkins -> Credentials*. Add a "Secret Text" for `DATABASE_URL` (your Aiven/Supabase connection string).
2.  **Job**: Create a "Pipeline" job. Point it to your GitHub repo.
3.  **Webhook**:
    -   **Jenkins**: Enable "GitHub hook trigger for GITScm polling".
    -   **GitHub**: Add Webhook -> `http://YOUR_VPS_IP:8080/github-webhook/`.

---

## 3. VPS & Nginx Setup (The Live Site)

We use Nginx on the VPS to handle the domain, SSL, and routing to your custom ports.

### A. Nginx Config
File: `/etc/nginx/sites-available/cheatcoder`

```nginx
server {
    listen 80;
    server_name cheatcoder.nikhilsahni.xyz;

    # Frontend (Next.js) -> Port 3015
    location / {
        proxy_pass http://localhost:3015;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }

    # Backend API (Bun) -> Port 8087
    location /api/ {
        # Proxy requests to the Backend running on port 8087
        proxy_pass http://localhost:8087/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}
```

### B. SSL (HTTPS)
```bash
sudo certbot --nginx -d cheatcoder.nikhilsahni.xyz
```

---

## 4. Summary of Workflow

1.  **Code**: You write code and `git push`.
2.  **Trigger**: GitHub sends a webhook to Jenkins.
3.  **Build**: Jenkins pulls code, builds optimized Docker images.
4.  **Deploy**: Jenkins restarts containers on ports **3015** (Frontend) and **8087** (Backend).
5.  **Live**: Nginx serves the new version at `https://cheatcoder.nikhilsahni.xyz`.

### Key Optimizations Used
1.  **Bun**: Faster startup and smaller footprint for backend.
2.  **Next.js Standalone**: Reduces frontend image size by ~90%.
3.  **Google DNS**: Ensures managed DBs (Aiven) resolve correctly.
4.  **Jenkins Credentials**: Keeps secrets out of code.

---

## 5. Backend Code Example (src/index.ts)

Since Nginx strips the `/api` prefix (due to the trailing slash in `proxy_pass`), your backend code should define routes **starting from root (`/`)**.

We recommend using **Hono** (optimized for Bun) or Express.

### Example using Hono (Recommended for Bun)
```typescript
import { Hono } from 'hono'
import { logger } from 'hono/logger'

const app = new Hono()

app.use('*', logger())

// Health Check (Accessed via https://cheatcoder.nikhilsahni.xyz/api/health)
app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  })
})

// User Route (Accessed via https://cheatcoder.nikhilsahni.xyz/api/users)
app.get('/users', (c) => {
  return c.json([
    { id: 1, name: 'Nikhil' },
    { id: 2, name: 'CheatCoder' }
  ])
})

const port = parseInt(process.env.PORT || '8080')
console.log(`Server running on port ${port}`)

export default {
  port,
  fetch: app.fetch,
}
```

### Important Note on Routing
*   **Browser URL**: `https://cheatcoder.nikhilsahni.xyz/api/health`
*   **Nginx**: Sees `/api/health`, strips `/api`, sends `/health` to backend.
*   **Backend Code**: Listens for `/health`.

**Do NOT** wrap your routes in a router like `app.route('/api')`. Nginx handles that for you!
