import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import styles from './QuestForm.module.scss';

interface QuestFormProps {
  onClose?: () => void;
  showTitle?: boolean;
}

const QuestForm: React.FC<QuestFormProps> = ({ onClose, showTitle = true }) => {
  const { addQuest, campaigns } = useApp();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'main' | 'side'>('side');
  const [campaignId, setCampaignId] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;
    if (type === 'main' && !campaignId) return;

    addQuest({
      title: title.trim(),
      description: description.trim(),
      type,
      completed: false,
      campaignId: type === 'main' ? campaignId : undefined,
    });

    setTitle('');
    setDescription('');
    setType('side');
    setCampaignId('');
    if (onClose) onClose();
  };

  return (
    <div className={styles.formContainer}>
      {showTitle && <h3 className={styles.formTitle}>New Quest</h3>}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="quest-title">Quest Title</label>
          <input
            id="quest-title"
            type="text"
            className={styles.input}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter quest title..."
            autoFocus
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="quest-description">Description (Optional)</label>
          <textarea
            id="quest-description"
            className={styles.textarea}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter quest description..."
          />
        </div>

        <div className={styles.formGroup}>
          <label>Quest Type</label>
          <div className={styles.radioGroup}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                value="side"
                checked={type === 'side'}
                onChange={(e) => setType(e.target.value as 'main' | 'side')}
              />
              <span>📜 Side Quest (+10 XP)</span>
            </label>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                value="main"
                checked={type === 'main'}
                onChange={(e) => setType(e.target.value as 'main' | 'side')}
              />
              <span>⚔️ Main Quest (+25 XP)</span>
            </label>
          </div>
        </div>

        {type === 'main' && (
          <div className={styles.formGroup}>
            <label htmlFor="campaign-select">Campaign</label>
            {campaigns.length === 0 ? (
              <p className={styles.warningMessage}>
                ⚠️ No campaigns available. Create a campaign first to add main quests.
              </p>
            ) : (
              <select
                id="campaign-select"
                className={styles.select}
                value={campaignId}
                onChange={(e) => setCampaignId(e.target.value)}
              >
                <option value="">Select a campaign...</option>
                {campaigns.map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        <div className={styles.buttonGroup}>
          <button 
            type="submit" 
            className={`${styles.button} ${styles.submitButton}`} 
            disabled={!title.trim() || (type === 'main' && !campaignId)}
          >
            Create Quest
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

export default QuestForm;

