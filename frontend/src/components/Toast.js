import React, { useEffect } from 'react';
import '../styles/App.css';

/**
 * Toast notification component
 * @param {Object} props - { message, type, onClose }
 * @param {string} props.message - Toast message
 * @param {string} props.type - Toast type: 'success' | 'error' | 'info'
 * @param {Function} props.onClose - Callback when toast closes
 */
const Toast = ({ message, type = 'info', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!message) return null;

  return (
    <div className={`toast toast-${type}`} data-testid="toast">
      <span>{message}</span>
      <button
        className="toast-close"
        onClick={onClose}
        data-testid="toast-close"
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
};

export default Toast;
