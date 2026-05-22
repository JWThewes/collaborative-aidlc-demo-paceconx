import React, { useState } from 'react';
import { deleteUsage } from '../api/usageApi';
import ConfirmDialog from './ConfirmDialog';
import Toast from './Toast';

/**
 * Usage history list component
 * @param {Object} props - { usageLogs, onUsageDeleted }
 */
const UsageHistory = ({ usageLogs, onUsageDeleted }) => {
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, usageId: null });
  const [toast, setToast] = useState({ message: '', type: '' });

  const handleDeleteClick = (usageId) => {
    setConfirmDialog({
      isOpen: true,
      usageId,
    });
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteUsage(confirmDialog.usageId);
      setConfirmDialog({ isOpen: false, usageId: null });
      showToast('Usage log deleted successfully', 'success');
      onUsageDeleted();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleCancelDelete = () => {
    setConfirmDialog({ isOpen: false, usageId: null });
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!usageLogs || usageLogs.length === 0) {
    return (
      <div className="usage-history-empty">
        <p>No usage history yet. Log your first print to get started!</p>
      </div>
    );
  }

  // Calculate running total
  let runningTotal = 0;

  return (
    <div className="usage-history" data-testid="usage-history">
      <h2>Usage History</h2>
      <div className="usage-list">
        {usageLogs.map((log) => {
          runningTotal += log.amount_used;
          return (
            <div key={log.id} className="usage-item" data-testid={`usage-item-${log.id}`}>
              <div className="usage-item-main">
                <div className="usage-date">{formatDate(log.used_at)}</div>
                <div className="usage-details">
                  {log.print_name && (
                    <div className="usage-print-name">{log.print_name}</div>
                  )}
                  <div className="usage-amount">
                    <strong>{log.amount_used}g</strong> used
                  </div>
                </div>
                <div className="usage-running-total">
                  Total used: {runningTotal.toFixed(1)}g
                </div>
              </div>
              <button
                className="btn btn-small btn-danger"
                onClick={() => handleDeleteClick(log.id)}
                data-testid={`delete-usage-${log.id}`}
                aria-label="Delete usage log"
              >
                Delete
              </button>
            </div>
          );
        })}
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Delete Usage Log"
        message="Are you sure you want to delete this usage log? This will recalculate the remaining filament amount."
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

export default UsageHistory;
