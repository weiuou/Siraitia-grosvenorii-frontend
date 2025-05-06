import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8001';

export interface FlowerDetection {
  bbox: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    confidence?: number;
  };
  votes: Array<{
    model_name: string;
    class_id: number;
    class_name?: string;
    confidence: number;
  }>;
  final_class: {
    class_name: string;
    class_id: number;
    confidence: number;
    vote_count: number;
  };
  crop_image?: string;
}

export interface AnalysisResult {
  image_size: [number, number];
  flowers: FlowerDetection[];
  processing_time?: number;
  timestamp?: string;
}

export async function analyzeFlowers(file: File, token: string): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await axios.post(
      `${API_BASE_URL}/flower/detect`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.detail || '花朵分析失败');
    }
    throw error;
  }
}
