import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import CharacterPanel from '@/features/character/components/CharacterPanel';
import CampaignForm from '@/features/campaigns/components/CampaignForm';
import CampaignList from '@/features/campaigns/components/CampaignList';
import QuestForm from '@/features/quests/components/QuestForm';
import QuestList from '@/features/quests/components/QuestList';
import AdventureTimer from '@/features/adventureTimer/components/AdventureTimer';
import SettingsPanel from '@/features/settings/components/SettingsPanel';
import GuildPanel from '@/features/guild/components/GuildPanel';
import styles from './Dashboard.module.scss';

const Dashboard: React.FC = () => {
  const { campaigns, quests } = useApp();
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'campaigns' | 'sideQuests' | 'create' | 'guild' | 'settings'>('campaigns');

  const sideQuests = quests.filter(quest => quest.type === 'side');

  return (
    <div className={styles.dashboard}>
      <div className={styles.container}>
        <header className={styles.header}>
          <h1 className={styles.title}>⚔️ ProductiQuest</h1>
          <p className={styles.subtitle}>A Fantasy Task Tracker</p>
        </header>

        <div className={styles.layout}>
          <div className={styles.characterSection}>
            <CharacterPanel />
          </div>

          <div className={styles.questsSection}>
            {/* Tab Navigation */}
            <div className={styles.tabNav}>
              <button
                className={`${styles.tabButton} ${activeTab === 'campaigns' ? styles.active : ''}`}
                onClick={() => setActiveTab('campaigns')}
              >
                📖 Campaigns
              </button>
              <button
                className={`${styles.tabButton} ${activeTab === 'sideQuests' ? styles.active : ''}`}
                onClick={() => setActiveTab('sideQuests')}
              >
                📜 Side Quests
              </button>
              <button
                className={`${styles.tabButton} ${activeTab === 'create' ? styles.active : ''}`}
                onClick={() => setActiveTab('create')}
              >
                ✨ Create Quest
              </button>
              <button
                className={`${styles.tabButton} ${activeTab === 'guild' ? styles.active : ''}`}
                onClick={() => setActiveTab('guild')}
              >
                🏰 Guild
              </button>
              <button
                className={`${styles.tabButton} ${activeTab === 'settings' ? styles.active : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                ⚙️
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'campaigns' && (
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>📖 Campaigns</h2>
                  <button
                    className={styles.toggleButton}
                    onClick={() => setShowCampaignForm(!showCampaignForm)}
                    title={showCampaignForm ? 'Cancel' : 'New Campaign'}
                  >
                    {showCampaignForm ? '✕' : '+ New Campaign'}
                  </button>
                </div>
                {showCampaignForm && (
                  <CampaignForm onClose={() => setShowCampaignForm(false)} />
                )}
                <CampaignList />
                {campaigns.length === 0 && !showCampaignForm && (
                  <div className={styles.emptyState}>
                    <p className={styles.emptyStateText}>
                      No campaigns yet. Create one to organize your main quests!
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'sideQuests' && (
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}>📜 Side Quests</h2>
                </div>
                <QuestList />
                {sideQuests.length === 0 && (
                  <div className={styles.emptyState}>
                    <p className={styles.emptyStateText}>
                      No side quests yet. Switch to the "Create Quest" tab to add one!
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'create' && (
              <div className={styles.section}>
                <div className={styles.createQuestHeader}>
                  <h2 className={styles.sectionTitle}>✨ Create New Quest</h2>
                  <p className={styles.createQuestDescription}>
                    Add a new quest to track your tasks and earn experience points!
                  </p>
                </div>
                <QuestForm onClose={() => setActiveTab('sideQuests')} showTitle={false} />
              </div>
            )}

            {activeTab === 'guild' && (
              <div className={styles.section}>
                <GuildPanel />
              </div>
            )}

            {activeTab === 'settings' && (
              <div className={styles.section}>
                <SettingsPanel />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky Timer at Bottom */}
      <div className={styles.stickyTimerContainer}>
        <AdventureTimer />
      </div>
    </div>
  );
};

export default Dashboard;

