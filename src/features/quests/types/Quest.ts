export interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'main' | 'side';
  completed: boolean;
  campaignId?: string;
  createdAt: number;
}

