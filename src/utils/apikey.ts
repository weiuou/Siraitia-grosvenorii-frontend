import axios from 'axios';
import { ApiKey, CreateApiKeyRequest, ApiKeyResponse } from '../types/apikey';
import { getCurrentUser } from './auth';

// API基础URL
const API_BASE_URL = 'http://127.0.0.1:8000';

// 获取所有API密钥
export const getAllApiKeys = async (): Promise<ApiKey[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/auth/api-keys`, {
      // withCredentials: true
    });
    if (!response.data) return [];
    return response.data.map((key: any) => ({
      id: key.id || '',
      description: key.description || '未命名密钥',
      key: key.key || '',
      userId: key.user_id || ''
    }));
  } catch (error) {
    console.error('获取API密钥失败:', error);
    throw new Error('获取API密钥失败，请重试');
  }
};

// 创建新的API密钥
export const createApiKey = async (description: string): Promise<ApiKey> => {
  try {
    const currentUser = getCurrentUser();
    if (!currentUser) {
      throw new Error('用户未登录');
    }

    const response = await axios.post(`${API_BASE_URL}/auth/api-keys`, {
      description: description
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    const keyData = response.data;
    return {
      id: keyData.id,
      description: keyData.description || keyData.name || '未命名密钥',
      key: keyData.key,
      userId: currentUser.id
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      throw new Error('认证已过期，请重新登录');
    }
    console.error('创建API密钥失败:', error);
    throw new Error('创建API密钥失败，请重试');
  }
};

// 删除API密钥
export const deleteApiKey = async (keyId: string): Promise<boolean> => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/auth/api-keys/${keyId}`, {
      // withCredentials: true
    });
    return response.data.success || false;
  } catch (error) {
    console.error('删除API密钥失败:', error);
    throw new Error('删除API密钥失败，请重试');
  }
};

// 重新生成API密钥
export const regenerateApiKey = async (keyId: string): Promise<ApiKey> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/keys/${keyId}/regenerate`, {}, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('重新生成API密钥失败:', error);
    throw new Error('重新生成API密钥失败，请重试');
  }
};

// 更新API密钥信息
export const updateApiKey = async (keyId: string, updates: Partial<CreateApiKeyRequest>): Promise<ApiKey> => {
  try {
    const response = await axios.put(`${API_BASE_URL}/api/keys/${keyId}`, updates, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    return response.data.data;
  } catch (error) {
    console.error('更新API密钥失败:', error);
    throw new Error('更新API密钥失败，请重试');
  }
};