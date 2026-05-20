import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getFilament, deleteFilament, getFilamentUsage } from '../api/filamentApi';
import UsageHistory from './UsageHistory';
import UsageLogForm from './UsageLogForm';
import ConfirmDialog from './ConfirmDialog';
import Toast from './Toast';

/**
 * Detailed filament view component with print settings and usage history
 */
const FilamentDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [filament, setFilament] = useState(null);
  const [usageLogs, setUsageLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUsageForm, setShowUsageForm] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false });
  const [toast, setToast] = useState({ message: '', type: '' });

  useEffect(() => {
    loadFilament();
    loadUsageHistory();
  }, [id]);

  const loadFilament = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getFilament(id);
      setFilament(data);
    } catch (err) {
      setError(err.message);
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadUsageHistory = async () => {
    try {
      const logs = await getFilamentUsage(id);
      setUsageLogs(logs);
    } catch (err) {
      // Non-critical error, just log it
      console.error('Failed to load usage history:', err);
    }
  };

  const handleEdit = () => {
    navigate(`/filaments/${id}/edit`);
  };

  const handleDeleteClick = () => {
    setConfirmDialog({ isOpen: true });
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteFilament(id);
      showToast('Filament deleted successfully', 'success');
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      showToast(err.message, 'error');
      setConfirmDialog({ isOpen: false });
    }
  };

  const handleCancelDelete = () => {
    setConfirmDialog({ isOpen: false });
  };

  const handleLogUsage = () => {
    setShowUsageForm(true);
  };

  const handleUsageLogged = () => {
    loadFilament();
    loadUsageHistory();
  };

  const handleUsageDeleted = () => {
    loadFilament();
    loadUsageHistory();
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const copySetting = (value, label) => {
    navigator.clipboard.writeText(value);
    showToast(`${label} copied to clipboard`, 'success');
  };

  if (loading) {
    return <div className="loading">Loading filament details...</div>;
  }

  if (error || !filament) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error || 'Filament not found'}</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          Back to Dashboard
        </button>
      </div>
    );
  }

  const percentageRemaining = (filament.remaining_weight / filament.initial_weight) * 100;
  const isLowStock = percentageRemaining < 20;

  return (
    <div className="filament-detail" data-testid="filament-detail">
      <div className="detail-header">
        <div>
          <h1>{filament.brand}</h1>
          <div className="filament-meta">
            <span className="material-badge">{filament.material}</span>
            <span className="color-badge" style={{ backgroundColor: filament.color.toLowerCase() }}>
              {filament.color}
            </span>
            {isLowStock && <span className="low-stock-badge">Low Stock</span>}
          </div>
        </div>
        <div className="detail-actions">
          <button
            className="btn btn-secondary"
            onClick={handleEdit}
            data-testid="btn-edit"
          >
            Edit
          </button>
          <button
            className="btn btn-danger"
            onClick={handleDeleteClick}
            data-testid="btn-delete"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="detail-content">
        <div className="detail-section weight-section">
          <h2>Weight Information</h2>
          <div className="weight-display">
            <div className="weight-stat">
              <label>Remaining</label>
              <div className="weight-value">
                {filament.remaining_weight}g
                <span className="weight-percentage">({percentageRemaining.toFixed(1)}%)</span>
              </div>
            </div>
            <div className="weight-stat">
              <label>Initial Weight</label>
              <div className="weight-value">{filament.initial_weight}g</div>
            </div>
            <div className="weight-stat">
              <label>Total Used</label>
              <div className="weight-value">
                {(filament.initial_weight - filament.remaining_weight).toFixed(1)}g
              </div>
            </div>
          </div>
          <div className="weight-bar-large">
            <div
              className={`weight-bar-fill ${isLowStock ? 'low' : ''}`}
              style={{ width: `${percentageRemaining}%` }}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={handleLogUsage}
            data-testid="btn-log-usage"
          >
            Log Usage
          </button>
        </div>

        <div className="detail-section print-settings-section">
          <h2>Print Settings</h2>
          {filament.nozzle_temp || filament.bed_temp || filament.print_speed ||
           filament.retraction_distance || filament.retraction_speed ? (
            <div className="print-settings">
              {filament.nozzle_temp && (
                <div
                  className="setting-item"
                  onClick={() => copySetting(filament.nozzle_temp, 'Nozzle temperature')}
                  title="Click to copy"
                >
                  <label>Nozzle Temperature</label>
                  <span className="setting-value">{filament.nozzle_temp}°C</span>
                </div>
              )}
              {filament.bed_temp && (
                <div
                  className="setting-item"
                  onClick={() => copySetting(filament.bed_temp, 'Bed temperature')}
                  title="Click to copy"
                >
                  <label>Bed Temperature</label>
                  <span className="setting-value">{filament.bed_temp}°C</span>
                </div>
              )}
              {filament.print_speed && (
                <div
                  className="setting-item"
                  onClick={() => copySetting(filament.print_speed, 'Print speed')}
                  title="Click to copy"
                >
                  <label>Print Speed</label>
                  <span className="setting-value">{filament.print_speed} mm/s</span>
                </div>
              )}
              {filament.retraction_distance && (
                <div
                  className="setting-item"
                  onClick={() => copySetting(filament.retraction_distance, 'Retraction distance')}
                  title="Click to copy"
                >
                  <label>Retraction Distance</label>
                  <span className="setting-value">{filament.retraction_distance} mm</span>
                </div>
              )}
              {filament.retraction_speed && (
                <div
                  className="setting-item"
                  onClick={() => copySetting(filament.retraction_speed, 'Retraction speed')}
                  title="Click to copy"
                >
                  <label>Retraction Speed</label>
                  <span className="setting-value">{filament.retraction_speed} mm/s</span>
                </div>
              )}
            </div>
          ) : (
            <p className="no-settings">No print settings configured yet.</p>
          )}
        </div>

        <div className="detail-section">
          <UsageHistory usageLogs={usageLogs} onUsageDeleted={handleUsageDeleted} />
        </div>
      </div>

      <UsageLogForm
        filamentId={id}
        isOpen={showUsageForm}
        onClose={() => setShowUsageForm(false)}
        onUsageLogged={handleUsageLogged}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Filament"
        message="Are you sure you want to delete this filament? This will also delete all usage history. This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

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

export default FilamentDetail;
