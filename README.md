# 🗡️ ProductiQuest

A fantasy-themed task tracker application built with React, TypeScript, and Vite. Turn your daily tasks into epic quests and watch your character grow!

## Features

### 🎯 Quest Management
- **Main Quests**: Tasks that belong to campaigns, award 25 XP
- **Side Quests**: Standalone tasks, award 10 XP
- Mark quests as complete to earn experience points
- Delete quests when no longer needed

### 📖 Campaign System
- Group multiple main quests into campaigns
- Collapsible campaign view to show/hide quests
- Completing a campaign awards 100 XP
- Warning system for completing campaigns with unfinished quests

### 🧙 Character Progression
- Customize your character's name
- Earn XP by completing quests and campaigns
- Level up system: Level requires 100 XP × (current level / 2)
- Gain 2 attribute points per level
- Four attributes to enhance: STR, AGL, MND, VIG

### 💾 Data Persistence
- All data stored in localStorage
- Automatic save on every change
- Data persists across browser sessions

### 🎨 Fantasy Theme
- Beautiful medieval-inspired color scheme
- Responsive mobile-first design
- Smooth animations and transitions
- Toast notifications for level-ups

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **SCSS Modules** - Scoped styling
- **React Context API** - State management
- **React Toastify** - Toast notifications
- **localStorage** - Data persistence

## Project Structure

```
src/
├── assets/
│   └── styles/           # Global styles, variables, and mixins
├── features/
│   ├── character/        # Character progression system
│   ├── campaigns/        # Campaign management
│   └── quests/          # Quest management
├── context/             # React Context for state management
├── pageRoutes/          # Page components
├── App.tsx              # Root component
└── main.tsx            # Application entry point
```

## Usage

### Creating a Campaign
1. Click "+ New Campaign" in the Campaigns section
2. Enter a campaign name
3. Click "Create Campaign"

### Creating a Quest
1. Click "+ New Quest" in the Side Quests section
2. Enter quest details (title, description)
3. Choose quest type:
   - **Side Quest**: Standalone task (+10 XP)
   - **Main Quest**: Part of a campaign (+25 XP, requires selecting a campaign)
4. Click "Create Quest"

### Completing Quests
- Check the checkbox next to a quest to mark it complete
- Earn XP immediately
- Completed quests remain visible but are crossed out and dimmed

### Leveling Up
- Level up automatically when you earn enough XP
- Receive a notification showing your new level
- Assign attribute points from the Character Sheet

### Managing Attributes
- Click the "+" button next to any attribute (STR, AGL, MND, VIG)
- Points must be assigned manually
- Unassigned points are displayed prominently

## Future Enhancements

The character attributes and levels are designed to support future features such as:
- Quest difficulty modifiers based on attributes
- Attribute requirements for special quests
- Character classes and specializations
- Skill trees and abilities

## License

MIT

## Credits

Built with ⚔️ by adventurers, for adventurers.

