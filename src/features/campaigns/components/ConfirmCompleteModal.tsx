import React from 'react';
import styles from './ConfirmCompleteModal.module.scss';

interface ConfirmCompleteModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmCompleteModal: React.FC<ConfirmCompleteModalProps> = ({ onConfirm, onCancel }) => {
  return (
    <div className={styles.modalOverlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>⚠️ Warning</h3>
          <button 
            className={styles.closeButton} 
            onClick={onCancel}
            title="Close"
          >
            ✕
          </button>
        </div>
        <div className={styles.modalBody}>
          <p>This campaign contains unfinished quests. Are you sure you want to mark it as complete?</p>
        </div>
        <div className={styles.modalFooter}>
          <button className={`${styles.button} ${styles.cancelButton}`} onClick={onCancel}>
            ✕ Cancel
          </button>
          <button className={`${styles.button} ${styles.confirmButton}`} onClick={onConfirm}>
            ✓ Complete Anyway
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmCompleteModal;

