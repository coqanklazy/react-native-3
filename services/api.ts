import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  LoginRequest,
  RegisterRequest,
  ApiResponse,
  LoginResponse,
  RegisterResponse,
  User,
} from "../types/api";

// API Base URL - thay đổi theo IP máy của bạn
const API_BASE_URL = "http://10.0.244.132:8082/api";

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
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: "Lỗi kết nối mạng. Vui lòng thử lại.",
      };
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
        // Lưu session và user data
        await AsyncStorage.setItem(
          STORAGE_KEYS.SESSION_ID,
          response.data.data.session.sessionId
        );
        await AsyncStorage.setItem(
          STORAGE_KEYS.USER_DATA,
          JSON.stringify(response.data.data.user)
        );
      }

      return response.data;
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data;
      }
      return {
        success: false,
        message: "Lỗi kết nối mạng. Vui lòng thử lại.",
      };
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
      // Xóa dữ liệu local
      await AsyncStorage.removeItem(STORAGE_KEYS.SESSION_ID);
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
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
}
