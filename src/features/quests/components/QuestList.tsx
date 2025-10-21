import React from 'react';
import { useApp } from '@/context/AppContext';
import QuestCard from './QuestCard';

const QuestList: React.FC = () => {
  const { quests } = useApp();
  
  // Get only side quests (quests without a campaignId)
  const sideQuests = quests.filter(quest => quest.type === 'side');

  if (sideQuests.length === 0) {
    return null;
  }

  return (
    <div>
      {sideQuests.map((quest) => (
        <QuestCard key={quest.id} quest={quest} />
      ))}
    </div>
  );
};

export default QuestList;

