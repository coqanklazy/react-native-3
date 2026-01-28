/**
 * useUser Hook - Custom hook để làm việc với user data
 */

import { useState, useEffect } from 'react';
import { User } from '../types/api';
import { ApiService } from '../services/api';
import { StorageService } from '../utils/storage';

export const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      setLoading(true);
      setError(null);

      const userData = await ApiService.getCurrentUser();
      setUser(userData);
    } catch (err) {
      console.error('Error loading user:', err);
      setError('Không thể tải thông tin người dùng');
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (updatedUser: User) => {
    try {
      await StorageService.updateUser(updatedUser);
      setUser(updatedUser);
    } catch (err) {
      console.error('Error updating user:', err);
      throw err;
    }
  };

  const refreshUser = async () => {
    await loadUser();
  };

  return {
    user,
    loading,
    error,
    updateUser,
    refreshUser,
  };
};
