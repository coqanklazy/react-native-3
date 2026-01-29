/**
 * Auth Store - Quản lý trạng thái xác thực ứng dụng
 * Sử dụng Context API để quản lý state đăng nhập/đăng xuất
 */

import { createContext } from 'react';
import { User } from '../types/api';

export interface AuthState {
  isLoggedIn: boolean;
  isLoading: boolean;
  currentUser: User | null;
}

export interface AuthContextValue extends AuthState {
  login: (user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
}

export const initialAuthState: AuthState = {
  isLoggedIn: false,
  isLoading: true,
  currentUser: null,
};

export const AuthContext = createContext<AuthContextValue>({
  ...initialAuthState,
  login: () => {},
  logout: () => {},
  updateUser: () => {},
  setLoading: () => {},
});

// Export AuthProvider
export { AuthProvider } from './AuthProvider';


