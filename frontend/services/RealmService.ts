import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types/api';
import { STORAGE_KEYS } from './api';

// NOTE: We are using AsyncStorage instead of Realm for compatibility with Expo Go.
// Realm requires a Development Build (Prebuild) and cannot run in the standard Expo Go client.

export const RealmService = {
  // Save user
  saveUser: async (user: User) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user to storage:', error);
    }
  },

  // Get user
  getUser: async (): Promise<User | null> => {
    try {
      const userStr = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error getting user from storage:', error);
      return null;
    }
  },

  // Delete all users (Logout)
  clearUserData: async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
    } catch (error) {
      console.error('Error clearing user data:', error);
    }
  },
};
