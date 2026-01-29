/**
 * AuthProvider - Component cung cấp context xác thực cho toàn bộ ứng dụng
 */

import React, { useState, useEffect, ReactNode } from 'react';
import { AuthContext, initialAuthState, AuthState } from './authStore';
import { User } from '../types/api';
import { StorageService } from '../utils/storage';
import { ApiService } from '../services/api';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await StorageService.getToken();
      const user = await ApiService.getCurrentUser();

      if (token && user) {
        setAuthState({
          isLoggedIn: true,
          isLoading: false,
          currentUser: user,
        });
      } else {
        setAuthState({
          isLoggedIn: false,
          isLoading: false,
          currentUser: null,
        });
      }
    } catch (error) {
      console.log('Error checking auth status:', error);
      setAuthState({
        isLoggedIn: false,
        isLoading: false,
        currentUser: null,
      });
    }
  };

  const login = (user: User) => {
    setAuthState({
      isLoggedIn: true,
      isLoading: false,
      currentUser: user,
    });
  };

  const logout = async () => {
    await StorageService.clearAll();
    setAuthState({
      isLoggedIn: false,
      isLoading: false,
      currentUser: null,
    });
  };

  const updateUser = (user: User) => {
    setAuthState((prev) => ({
      ...prev,
      currentUser: user,
    }));
  };

  const setLoading = (loading: boolean) => {
    setAuthState((prev) => ({
      ...prev,
      isLoading: loading,
    }));
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        updateUser,
        setLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
