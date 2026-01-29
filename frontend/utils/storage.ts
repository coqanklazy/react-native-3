/**
 * Storage Service - Helper functions để làm việc với AsyncStorage
 * Centralized storage management cho toàn bộ ứng dụng
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/api';

export const STORAGE_KEYS = {
  SESSION_ID: 'sessionId',
  USER_DATA: 'userData',
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_TOKEN: 'userToken',
} as const;

export class StorageService {
  /**
   * Lưu session sau khi đăng nhập
   */
  static async saveSession(
    sessionId: string,
    user: User,
    accessToken?: string | null,
    refreshToken?: string | null
  ): Promise<void> {
    try {
      const promises = [
        AsyncStorage.setItem(STORAGE_KEYS.SESSION_ID, sessionId),
        AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user)),
      ];

      if (accessToken) {
        promises.push(
          AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken),
          AsyncStorage.setItem(STORAGE_KEYS.USER_TOKEN, accessToken)
        );
      }

      if (refreshToken) {
        promises.push(
          AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken)
        );
      }

      await Promise.all(promises);
    } catch (error) {
      console.error('Error saving session:', error);
      throw error;
    }
  }

  /**
   * Xóa toàn bộ session (đăng xuất)
   */
  static async clearSession(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.SESSION_ID,
        STORAGE_KEYS.USER_DATA,
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER_TOKEN,
      ]);
    } catch (error) {
      console.error('Error clearing session:', error);
      throw error;
    }
  }

  /**
   * Xóa toàn bộ dữ liệu trong storage
   */
  static async clearAll(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing all storage:', error);
      throw error;
    }
  }

  /**
   * Lấy session ID
   */
  static async getSessionId(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.SESSION_ID);
    } catch (error) {
      console.error('Error getting session ID:', error);
      return null;
    }
  }

  /**
   * Lấy user data
   */
  static async getUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  /**
   * Cập nhật user data
   */
  static async updateUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    } catch (error) {
      console.error('Error updating user data:', error);
      throw error;
    }
  }

  /**
   * Lấy access token
   */
  static async getAccessToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  /**
   * Lấy refresh token
   */
  static async getRefreshToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
    } catch (error) {
      console.error('Error getting refresh token:', error);
      return null;
    }
  }

  /**
   * Lấy user token (alias cho access token)
   */
  static async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  /**
   * Lưu access token
   */
  static async saveAccessToken(token: string): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token),
        AsyncStorage.setItem(STORAGE_KEYS.USER_TOKEN, token),
      ]);
    } catch (error) {
      console.error('Error saving access token:', error);
      throw error;
    }
  }

  /**
   * Lưu refresh token
   */
  static async saveRefreshToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
    } catch (error) {
      console.error('Error saving refresh token:', error);
      throw error;
    }
  }

  /**
   * Kiểm tra xem có session không
   */
  static async hasSession(): Promise<boolean> {
    try {
      const sessionId = await StorageService.getSessionId();
      const token = await StorageService.getToken();
      return !!(sessionId || token);
    } catch (error) {
      return false;
    }
  }
}

// Export validation utilities
export * from './validation';

// Export format utilities
export * from './format';


