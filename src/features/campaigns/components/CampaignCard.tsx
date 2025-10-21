import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Campaign } from '@/features/campaigns/types/Campaign';
import QuestCard from '@/features/quests/components/QuestCard';
import ConfirmCompleteModal from './ConfirmCompleteModal';
import styles from './CampaignCard.module.scss';

interface CampaignCardProps {
  campaign: Campaign;
}

const CampaignCard: React.FC<CampaignCardProps> = ({ campaign }) => {
  const { getCampaignQuests, hasUncompletedQuests, completeCampaign, deleteCampaign } = useApp();
  const [isExpanded, setIsExpanded] = useState(true);
  const [showWarning, setShowWarning] = useState(false);
  
  const quests = getCampaignQuests(campaign.id);
  const hasUncompleted = hasUncompletedQuests(campaign.id);

  const handleToggleComplete = () => {
    if (!campaign.completed && hasUncompleted) {
      setShowWarning(true);
    } else {
      completeCampaign(campaign.id);
    }
  };

  const handleConfirmComplete = () => {
    completeCampaign(campaign.id);
    setShowWarning(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this campaign? All quests in this campaign will also be deleted.')) {
      deleteCampaign(campaign.id);
    }
  };

  return (
    <>
      <div className={styles.campaignCard}>
        <div className={styles.campaignHeader}>
          <input
            type="checkbox"
            className={styles.checkbox}
            checked={campaign.completed}
            onChange={handleToggleComplete}
            disabled={campaign.completed}
          />
          <div className={styles.campaignInfo}>
            <h3 className={`${styles.campaignName} ${campaign.completed ? styles.completed : ''}`}>
              {campaign.name}
            </h3>
            <div className={styles.questCount}>
              {quests.length} quest{quests.length !== 1 ? 's' : ''}
              {!campaign.completed && <span className={styles.xpBadge}>+100 XP</span>}
            </div>
          </div>
          <div className={styles.actions}>
            {quests.length > 0 && (
              <button
                className={`${styles.button} ${styles.expandButton}`}
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Collapse' : 'Expand'}
              >
                {isExpanded ? '▲' : '▼'}
              </button>
            )}
            <button
              className={`${styles.button} ${styles.deleteButton}`}
              onClick={handleDelete}
              title="Delete campaign"
            >
              ✕
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className={styles.questsContainer}>
            {quests.length > 0 ? (
              quests.map((quest) => (
                <QuestCard key={quest.id} quest={quest} />
              ))
            ) : (
              <div className={styles.emptyQuests}>
                No quests in this campaign yet
              </div>
            )}
          </div>
        )}
      </div>

      {showWarning && (
        <ConfirmCompleteModal
          onConfirm={handleConfirmComplete}
          onCancel={() => setShowWarning(false)}
        />
      )}
    </>
  );
};

export default CampaignCard;

