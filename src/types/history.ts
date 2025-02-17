export interface HistoryItem {
  id: string;
  date: string;
  imageUrl: string;
  category: string;
  confidence: number;
  details: {
    growthStage: string;
    estimatedHarvestTime: string;
    healthStatus: string;
  };
}
