import React from 'react';
import styles from './ConfirmModal.module.scss';

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'warning' | 'danger';
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
  title,
  message,
  confirmText = '✓ Confirm',
  cancelText = '✕ Cancel',
  onConfirm, 
  onCancel,
  variant = 'warning'
}) => {
  return (
    <div className={styles.modalOverlay} onClick={onCancel}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles[variant]}>{title}</h3>
          <button 
            className={styles.closeButton} 
            onClick={onCancel}
            title="Close"
          >
            ✕
          </button>
        </div>
        <div className={styles.modalBody}>
          <p>{message}</p>
        </div>
        <div className={styles.modalFooter}>
          <button className={`${styles.button} ${styles.cancelButton}`} onClick={onCancel}>
            {cancelText}
          </button>
          <button className={`${styles.button} ${styles.confirmButton} ${styles[variant]}`} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

