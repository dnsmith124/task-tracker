import React from 'react';
import { useApp } from '@/context/AppContext';
import { Quest } from '@/features/quests/types/Quest';
import { getQuestXP } from '@/features/quests/utils/xpRewards';
import styles from './QuestCard.module.scss';

interface QuestCardProps {
  quest: Quest;
}

const QuestCard: React.FC<QuestCardProps> = ({ quest }) => {
  const { completeQuest, deleteQuest } = useApp();

  const handleToggleComplete = () => {
    if (!quest.completed) {
      completeQuest(quest.id);
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this quest?')) {
      deleteQuest(quest.id);
    }
  };

  const xpReward = getQuestXP(quest.type);

  return (
    <div className={styles.questCard}>
      <div className={styles.questHeader}>
        <input
          type="checkbox"
          className={styles.checkbox}
          checked={quest.completed}
          onChange={handleToggleComplete}
          disabled={quest.completed}
        />
        <div className={styles.questContent}>
          <div className={styles.questTitleRow}>
            <h4 className={`${styles.questTitle} ${quest.completed ? styles.completed : ''}`}>
              {quest.title}
            </h4>
            <span className={`${styles.questBadge} ${styles[quest.type]}`}>
              {quest.type === 'main' ? '⚔️ Main Quest' : '📜 Side Quest'}
            </span>
            {!quest.completed && (
              <span className={styles.xpBadge}>+{xpReward} XP</span>
            )}
          </div>
          {quest.description && (
            <p className={`${styles.questDescription} ${quest.completed ? styles.completed : ''}`}>
              {quest.description}
            </p>
          )}
        </div>
        <button 
          className={styles.deleteButton} 
          onClick={handleDelete}
          title="Delete quest"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default QuestCard;

