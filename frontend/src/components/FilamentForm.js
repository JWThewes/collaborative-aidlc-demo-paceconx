import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createFilament, updateFilament, getFilament } from '../api/filamentApi';
import Toast from './Toast';
import '../styles/FilamentForm.css';

/**
 * Form component for adding or editing a filament
 */
const FilamentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    brand: '',
    material: '',
    color: '',
    initial_weight: '',
    nozzle_temp: '',
    bed_temp: '',
    print_speed: '',
    retraction_distance: '',
    retraction_speed: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ message: '', type: '' });

  const materialOptions = ['PLA', 'PETG', 'ABS', 'TPU', 'Nylon', 'ASA', 'PC', 'Other'];
  const colorOptions = ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Orange', 'Purple', 'Gray', 'Custom'];

  useEffect(() => {
    if (isEditMode) {
      loadFilament();
    }
  }, [id]);

  const loadFilament = async () => {
    try {
      setLoading(true);
      const filament = await getFilament(id);
      setFormData({
        brand: filament.brand,
        material: filament.material,
        color: filament.color,
        initial_weight: filament.initial_weight,
        nozzle_temp: filament.nozzle_temp || '',
        bed_temp: filament.bed_temp || '',
        print_speed: filament.print_speed || '',
        retraction_distance: filament.retraction_distance || '',
        retraction_speed: filament.retraction_speed || '',
      });
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.brand.trim()) {
      newErrors.brand = 'Brand is required';
    }

    if (!formData.material.trim()) {
      newErrors.material = 'Material is required';
    }

    if (!formData.color.trim()) {
      newErrors.color = 'Color is required';
    }

    if (!formData.initial_weight || formData.initial_weight <= 0) {
      newErrors.initial_weight = 'Initial weight must be greater than 0';
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

      // Prepare data with proper types
      const submitData = {
        brand: formData.brand.trim(),
        material: formData.material.trim(),
        color: formData.color.trim(),
        initial_weight: parseFloat(formData.initial_weight),
        nozzle_temp: formData.nozzle_temp ? parseFloat(formData.nozzle_temp) : null,
        bed_temp: formData.bed_temp ? parseFloat(formData.bed_temp) : null,
        print_speed: formData.print_speed ? parseFloat(formData.print_speed) : null,
        retraction_distance: formData.retraction_distance ? parseFloat(formData.retraction_distance) : null,
        retraction_speed: formData.retraction_speed ? parseFloat(formData.retraction_speed) : null,
      };

      if (isEditMode) {
        await updateFilament(id, submitData);
        showToast('Filament updated successfully', 'success');
      } else {
        await createFilament(submitData);
        showToast('Filament created successfully', 'success');
      }

      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(isEditMode ? `/filaments/${id}` : '/');
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  return (
    <div className="filament-form-container" data-testid="filament-form">
      <div className="form-header">
        <h1>{isEditMode ? 'Edit Filament' : 'Add New Filament'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="filament-form">
        <div className="form-section">
          <h2>Basic Information</h2>

          <div className="form-group">
            <label htmlFor="brand">Brand *</label>
            <input
              type="text"
              id="brand"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              data-testid="input-brand"
              className={errors.brand ? 'error' : ''}
            />
            {errors.brand && <span className="error-message">{errors.brand}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="material">Material Type *</label>
            <select
              id="material"
              name="material"
              value={formData.material}
              onChange={handleChange}
              data-testid="input-material"
              className={errors.material ? 'error' : ''}
            >
              <option value="">Select material...</option>
              {materialOptions.map((mat) => (
                <option key={mat} value={mat}>
                  {mat}
                </option>
              ))}
            </select>
            {errors.material && <span className="error-message">{errors.material}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="color">Color *</label>
            <select
              id="color"
              name="color"
              value={formData.color}
              onChange={handleChange}
              data-testid="input-color"
              className={errors.color ? 'error' : ''}
            >
              <option value="">Select color...</option>
              {colorOptions.map((col) => (
                <option key={col} value={col}>
                  {col}
                </option>
              ))}
            </select>
            {errors.color && <span className="error-message">{errors.color}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="initial_weight">Initial Weight (grams) *</label>
            <input
              type="number"
              id="initial_weight"
              name="initial_weight"
              value={formData.initial_weight}
              onChange={handleChange}
              min="0"
              step="0.01"
              data-testid="input-initial-weight"
              className={errors.initial_weight ? 'error' : ''}
            />
            {errors.initial_weight && (
              <span className="error-message">{errors.initial_weight}</span>
            )}
          </div>
        </div>

        <div className="form-section">
          <h2>Print Settings (Optional)</h2>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nozzle_temp">Nozzle Temperature (°C)</label>
              <input
                type="number"
                id="nozzle_temp"
                name="nozzle_temp"
                value={formData.nozzle_temp}
                onChange={handleChange}
                min="0"
                step="1"
                data-testid="input-nozzle-temp"
              />
            </div>

            <div className="form-group">
              <label htmlFor="bed_temp">Bed Temperature (°C)</label>
              <input
                type="number"
                id="bed_temp"
                name="bed_temp"
                value={formData.bed_temp}
                onChange={handleChange}
                min="0"
                step="1"
                data-testid="input-bed-temp"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="print_speed">Print Speed (mm/s)</label>
            <input
              type="number"
              id="print_speed"
              name="print_speed"
              value={formData.print_speed}
              onChange={handleChange}
              min="0"
              step="1"
              data-testid="input-print-speed"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="retraction_distance">Retraction Distance (mm)</label>
              <input
                type="number"
                id="retraction_distance"
                name="retraction_distance"
                value={formData.retraction_distance}
                onChange={handleChange}
                min="0"
                step="0.1"
                data-testid="input-retraction-distance"
              />
            </div>

            <div className="form-group">
              <label htmlFor="retraction_speed">Retraction Speed (mm/s)</label>
              <input
                type="number"
                id="retraction_speed"
                name="retraction_speed"
                value={formData.retraction_speed}
                onChange={handleChange}
                min="0"
                step="1"
                data-testid="input-retraction-speed"
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleCancel}
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
            {loading ? 'Saving...' : isEditMode ? 'Update Filament' : 'Add Filament'}
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
  );
};

export default FilamentForm;
