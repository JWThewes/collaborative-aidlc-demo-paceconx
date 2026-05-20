package database

import (
	"database/sql"
	"filament-manager/models"
	"fmt"
	"time"
)

// CreateUsage logs a new filament usage entry and updates remaining weight
func CreateUsage(db *sql.DB, input *models.UsageInput) (*models.UsageLog, error) {
	// Begin transaction
	tx, err := db.Begin()
	if err != nil {
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	// Get current filament
	var currentWeight float64
	err = tx.QueryRow("SELECT remaining_weight FROM filaments WHERE id = ?", input.FilamentID).Scan(&currentWeight)
	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("filament not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get filament: %w", err)
	}

	// Check if there's enough filament
	newWeight := currentWeight - input.AmountUsed
	if newWeight < 0 {
		return nil, fmt.Errorf("insufficient filament: only %.2fg remaining", currentWeight)
	}

	// Parse print date or use current time
	var printDate time.Time
	if input.PrintDate != nil && *input.PrintDate != "" {
		printDate, err = time.Parse("2006-01-02", *input.PrintDate)
		if err != nil {
			// Try with time component
			printDate, err = time.Parse(time.RFC3339, *input.PrintDate)
			if err != nil {
				return nil, fmt.Errorf("invalid print_date format: %w", err)
			}
		}
	} else {
		printDate = time.Now()
	}

	// Insert usage log
	query := `
		INSERT INTO usage_logs (filament_id, amount_used, print_name, print_date)
		VALUES (?, ?, ?, ?)
	`
	result, err := tx.Exec(query, input.FilamentID, input.AmountUsed, input.PrintName, printDate)
	if err != nil {
		return nil, fmt.Errorf("failed to insert usage log: %w", err)
	}

	id, err := result.LastInsertId()
	if err != nil {
		return nil, fmt.Errorf("failed to get last insert id: %w", err)
	}

	// Update remaining weight
	_, err = tx.Exec("UPDATE filaments SET remaining_weight = ?, updated_at = ? WHERE id = ?",
		newWeight, time.Now(), input.FilamentID)
	if err != nil {
		return nil, fmt.Errorf("failed to update remaining weight: %w", err)
	}

	// Commit transaction
	if err := tx.Commit(); err != nil {
		return nil, fmt.Errorf("failed to commit transaction: %w", err)
	}

	// Get the created usage log
	return GetUsage(db, int(id))
}

// GetUsage retrieves a usage log by ID
func GetUsage(db *sql.DB, id int) (*models.UsageLog, error) {
	query := `
		SELECT id, filament_id, amount_used, print_name, print_date, created_at
		FROM usage_logs
		WHERE id = ?
	`

	var u models.UsageLog
	err := db.QueryRow(query, id).Scan(
		&u.ID,
		&u.FilamentID,
		&u.AmountUsed,
		&u.PrintName,
		&u.PrintDate,
		&u.CreatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("usage log not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get usage log: %w", err)
	}

	return &u, nil
}

// GetUsageByFilament retrieves all usage logs for a specific filament
func GetUsageByFilament(db *sql.DB, filamentID int) ([]*models.UsageLog, error) {
	query := `
		SELECT id, filament_id, amount_used, print_name, print_date, created_at
		FROM usage_logs
		WHERE filament_id = ?
		ORDER BY print_date DESC, created_at DESC
	`

	rows, err := db.Query(query, filamentID)
	if err != nil {
		return nil, fmt.Errorf("failed to get usage logs: %w", err)
	}
	defer rows.Close()

	var usageLogs []*models.UsageLog
	for rows.Next() {
		var u models.UsageLog
		err := rows.Scan(
			&u.ID,
			&u.FilamentID,
			&u.AmountUsed,
			&u.PrintName,
			&u.PrintDate,
			&u.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan usage log: %w", err)
		}
		usageLogs = append(usageLogs, &u)
	}

	return usageLogs, nil
}

// DeleteUsage deletes a usage log and restores the filament weight
func DeleteUsage(db *sql.DB, id int) error {
	// Begin transaction
	tx, err := db.Begin()
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	// Get usage log
	var filamentID int
	var amountUsed float64
	err = tx.QueryRow("SELECT filament_id, amount_used FROM usage_logs WHERE id = ?", id).Scan(&filamentID, &amountUsed)
	if err == sql.ErrNoRows {
		return fmt.Errorf("usage log not found")
	}
	if err != nil {
		return fmt.Errorf("failed to get usage log: %w", err)
	}

	// Delete usage log
	_, err = tx.Exec("DELETE FROM usage_logs WHERE id = ?", id)
	if err != nil {
		return fmt.Errorf("failed to delete usage log: %w", err)
	}

	// Restore weight to filament
	_, err = tx.Exec("UPDATE filaments SET remaining_weight = remaining_weight + ?, updated_at = ? WHERE id = ?",
		amountUsed, time.Now(), filamentID)
	if err != nil {
		return fmt.Errorf("failed to restore filament weight: %w", err)
	}

	// Commit transaction
	if err := tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}
