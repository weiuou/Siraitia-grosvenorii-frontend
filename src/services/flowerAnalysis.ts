import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000';

export interface AnalysisResult {
  category: string;
  confidence: number;
  details: {
    growthStage: string;
    estimatedHarvestTime: string;
    healthStatus: string;
  };
}

export interface TaskResponse {
  task_id: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: AnalysisResult;
  error?: string;
}

export async function analyzeFlowers(file: File, token: string): Promise<number> {
  const formData = new FormData();
  formData.append('image', file);

  try {
    const response = await axios.post(
      `${API_BASE_URL}/flower/analyze_all`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.task_id;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.detail || '分析请求失败');
    }
    throw error;
  }
}

export async function getAnalysisResult(taskId: number, token: string): Promise<TaskResponse> {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/flower/tasks/${taskId}`,

      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.detail || '获取分析结果失败');
    }
    throw error;
  }
}