import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

/**
 * Individual filament card component for dashboard
 * @param {Object} props - { filament }
 */
const FilamentCard = ({ filament }) => {
  const navigate = useNavigate();

  const percentageRemaining = (filament.remaining_weight / filament.initial_weight) * 100;
  const isLowStock = percentageRemaining < 20;

  const handleClick = () => {
    navigate(`/filaments/${filament.id}`);
  };

  return (
    <div
      className={`filament-card ${isLowStock ? 'low-stock' : ''}`}
      onClick={handleClick}
      data-testid={`filament-card-${filament.id}`}
    >
      <div className="filament-card-header">
        <h3>{filament.brand}</h3>
        {isLowStock && <span className="low-stock-badge">Low Stock</span>}
      </div>
      <div className="filament-card-body">
        <div className="filament-info">
          <span className="material-badge">{filament.material}</span>
          <span className="color-indicator" style={{ backgroundColor: filament.color.toLowerCase() }}>
            {filament.color}
          </span>
        </div>
        <div className="filament-weight">
          <div className="weight-info">
            <span className="remaining">{filament.remaining_weight}g</span>
            <span className="percentage">({percentageRemaining.toFixed(0)}%)</span>
          </div>
          <div className="weight-bar">
            <div
              className={`weight-bar-fill ${isLowStock ? 'low' : ''}`}
              style={{ width: `${percentageRemaining}%` }}
            />
          </div>
          <div className="initial-weight">of {filament.initial_weight}g</div>
        </div>
      </div>
    </div>
  );
};

export default FilamentCard;
