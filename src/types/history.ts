import { AnalysisResult } from '../services/flowerAnalysis';

export interface HistoryItem {
  id: string;
  date: string;
  imageUrl: string;
  result: AnalysisResult;
}
