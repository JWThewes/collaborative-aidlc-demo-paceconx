package models

import "time"

// UsageLog represents a filament usage entry
type UsageLog struct {
	ID          int       `json:"id"`
	FilamentID  int       `json:"filament_id"`
	AmountUsed  float64   `json:"amount_used"`
	PrintName   string    `json:"print_name,omitempty"`
	PrintDate   time.Time `json:"print_date"`
	CreatedAt   time.Time `json:"created_at"`
}

// UsageInput represents the input for logging filament usage
type UsageInput struct {
	FilamentID int     `json:"filament_id"`
	AmountUsed float64 `json:"amount_used"`
	PrintName  string  `json:"print_name,omitempty"`
	PrintDate  *string `json:"print_date,omitempty"`
}

// Validate checks if the usage input has all required fields
func (u *UsageInput) Validate() error {
	if u.FilamentID <= 0 {
		return &ValidationError{Field: "filament_id", Message: "filament_id is required"}
	}
	if u.AmountUsed <= 0 {
		return &ValidationError{Field: "amount_used", Message: "amount_used must be greater than 0"}
	}
	return nil
}
