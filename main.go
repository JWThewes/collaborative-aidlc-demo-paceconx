package main

import (
	"filament-manager/database"
	"filament-manager/handlers"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
)

func main() {
	// Initialize database
	dbPath := getEnv("DB_PATH", "./filament.db")
	db, err := database.InitDB(dbPath)
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}
	defer db.Close()

	// Create router
	router := mux.NewRouter()

	// Apply CORS middleware
	router.Use(handlers.CORSMiddleware)

	// API routes
	api := router.PathPrefix("/api").Subrouter()

	// Filament routes
	api.HandleFunc("/filaments", handlers.CreateFilament(db)).Methods("POST", "OPTIONS")
	api.HandleFunc("/filaments", handlers.ListFilaments(db)).Methods("GET", "OPTIONS")
	api.HandleFunc("/filaments/{id:[0-9]+}", handlers.GetFilament(db)).Methods("GET", "OPTIONS")
	api.HandleFunc("/filaments/{id:[0-9]+}", handlers.UpdateFilament(db)).Methods("PUT", "OPTIONS")
	api.HandleFunc("/filaments/{id:[0-9]+}", handlers.DeleteFilament(db)).Methods("DELETE", "OPTIONS")
	api.HandleFunc("/filaments/{id:[0-9]+}/usage", handlers.GetFilamentUsage(db)).Methods("GET", "OPTIONS")

	// Usage routes
	api.HandleFunc("/usage", handlers.CreateUsage(db)).Methods("POST", "OPTIONS")
	api.HandleFunc("/usage/{id:[0-9]+}", handlers.DeleteUsage(db)).Methods("DELETE", "OPTIONS")

	// Health check
	router.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	}).Methods("GET")

	// Start server
	port := getEnv("PORT", "8080")
	log.Printf("Server starting on port %s", port)
	if err := http.ListenAndServe(":"+port, router); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
