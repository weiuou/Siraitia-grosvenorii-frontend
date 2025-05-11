import { User, LoginCredentials } from '../types/user';
import axios from 'axios';

// API基础URL
const API_BASE_URL = 'http://127.0.0.1:8001';

// 存储用户信息和token的本地存储键
export const USER_KEY = 'current_user';
export const TOKEN_KEY = 'access_token';

// 设置axios拦截器
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器处理token过期
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token过期或无效，清除本地存储并刷新页面
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 注册函数
export const register = (credentials: LoginCredentials): Promise<User> => {
  return new Promise(async (resolve, reject) => {
    try {
      // 发送注册请求
      const response = await axios.post(
        `${API_BASE_URL}/register`,
        {
          username: credentials.username,
          email: credentials.email,
          password: credentials.password
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );
      
      // 使用后端返回的用户信息
      const userData: User = {
        id: response.data.id,
        username: credentials.username,
        name: credentials.username,
        role: 'user'
      };
      
      // 存储用户信息到本地
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      resolve(userData);
    } catch (error) {
      // 处理错误
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 409) {
          reject(new Error('用户名已存在'));
        } else if (error.response.status === 400) {
          reject(new Error('无效的注册信息'));
        } else {
          reject(new Error(`注册失败: ${error.response.data?.detail || '服务器错误'}`));
        }
      } else {
        reject(new Error('网络错误，请检查您的网络连接'));
      }
    }
  });
};

// 登录函数
export const login = (credentials: LoginCredentials): Promise<User> => {
  return new Promise(async (resolve, reject) => {
    try {
      // 发送登录请求
      const response = await axios.post(
        `${API_BASE_URL}/token`,
        {
          username: credentials.username,
          password: credentials.password
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );
      
      // 保存token
      const token = response.data.access_token;
      localStorage.setItem(TOKEN_KEY, token);
      
      // 通过token获取用户信息
      const userResponse = await axios.get(`${API_BASE_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const userData: User = {
        id: userResponse.data.id,
        username: userResponse.data.username,
        name: userResponse.data.username,
        role: 'user'
      };
      
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      // 触发storage事件以通知其他标签页
      window.dispatchEvent(new Event('storage'));
      resolve(userData);
    } catch (error) {
      // 处理错误
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 401) {
          reject(new Error('用户名或密码错误'));
        } else if (error.response.status === 405) {
          reject(new Error('请求方法不允许，可能是CORS预检请求被拒绝'));
        } else {
          reject(new Error(`登录失败: ${error.response.data?.detail || '服务器错误'}`));
        }
      } else {
        reject(new Error('网络错误，请检查您的网络连接'));
      }
    }
  });
};

// 登出函数
export const logout = (): void => {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
};

// 检查登录状态并跳转
export const checkAuth = (): boolean => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    window.location.href = '/login';
    return false;
  }
  return true;
};

// 获取当前登录用户
export const getCurrentUser = (): User | null => {
  const userJson = localStorage.getItem(USER_KEY);
  return userJson ? JSON.parse(userJson) : null;
};

// 检查用户是否已登录
export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};
