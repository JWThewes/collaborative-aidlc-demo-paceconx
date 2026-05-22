import React from 'react';
import '../styles/App.css';

/**
 * Reusable confirmation dialog component
 * @param {Object} props - { isOpen, title, message, onConfirm, onCancel }
 */
const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" data-testid="confirm-dialog">
      <div className="modal-content confirm-dialog">
        <h2>{title}</h2>
        <p>{message}</p>
        <div className="modal-actions">
          <button
            className="btn btn-secondary"
            onClick={onCancel}
            data-testid="confirm-cancel"
          >
            Cancel
          </button>
          <button
            className="btn btn-danger"
            onClick={onConfirm}
            data-testid="confirm-ok"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
