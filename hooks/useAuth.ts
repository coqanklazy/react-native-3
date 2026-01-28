/**
 * useAuth Hook - Custom hook để sử dụng Auth Context
 * Cung cấp truy cập dễ dàng đến authentication state và actions
 */

import { useContext } from 'react';
import { AuthContext } from '../store/authStore';

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

// Export other hooks
export { useUser } from './useUser';
export { useForm } from './useForm';


