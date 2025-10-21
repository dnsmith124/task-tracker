import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import styles from './CampaignForm.module.scss';

interface CampaignFormProps {
  onClose?: () => void;
}

const CampaignForm: React.FC<CampaignFormProps> = ({ onClose }) => {
  const { addCampaign } = useApp();
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;

    addCampaign({
      name: name.trim(),
      completed: false,
    });

    setName('');
    if (onClose) onClose();
  };

  return (
    <div className={styles.formContainer}>
      <h3 className={styles.formTitle}>New Campaign</h3>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="campaign-name">Campaign Name</label>
          <input
            id="campaign-name"
            type="text"
            className={styles.input}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter campaign name..."
            autoFocus
          />
        </div>
        <div className={styles.buttonGroup}>
          <button type="submit" className={`${styles.button} ${styles.submitButton}`} disabled={!name.trim()}>
            Create Campaign
          </button>
          {onClose && (
            <button 
              type="button" 
              className={`${styles.button} ${styles.cancelButton}`} 
              onClick={onClose}
              title="Cancel"
            >
              ✕
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CampaignForm;

