# Filament Manager

A full-stack application for managing 3D printer filament inventory and usage tracking, built with Go, SQLite, and React.

## Features

- Track filament spools (brand, material, color, weight)
- Store print settings per filament (temperatures, speeds, retraction)
- Log filament usage and track remaining amounts
- View usage history per filament
- RESTful API with JSON responses
- React-based web interface
- Docker deployment with embedded frontend

## Quick Start with Docker (Recommended)

The easiest way to run Filament Manager is with Docker:

```bash
# Build and start the application
docker-compose up -d

# Access the application
open http://localhost:8080
```

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions, backup strategies, and production setup.

## Requirements (Development)

- Go 1.21 or higher
- Node.js 18 or higher
- SQLite3

## Development Setup

### Backend Setup

1. Install Go dependencies:
```bash
go mod download
```

2. Run the backend API:
```bash
go run main.go
```

The server will start on port 8080 by default.

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm start
```

The React app will start on port 3000 and proxy API requests to port 8080.

## Configuration

Environment variables:
- `PORT` - Server port (default: 8080)
- `DB_PATH` - SQLite database path (default: ./filament.db)

Example:
```bash
PORT=3000 DB_PATH=/data/filament.db go run main.go
```

## API Endpoints

### Filaments

- `GET /api/filaments` - List all filaments
  - Query params: `material`, `color`, `sort` (material|color|remaining_weight|created_at)
- `GET /api/filaments/:id` - Get filament details
- `POST /api/filaments` - Create new filament
- `PUT /api/filaments/:id` - Update filament
- `DELETE /api/filaments/:id` - Delete filament
- `GET /api/filaments/:id/usage` - Get usage history for filament

### Usage Logs

- `POST /api/usage` - Log filament usage
- `DELETE /api/usage/:id` - Delete usage entry

### Health Check

- `GET /health` - Health check endpoint

## Request/Response Examples

### Create Filament

```bash
POST /api/filaments
Content-Type: application/json

{
  "brand": "Hatchbox",
  "material": "PLA",
  "color": "Red",
  "initial_weight": 1000,
  "nozzle_temp": 200,
  "bed_temp": 60,
  "print_speed": 50,
  "retraction_distance": 5,
  "retraction_speed": 40
}
```

### Log Usage

```bash
POST /api/usage
Content-Type: application/json

{
  "filament_id": 1,
  "amount_used": 50.5,
  "print_name": "Test Print",
  "print_date": "2024-01-15"
}
```

## Database Schema

### filaments
- id (INTEGER PRIMARY KEY)
- brand (TEXT)
- material (TEXT)
- color (TEXT)
- initial_weight (REAL)
- remaining_weight (REAL)
- nozzle_temp (REAL)
- bed_temp (REAL)
- print_speed (REAL)
- retraction_distance (REAL)
- retraction_speed (REAL)
- created_at (DATETIME)
- updated_at (DATETIME)

### usage_logs
- id (INTEGER PRIMARY KEY)
- filament_id (INTEGER, FOREIGN KEY)
- amount_used (REAL)
- print_name (TEXT)
- print_date (DATETIME)
- created_at (DATETIME)

## Building for Production

### Docker (Recommended)

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete deployment guide.

```bash
docker-compose build
docker-compose up -d
```

### Manual Build

1. Build the React frontend:
```bash
cd frontend
npm install
npm run build
cd ..
```

2. Build the Go backend (with embedded frontend):
```bash
go build -o filament-manager
./filament-manager
```

## Testing

```bash
go test ./...
```

## CORS

The API includes CORS middleware allowing requests from any origin. This is suitable for local development. For production, consider restricting the allowed origins.
