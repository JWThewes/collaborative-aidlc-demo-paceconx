package handlers

import (
	"database/sql"
	"encoding/json"
	"filament-manager/database"
	"filament-manager/models"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
)

// CreateFilament handles POST /api/filaments
func CreateFilament(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var input models.FilamentInput
		if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
			respondError(w, http.StatusBadRequest, "Invalid request body")
			return
		}

		if err := input.Validate(); err != nil {
			respondError(w, http.StatusBadRequest, err.Error())
			return
		}

		filament, err := database.CreateFilament(db, &input)
		if err != nil {
			respondError(w, http.StatusInternalServerError, "Failed to create filament")
			return
		}

		respondJSON(w, http.StatusCreated, filament)
	}
}

// ListFilaments handles GET /api/filaments
func ListFilaments(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		material := r.URL.Query().Get("material")
		color := r.URL.Query().Get("color")
		sortBy := r.URL.Query().Get("sort")

		filaments, err := database.ListFilaments(db, material, color, sortBy)
		if err != nil {
			respondError(w, http.StatusInternalServerError, "Failed to list filaments")
			return
		}

		respondJSON(w, http.StatusOK, filaments)
	}
}

// GetFilament handles GET /api/filaments/:id
func GetFilament(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		id, err := strconv.Atoi(vars["id"])
		if err != nil {
			respondError(w, http.StatusBadRequest, "Invalid filament ID")
			return
		}

		filament, err := database.GetFilament(db, id)
		if err != nil {
			if err.Error() == "filament not found" {
				respondError(w, http.StatusNotFound, "Filament not found")
				return
			}
			respondError(w, http.StatusInternalServerError, "Failed to get filament")
			return
		}

		respondJSON(w, http.StatusOK, filament)
	}
}

// UpdateFilament handles PUT /api/filaments/:id
func UpdateFilament(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		id, err := strconv.Atoi(vars["id"])
		if err != nil {
			respondError(w, http.StatusBadRequest, "Invalid filament ID")
			return
		}

		var input models.FilamentInput
		if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
			respondError(w, http.StatusBadRequest, "Invalid request body")
			return
		}

		if err := input.Validate(); err != nil {
			respondError(w, http.StatusBadRequest, err.Error())
			return
		}

		filament, err := database.UpdateFilament(db, id, &input)
		if err != nil {
			if err.Error() == "filament not found" {
				respondError(w, http.StatusNotFound, "Filament not found")
				return
			}
			respondError(w, http.StatusInternalServerError, "Failed to update filament")
			return
		}

		respondJSON(w, http.StatusOK, filament)
	}
}

// DeleteFilament handles DELETE /api/filaments/:id
func DeleteFilament(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		id, err := strconv.Atoi(vars["id"])
		if err != nil {
			respondError(w, http.StatusBadRequest, "Invalid filament ID")
			return
		}

		if err := database.DeleteFilament(db, id); err != nil {
			if err.Error() == "filament not found" {
				respondError(w, http.StatusNotFound, "Filament not found")
				return
			}
			respondError(w, http.StatusInternalServerError, "Failed to delete filament")
			return
		}

		w.WriteHeader(http.StatusNoContent)
	}
}

// GetFilamentUsage handles GET /api/filaments/:id/usage
func GetFilamentUsage(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		id, err := strconv.Atoi(vars["id"])
		if err != nil {
			respondError(w, http.StatusBadRequest, "Invalid filament ID")
			return
		}

		// Check if filament exists
		if _, err := database.GetFilament(db, id); err != nil {
			if err.Error() == "filament not found" {
				respondError(w, http.StatusNotFound, "Filament not found")
				return
			}
			respondError(w, http.StatusInternalServerError, "Failed to get filament")
			return
		}

		usageLogs, err := database.GetUsageByFilament(db, id)
		if err != nil {
			respondError(w, http.StatusInternalServerError, "Failed to get usage history")
			return
		}

		respondJSON(w, http.StatusOK, usageLogs)
	}
}
