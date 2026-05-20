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

// CreateUsage handles POST /api/usage
func CreateUsage(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var input models.UsageInput
		if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
			respondError(w, http.StatusBadRequest, "Invalid request body")
			return
		}

		if err := input.Validate(); err != nil {
			respondError(w, http.StatusBadRequest, err.Error())
			return
		}

		usage, err := database.CreateUsage(db, &input)
		if err != nil {
			if err.Error() == "filament not found" {
				respondError(w, http.StatusNotFound, "Filament not found")
				return
			}
			respondError(w, http.StatusBadRequest, err.Error())
			return
		}

		respondJSON(w, http.StatusCreated, usage)
	}
}

// DeleteUsage handles DELETE /api/usage/:id
func DeleteUsage(db *sql.DB) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		id, err := strconv.Atoi(vars["id"])
		if err != nil {
			respondError(w, http.StatusBadRequest, "Invalid usage ID")
			return
		}

		if err := database.DeleteUsage(db, id); err != nil {
			if err.Error() == "usage log not found" {
				respondError(w, http.StatusNotFound, "Usage log not found")
				return
			}
			respondError(w, http.StatusInternalServerError, "Failed to delete usage log")
			return
		}

		w.WriteHeader(http.StatusNoContent)
	}
}
