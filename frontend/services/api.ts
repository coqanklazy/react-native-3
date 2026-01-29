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
  ProfileUpdateRequest,
  ChangePasswordRequest,
  SendEmailUpdateOTPRequest,
  VerifyEmailUpdateRequest,
  SendPhoneUpdateOTPRequest,
  VerifyPhoneUpdateRequest,
  AvatarUploadResponse,
  VerifyRegistrationResponse,
  OTPVerifyResponse,
  OTPSendResponse,
  VerifyPasswordChangeOTPRequest,
} from '../types/api';

// Đọc biến môi trường theo chuẩn Expo (EXPO_PUBLIC_*)
// NOTE: Với thiết bị thật, hãy thay đổi 'localhost' thành địa chỉ IP LAN của máy tính (ví dụ: 192.168.1.x)
export const API_HOST_VALUE = process.env.EXPO_PUBLIC_API_HOST_REAL_DEVICE ||
  (Platform.OS === 'android' ? '10.0.2.2' : 'localhost');
const API_PORT = process.env.EXPO_PUBLIC_API_PORT || '3001';
export const API_BASE_URL = `http://${API_HOST_VALUE}:${API_PORT}/api`;
export const BASE_URL = `http://${API_HOST_VALUE}:${API_PORT}`;

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
        if (tokens) {
          await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
          await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
        }
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

  static async sendPasswordResetOTP(data: { email: string }): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post<ApiResponse<any>>('/auth/send-password-reset-otp', data);
      return response.data;
    } catch (error: any) {
      return error.response?.data || { success: false, message: 'Lỗi kết nối mạng.' };
    }
  }

  static async verifyRegistrationOTP(data: VerifyRegistrationOTPRequest): Promise<ApiResponse<VerifyRegistrationResponse>> {
    try {
      const response = await apiClient.post<ApiResponse<VerifyRegistrationResponse>>('/auth/verify-registration-otp', data);
      if (response.data.success && response.data.data) {
        const { tokens, user } = response.data.data;
        if (tokens) {
          await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken);
          await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken);
        }
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      }
      return response.data;
    } catch (error: any) {
      return error.response?.data || { success: false, message: 'Lỗi kết nối mạng.' };
    }
  }

  static async resetPasswordWithOTP(data: any): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.post<ApiResponse<any>>('/auth/reset-password-otp', data);
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

  // Fetch profile from server
  static async getProfile(): Promise<ApiResponse<{ user: User }>> {
    try {
      const response = await apiClient.get<ApiResponse<{ user: User }>>('/profile');
      if (response.data.success && response.data.data) {
        // Update cached user data
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data.data.user));
      }
      return response.data;
    } catch (error: any) {
      return error.response?.data || { success: false, message: 'Lỗi kết nối mạng.' };
    }
  }

  // Update basic profile info (name, phone)
  static async updateProfile(data: ProfileUpdateRequest): Promise<ApiResponse<{ user: User }>> {
    try {
      const response = await apiClient.patch<ApiResponse<{ user: User }>>('/profile', data);
      if (response.data.success && response.data.data) {
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data.data.user));
      }
      return response.data;
    } catch (error: any) {
      return error.response?.data || { success: false, message: 'Lỗi cập nhật thông tin.' };
    }
  }

  // Upload avatar
  static async uploadAvatar(imageUri: string): Promise<ApiResponse<AvatarUploadResponse>> {
    try {
      const formData = new FormData();
      formData.append('avatar', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'avatar.jpg',
      } as any);

      const response = await apiClient.post<ApiResponse<AvatarUploadResponse>>(
        '/profile/avatar',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      if (response.data.success && response.data.data) {
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data.data.user));
      }
      return response.data;
    } catch (error: any) {
      return error.response?.data || { success: false, message: 'Lỗi tải lên avatar.' };
    }
  }

  // Change password
  static async changePassword(data: ChangePasswordRequest): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.post<ApiResponse<void>>('/profile/change-password', data);
      return response.data;
    } catch (error: any) {
      return error.response?.data || { success: false, message: 'Lỗi đổi mật khẩu.' };
    }
  }

  // Send OTP for password change
  static async sendPasswordChangeOTP(data: { currentPassword: string }): Promise<ApiResponse<OTPSendResponse>> {
    try {
      const response = await apiClient.post<ApiResponse<OTPSendResponse>>('/profile/password/send-otp', data);
      return response.data;
    } catch (error: any) {
      return error.response?.data || { success: false, message: 'Lỗi gửi OTP.' };
    }
  }

  // Verify OTP and change password
  static async verifyPasswordChangeOTP(data: VerifyPasswordChangeOTPRequest): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.post<ApiResponse<void>>('/profile/password/verify-otp', data);
      return response.data;
    } catch (error: any) {
      return error.response?.data || { success: false, message: 'Lỗi xác nhận OTP.' };
    }
  }

  // Send OTP for email update
  static async sendEmailUpdateOTP(data: SendEmailUpdateOTPRequest): Promise<ApiResponse<OTPSendResponse>> {
    try {
      const response = await apiClient.post<ApiResponse<OTPSendResponse>>('/profile/email/send-otp', data);
      return response.data;
    } catch (error: any) {
      return error.response?.data || { success: false, message: 'Lỗi gửi OTP.' };
    }
  }

  // Verify OTP and update email
  static async verifyEmailUpdate(data: VerifyEmailUpdateRequest): Promise<ApiResponse<OTPVerifyResponse>> {
    try {
      const response = await apiClient.post<ApiResponse<OTPVerifyResponse>>('/profile/email/verify-otp', data);
      if (response.data.success && response.data.data) {
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data.data.user));
      }
      return response.data;
    } catch (error: any) {
      return error.response?.data || { success: false, message: 'Lỗi xác nhận OTP.' };
    }
  }

  // Send OTP for phone update
  static async sendPhoneUpdateOTP(data: SendPhoneUpdateOTPRequest): Promise<ApiResponse<OTPSendResponse>> {
    try {
      const response = await apiClient.post<ApiResponse<OTPSendResponse>>('/profile/phone/send-otp', data);
      return response.data;
    } catch (error: any) {
      return error.response?.data || { success: false, message: 'Lỗi gửi OTP.' };
    }
  }

  // Verify OTP and update phone
  static async verifyPhoneUpdate(data: VerifyPhoneUpdateRequest): Promise<ApiResponse<OTPVerifyResponse>> {
    try {
      const response = await apiClient.post<ApiResponse<OTPVerifyResponse>>('/profile/phone/verify-otp', data);
      if (response.data.success && response.data.data) {
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.data.data.user));
      }
      return response.data;
    } catch (error: any) {
      return error.response?.data || { success: false, message: 'Lỗi xác nhận OTP.' };
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
