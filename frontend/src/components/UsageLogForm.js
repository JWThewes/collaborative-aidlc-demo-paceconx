import React, { useState } from 'react';
import { createUsage } from '../api/usageApi';
import Toast from './Toast';

/**
 * Modal form component for logging filament usage
 * @param {Object} props - { filamentId, isOpen, onClose, onUsageLogged }
 */
const UsageLogForm = ({ filamentId, isOpen, onClose, onUsageLogged }) => {
  const [formData, setFormData] = useState({
    amount_used: '',
    print_name: '',
    used_at: new Date().toISOString().split('T')[0], // Today's date
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ message: '', type: '' });

  const validateForm = () => {
    const newErrors = {};

    if (!formData.amount_used || formData.amount_used <= 0) {
      newErrors.amount_used = 'Amount used must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const submitData = {
        filament_id: parseInt(filamentId),
        amount_used: parseFloat(formData.amount_used),
        print_name: formData.print_name.trim() || null,
        used_at: formData.used_at ? new Date(formData.used_at).toISOString() : new Date().toISOString(),
      };

      await createUsage(submitData);
      showToast('Usage logged successfully', 'success');

      // Reset form
      setFormData({
        amount_used: '',
        print_name: '',
        used_at: new Date().toISOString().split('T')[0],
      });

      setTimeout(() => {
        onUsageLogged();
        onClose();
      }, 1000);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" data-testid="usage-log-form">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Log Filament Usage</h2>
          <button
            className="modal-close"
            onClick={onClose}
            data-testid="close-modal"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="usage-form">
          <div className="form-group">
            <label htmlFor="amount_used">Amount Used (grams) *</label>
            <input
              type="number"
              id="amount_used"
              name="amount_used"
              value={formData.amount_used}
              onChange={handleChange}
              min="0"
              step="0.01"
              data-testid="input-amount-used"
              className={errors.amount_used ? 'error' : ''}
            />
            {errors.amount_used && (
              <span className="error-message">{errors.amount_used}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="print_name">Print Name (optional)</label>
            <input
              type="text"
              id="print_name"
              name="print_name"
              value={formData.print_name}
              onChange={handleChange}
              placeholder="e.g., Benchy, Phone case"
              data-testid="input-print-name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="used_at">Date Used</label>
            <input
              type="date"
              id="used_at"
              name="used_at"
              value={formData.used_at}
              onChange={handleChange}
              data-testid="input-used-at"
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
              data-testid="btn-cancel"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              data-testid="btn-submit"
            >
              {loading ? 'Logging...' : 'Log Usage'}
            </button>
          </div>
        </form>

        {toast.message && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast({ message: '', type: '' })}
          />
        )}
      </div>
    </div>
  );
};

export default UsageLogForm;
