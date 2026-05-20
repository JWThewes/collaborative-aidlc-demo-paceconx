package database

import (
	"database/sql"
	"fmt"

	_ "github.com/mattn/go-sqlite3"
)

// InitDB initializes the database connection and creates tables
func InitDB(dbPath string) (*sql.DB, error) {
	db, err := sql.Open("sqlite3", dbPath)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	// Test connection
	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	// Create tables
	if err := createTables(db); err != nil {
		return nil, fmt.Errorf("failed to create tables: %w", err)
	}

	return db, nil
}

// createTables creates the necessary database tables
func createTables(db *sql.DB) error {
	// Filaments table
	filamentsTable := `
	CREATE TABLE IF NOT EXISTS filaments (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		brand TEXT NOT NULL,
		material TEXT NOT NULL,
		color TEXT NOT NULL,
		initial_weight REAL NOT NULL,
		remaining_weight REAL NOT NULL,
		nozzle_temp REAL,
		bed_temp REAL,
		print_speed REAL,
		retraction_distance REAL,
		retraction_speed REAL,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);`

	if _, err := db.Exec(filamentsTable); err != nil {
		return fmt.Errorf("failed to create filaments table: %w", err)
	}

	// Usage logs table
	usageLogsTable := `
	CREATE TABLE IF NOT EXISTS usage_logs (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		filament_id INTEGER NOT NULL,
		amount_used REAL NOT NULL,
		print_name TEXT,
		print_date DATETIME NOT NULL,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		FOREIGN KEY (filament_id) REFERENCES filaments(id) ON DELETE CASCADE
	);`

	if _, err := db.Exec(usageLogsTable); err != nil {
		return fmt.Errorf("failed to create usage_logs table: %w", err)
	}

	// Create indexes
	indexes := []string{
		"CREATE INDEX IF NOT EXISTS idx_usage_filament_id ON usage_logs(filament_id);",
		"CREATE INDEX IF NOT EXISTS idx_usage_print_date ON usage_logs(print_date);",
	}

	for _, idx := range indexes {
		if _, err := db.Exec(idx); err != nil {
			return fmt.Errorf("failed to create index: %w", err)
		}
	}

	return nil
}
