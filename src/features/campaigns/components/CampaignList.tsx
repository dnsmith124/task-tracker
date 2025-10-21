import React from 'react';
import { useApp } from '@/context/AppContext';
import CampaignCard from './CampaignCard';

const CampaignList: React.FC = () => {
  const { campaigns } = useApp();

  if (campaigns.length === 0) {
    return null;
  }

  return (
    <div>
      {campaigns.map((campaign) => (
        <CampaignCard key={campaign.id} campaign={campaign} />
      ))}
    </div>
  );
};

export default CampaignList;

