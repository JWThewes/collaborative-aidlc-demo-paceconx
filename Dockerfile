# Multi-stage Dockerfile for Filament Manager
# Stage 1: Build React frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Build Go backend with embedded frontend
FROM golang:1.21-alpine AS backend-builder

WORKDIR /app
COPY go.mod go.sum* ./
RUN go mod download
COPY . .
COPY --from=frontend-builder /app/frontend/build ./frontend/build
RUN CGO_ENABLED=1 GOOS=linux go build -a -installsuffix cgo -o filament-manager .

# Stage 3: Final runtime image
FROM alpine:latest

RUN apk --no-cache add ca-certificates sqlite-libs

WORKDIR /app

# Copy the compiled binary
COPY --from=backend-builder /app/filament-manager .

# Create data directory for SQLite database
RUN mkdir -p /app/data

# Expose port 8080
EXPOSE 8080

# Set environment variables
ENV PORT=8080
ENV DB_PATH=/app/data/filament.db

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Run the application
CMD ["./filament-manager"]
