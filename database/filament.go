package database

import (
	"database/sql"
	"filament-manager/models"
	"fmt"
	"strings"
	"time"
)

// CreateFilament inserts a new filament into the database
func CreateFilament(db *sql.DB, input *models.FilamentInput) (*models.Filament, error) {
	query := `
		INSERT INTO filaments (
			brand, material, color, initial_weight, remaining_weight,
			nozzle_temp, bed_temp, print_speed, retraction_distance, retraction_speed
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`

	result, err := db.Exec(
		query,
		input.Brand,
		input.Material,
		input.Color,
		input.InitialWeight,
		input.InitialWeight, // remaining_weight starts equal to initial_weight
		input.NozzleTemp,
		input.BedTemp,
		input.PrintSpeed,
		input.RetractionDist,
		input.RetractionSpeed,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to insert filament: %w", err)
	}

	id, err := result.LastInsertId()
	if err != nil {
		return nil, fmt.Errorf("failed to get last insert id: %w", err)
	}

	return GetFilament(db, int(id))
}

// GetFilament retrieves a filament by ID
func GetFilament(db *sql.DB, id int) (*models.Filament, error) {
	query := `
		SELECT id, brand, material, color, initial_weight, remaining_weight,
			   nozzle_temp, bed_temp, print_speed, retraction_distance, retraction_speed,
			   created_at, updated_at
		FROM filaments
		WHERE id = ?
	`

	var f models.Filament
	err := db.QueryRow(query, id).Scan(
		&f.ID,
		&f.Brand,
		&f.Material,
		&f.Color,
		&f.InitialWeight,
		&f.RemainingWeight,
		&f.NozzleTemp,
		&f.BedTemp,
		&f.PrintSpeed,
		&f.RetractionDist,
		&f.RetractionSpeed,
		&f.CreatedAt,
		&f.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("filament not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get filament: %w", err)
	}

	return &f, nil
}

// ListFilaments retrieves all filaments with optional filtering and sorting
func ListFilaments(db *sql.DB, material, color, sortBy string) ([]*models.Filament, error) {
	query := `
		SELECT id, brand, material, color, initial_weight, remaining_weight,
			   nozzle_temp, bed_temp, print_speed, retraction_distance, retraction_speed,
			   created_at, updated_at
		FROM filaments
		WHERE 1=1
	`

	var args []interface{}

	// Add filters
	if material != "" {
		query += " AND material = ?"
		args = append(args, material)
	}
	if color != "" {
		query += " AND color = ?"
		args = append(args, color)
	}

	// Add sorting
	validSortFields := map[string]bool{
		"material":         true,
		"color":            true,
		"remaining_weight": true,
		"created_at":       true,
	}
	if sortBy != "" && validSortFields[sortBy] {
		query += " ORDER BY " + sortBy
	} else {
		query += " ORDER BY created_at DESC"
	}

	rows, err := db.Query(query, args...)
	if err != nil {
		return nil, fmt.Errorf("failed to list filaments: %w", err)
	}
	defer rows.Close()

	var filaments []*models.Filament
	for rows.Next() {
		var f models.Filament
		err := rows.Scan(
			&f.ID,
			&f.Brand,
			&f.Material,
			&f.Color,
			&f.InitialWeight,
			&f.RemainingWeight,
			&f.NozzleTemp,
			&f.BedTemp,
			&f.PrintSpeed,
			&f.RetractionDist,
			&f.RetractionSpeed,
			&f.CreatedAt,
			&f.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan filament: %w", err)
		}
		filaments = append(filaments, &f)
	}

	return filaments, nil
}

// UpdateFilament updates an existing filament
func UpdateFilament(db *sql.DB, id int, input *models.FilamentInput) (*models.Filament, error) {
	// Check if filament exists
	existing, err := GetFilament(db, id)
	if err != nil {
		return nil, err
	}

	// Calculate new remaining weight if initial weight changed
	remainingWeight := existing.RemainingWeight
	if input.InitialWeight != existing.InitialWeight {
		// Adjust remaining weight proportionally
		ratio := input.InitialWeight / existing.InitialWeight
		remainingWeight = existing.RemainingWeight * ratio
	}

	query := `
		UPDATE filaments
		SET brand = ?, material = ?, color = ?, initial_weight = ?, remaining_weight = ?,
			nozzle_temp = ?, bed_temp = ?, print_speed = ?,
			retraction_distance = ?, retraction_speed = ?, updated_at = ?
		WHERE id = ?
	`

	_, err = db.Exec(
		query,
		input.Brand,
		input.Material,
		input.Color,
		input.InitialWeight,
		remainingWeight,
		input.NozzleTemp,
		input.BedTemp,
		input.PrintSpeed,
		input.RetractionDist,
		input.RetractionSpeed,
		time.Now(),
		id,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to update filament: %w", err)
	}

	return GetFilament(db, id)
}

// DeleteFilament deletes a filament and all its usage logs
func DeleteFilament(db *sql.DB, id int) error {
	// Check if filament exists
	if _, err := GetFilament(db, id); err != nil {
		return err
	}

	query := "DELETE FROM filaments WHERE id = ?"
	_, err := db.Exec(query, id)
	if err != nil {
		return fmt.Errorf("failed to delete filament: %w", err)
	}

	return nil
}

// UpdateRemainingWeight updates the remaining weight of a filament
func UpdateRemainingWeight(db *sql.DB, id int, newWeight float64) error {
	query := "UPDATE filaments SET remaining_weight = ?, updated_at = ? WHERE id = ?"
	_, err := db.Exec(query, newWeight, time.Now(), id)
	if err != nil {
		return fmt.Errorf("failed to update remaining weight: %w", err)
	}
	return nil
}

// sanitizeSortField prevents SQL injection in ORDER BY clauses
func sanitizeSortField(field string) string {
	return strings.ReplaceAll(field, ";", "")
}
