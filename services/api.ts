import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  LoginRequest,
  RegisterRequest,
  ApiResponse,
  LoginResponse,
  RegisterResponse,
  User,
  OTPSendResponse,
  SendRegistrationOTPRequest,
  VerifyRegistrationOTPRequest,
  VerifyRegistrationResponse,
  PasswordResetOTPRequest,
  ResetPasswordWithOTPRequest,
} from "../types/api";

// API Base URL - thay đổi theo IP máy của bạn
const API_BASE_URL = "http://10.0.187.144:3001/api";

// Tạo axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Storage keys
const STORAGE_KEYS = {
  SESSION_ID: "sessionId",
  USER_DATA: "userData",
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
  USER_TOKEN: "userToken",
};

const setAuthHeader = (token: string | null) => {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common.Authorization;
  }
};

const handleNetworkError = <T>(error: any): ApiResponse<T> => {
  if (error.response?.data) return error.response.data;
  return { success: false, message: "Lỗi kết nối mạng. Vui lòng thử lại." };
};

const persistSession = async (
  sessionId: string,
  user: User,
  accessToken?: string | null,
  refreshToken?: string | null
) => {
  await AsyncStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId);
  await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
  if (accessToken) {
    await AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    await AsyncStorage.setItem(STORAGE_KEYS.USER_TOKEN, accessToken);
  }
  if (refreshToken)
    await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  setAuthHeader(accessToken || null);
};

const clearSession = async () => {
  await AsyncStorage.multiRemove([
    STORAGE_KEYS.SESSION_ID,
    STORAGE_KEYS.USER_DATA,
    STORAGE_KEYS.ACCESS_TOKEN,
    STORAGE_KEYS.REFRESH_TOKEN,
    STORAGE_KEYS.USER_TOKEN,
  ]);
  setAuthHeader(null);
};

export class ApiService {
  // Register user
  static async register(
    data: RegisterRequest
  ): Promise<ApiResponse<RegisterResponse>> {
    try {
      const response = await apiClient.post<ApiResponse<RegisterResponse>>(
        "/auth/register",
        data
      );
      return response.data;
    } catch (error: any) {
      return handleNetworkError<RegisterResponse>(error);
    }
  }

  static async sendRegistrationOTP(
    data: SendRegistrationOTPRequest
  ): Promise<ApiResponse<OTPSendResponse>> {
    try {
      const response = await apiClient.post<ApiResponse<OTPSendResponse>>(
        "/auth/send-registration-otp",
        data
      );
      return response.data;
    } catch (error: any) {
      return handleNetworkError<OTPSendResponse>(error);
    }
  }

  static async verifyRegistrationOTP(
    data: VerifyRegistrationOTPRequest
  ): Promise<ApiResponse<VerifyRegistrationResponse>> {
    try {
      const response = await apiClient.post<ApiResponse<VerifyRegistrationResponse>>(
        "/auth/verify-registration-otp",
        data
      );
      // If registration returns token, persist it
      if (response.data.success && response.data.data) {
        const { user, tokens } = response.data.data;
        await persistSession(
          user?.id.toString() || Date.now().toString(),
          user,
          tokens?.accessToken || null,
          tokens?.refreshToken || null
        );
      }
      return response.data;
    } catch (error: any) {
      return handleNetworkError<VerifyRegistrationResponse>(error);
    }
  }

  // Login user
  static async login(data: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await apiClient.post<ApiResponse<LoginResponse>>(
        "/auth/login",
        data
      );

      if (response.data.success && response.data.data) {
        const { session, user, tokens } = response.data.data;
        await persistSession(
          session.sessionId,
          user,
          tokens?.accessToken || null,
          tokens?.refreshToken || null
        );
      }

      return response.data;
    } catch (error: any) {
      return handleNetworkError<LoginResponse>(error);
    }
  }

  static async sendPasswordResetOTP(
    data: PasswordResetOTPRequest
  ): Promise<ApiResponse<OTPSendResponse>> {
    try {
      const response = await apiClient.post<ApiResponse<OTPSendResponse>>(
        "/auth/send-password-reset-otp",
        data
      );
      return response.data;
    } catch (error: any) {
      return handleNetworkError<OTPSendResponse>(error);
    }
  }

  static async resetPasswordWithOTP(
    data: ResetPasswordWithOTPRequest
  ): Promise<ApiResponse<undefined>> {
    try {
      const response = await apiClient.post<ApiResponse<undefined>>(
        "/auth/reset-password-otp",
        data
      );
      return response.data;
    } catch (error: any) {
      return handleNetworkError<undefined>(error);
    }
  }

  // Check session
  static async checkSession(): Promise<boolean> {
    try {
      const sessionId = await AsyncStorage.getItem(STORAGE_KEYS.SESSION_ID);
      if (!sessionId) return false;

      const response = await apiClient.post("/auth/check-session", {
        sessionId,
      });
      return response.data.success;
    } catch (error) {
      return false;
    }
  }

  // Logout
  static async logout(): Promise<void> {
    try {
      const sessionId = await AsyncStorage.getItem(STORAGE_KEYS.SESSION_ID);
      if (sessionId) {
        await apiClient.post("/auth/logout", { sessionId });
      }
    } catch (error) {
      console.log("Logout error:", error);
    } finally {
      await clearSession();
    }
  }

  // Get current user
  static async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      return null;
    }
  }

  // Get session ID
  static async getSessionId(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.SESSION_ID);
    } catch (error) {
      return null;
    }
  }

  static async getAccessToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    } catch (error) {
      return null;
    }
  }
}
