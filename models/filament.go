package models

import "time"

// Filament represents a filament spool with all its properties
type Filament struct {
	ID               int       `json:"id"`
	Brand            string    `json:"brand"`
	Material         string    `json:"material"`
	Color            string    `json:"color"`
	InitialWeight    float64   `json:"initial_weight"`
	RemainingWeight  float64   `json:"remaining_weight"`
	NozzleTemp       *float64  `json:"nozzle_temp,omitempty"`
	BedTemp          *float64  `json:"bed_temp,omitempty"`
	PrintSpeed       *float64  `json:"print_speed,omitempty"`
	RetractionDist   *float64  `json:"retraction_distance,omitempty"`
	RetractionSpeed  *float64  `json:"retraction_speed,omitempty"`
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

// FilamentInput represents the input for creating/updating a filament
type FilamentInput struct {
	Brand           string   `json:"brand"`
	Material        string   `json:"material"`
	Color           string   `json:"color"`
	InitialWeight   float64  `json:"initial_weight"`
	NozzleTemp      *float64 `json:"nozzle_temp,omitempty"`
	BedTemp         *float64 `json:"bed_temp,omitempty"`
	PrintSpeed      *float64 `json:"print_speed,omitempty"`
	RetractionDist  *float64 `json:"retraction_distance,omitempty"`
	RetractionSpeed *float64 `json:"retraction_speed,omitempty"`
}

// Validate checks if the filament input has all required fields
func (f *FilamentInput) Validate() error {
	if f.Brand == "" {
		return &ValidationError{Field: "brand", Message: "brand is required"}
	}
	if f.Material == "" {
		return &ValidationError{Field: "material", Message: "material is required"}
	}
	if f.Color == "" {
		return &ValidationError{Field: "color", Message: "color is required"}
	}
	if f.InitialWeight <= 0 {
		return &ValidationError{Field: "initial_weight", Message: "initial_weight must be greater than 0"}
	}
	return nil
}

// ValidationError represents a validation error
type ValidationError struct {
	Field   string
	Message string
}

func (e *ValidationError) Error() string {
	return e.Message
}
