import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listFilaments } from '../api/filamentApi';
import FilamentCard from './FilamentCard';
import Toast from './Toast';
import '../styles/Dashboard.css';

/**
 * Main dashboard component - displays all filaments with filtering and sorting
 */
const Dashboard = () => {
  const navigate = useNavigate();
  const [filaments, setFilaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterMaterial, setFilterMaterial] = useState('');
  const [filterColor, setFilterColor] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState({ message: '', type: '' });

  useEffect(() => {
    loadFilaments();
  }, [filterMaterial, filterColor, sortBy]);

  const loadFilaments = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (filterMaterial) params.material = filterMaterial;
      if (filterColor) params.color = filterColor;
      if (sortBy) params.sort = sortBy;

      const data = await listFilaments(params);
      setFilaments(data);
    } catch (err) {
      setError(err.message);
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const handleAddNew = () => {
    navigate('/filaments/new');
  };

  // Client-side search filtering
  const filteredFilaments = filaments.filter((filament) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      filament.brand.toLowerCase().includes(search) ||
      filament.material.toLowerCase().includes(search) ||
      filament.color.toLowerCase().includes(search)
    );
  });

  // Get unique materials and colors for filter dropdowns
  const uniqueMaterials = [...new Set(filaments.map((f) => f.material))];
  const uniqueColors = [...new Set(filaments.map((f) => f.color))];

  return (
    <div className="dashboard" data-testid="dashboard">
      <div className="dashboard-header">
        <h1>Filament Inventory</h1>
        <button
          className="btn btn-primary"
          onClick={handleAddNew}
          data-testid="add-filament-btn"
        >
          + Add Filament
        </button>
      </div>

      <div className="dashboard-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search filaments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            data-testid="search-input"
          />
        </div>

        <div className="filters">
          <select
            value={filterMaterial}
            onChange={(e) => setFilterMaterial(e.target.value)}
            data-testid="filter-material"
          >
            <option value="">All Materials</option>
            {uniqueMaterials.map((material) => (
              <option key={material} value={material}>
                {material}
              </option>
            ))}
          </select>

          <select
            value={filterColor}
            onChange={(e) => setFilterColor(e.target.value)}
            data-testid="filter-color"
          >
            <option value="">All Colors</option>
            {uniqueColors.map((color) => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            data-testid="sort-by"
          >
            <option value="">Sort By...</option>
            <option value="material">Material</option>
            <option value="color">Color</option>
            <option value="remaining">Remaining Amount</option>
          </select>
        </div>
      </div>

      {loading && <div className="loading">Loading filaments...</div>}

      {error && !loading && (
        <div className="error-message" data-testid="error-message">
          {error}
        </div>
      )}

      {!loading && !error && filteredFilaments.length === 0 && (
        <div className="empty-state">
          <p>No filaments found. Add your first filament to get started!</p>
        </div>
      )}

      {!loading && !error && filteredFilaments.length > 0 && (
        <div className="filaments-grid">
          {filteredFilaments.map((filament) => (
            <FilamentCard key={filament.id} filament={filament} />
          ))}
        </div>
      )}

      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: '' })}
        />
      )}
    </div>
  );
};

export default Dashboard;
