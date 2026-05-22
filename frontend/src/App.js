import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import FilamentForm from './components/FilamentForm';
import FilamentDetail from './components/FilamentDetail';
import './styles/App.css';

/**
 * Main application component with routing
 */
function App() {
  return (
    <Router>
      <div className="app">
        <header className="app-header">
          <div className="header-content">
            <Link to="/" className="logo">
              <h1>Filament Manager</h1>
            </Link>
            <nav className="main-nav">
              <Link to="/" className="nav-link" data-testid="nav-home">
                Dashboard
              </Link>
              <Link to="/filaments/new" className="nav-link" data-testid="nav-add">
                Add Filament
              </Link>
            </nav>
          </div>
        </header>

        <main className="app-main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/filaments/new" element={<FilamentForm />} />
            <Route path="/filaments/:id" element={<FilamentDetail />} />
            <Route path="/filaments/:id/edit" element={<FilamentForm />} />
          </Routes>
        </main>

        <footer className="app-footer">
          <p>&copy; 2026 Filament Manager - Track your 3D printing materials</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
