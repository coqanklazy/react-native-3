import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import {
  LoginRequest,
  RegisterRequest,
  SendOTPRequest,
  VerifyRegistrationOTPRequest,
  ApiResponse,
  LoginResponse,
  RegisterResponse,
  SendOTPResponse,
  User,
} from '../types/api';

// Đọc biến môi trường theo chuẩn Expo (EXPO_PUBLIC_*)
const API_HOST = process.env.EXPO_PUBLIC_API_HOST_REAL_DEVICE ||
                 (Platform.OS === 'android' ? '10.0.2.2' : 'localhost');
const API_PORT = process.env.EXPO_PUBLIC_API_PORT || '3001';
const API_BASE_URL = `http://${API_HOST}:${API_PORT}/api`;

if (process.env.EXPO_PUBLIC_DEBUG_API === 'true') {
  console.log('🔗 API Connecting to:', API_BASE_URL);
}

// Storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  SESSION_ID: 'sessionId',
  USER_DATA: 'userData',
};

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export class ApiService {
  static async login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', data);
      if (response.data.success && response.data.data) {
        const { tokens, user, session } = response.data.data;
        await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
        await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
        await AsyncStorage.setItem(STORAGE_KEYS.SESSION_ID, session.sessionId);
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      }
      return response.data;
    } catch (error: any) {
      return error.response?.data || { success: false, message: 'Lỗi kết nối mạng.' };
    }
  }

  static async sendRegistrationOTP(data: SendOTPRequest): Promise<ApiResponse<SendOTPResponse>> {
    try {
      const response = await apiClient.post<ApiResponse<SendOTPResponse>>('/auth/send-registration-otp', data);
      return response.data;
    } catch (error: any) {
      return error.response?.data || { success: false, message: 'Lỗi kết nối mạng.' };
    }
  }

  static async verifyRegistrationOTP(data: VerifyRegistrationOTPRequest): Promise<ApiResponse<RegisterResponse>> {
    try {
      const response = await apiClient.post<ApiResponse<RegisterResponse>>('/auth/verify-registration-otp', data);
      if (response.data.success && response.data.data) {
        const { tokens, user } = response.data.data;
        await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
        await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      }
      return response.data;
    } catch (error: any) {
      return error.response?.data || { success: false, message: 'Lỗi kết nối mạng.' };
    }
  }

  // Lấy Access Token từ Storage
  static async getAccessToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  // Lấy dữ liệu người dùng hiện tại từ Storage
  static async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  static async logout(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
    } catch (error) {
      console.log('Logout error:', error);
    }
  }
}
