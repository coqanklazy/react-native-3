import { useState, useCallback } from 'react';
import { ApiService } from '../services/api';
import { ChangePasswordRequest } from '../types/api';
import { validatePassword } from '../utils/validation';

export interface ChangePasswordState {
  loading: boolean;
  error: string | null;
  success: boolean;
}

export interface UseChangePasswordActions {
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  clearError: () => void;
  reset: () => void;
}

export const useChangePassword = (): ChangePasswordState & UseChangePasswordActions => {
  const [state, setState] = useState<ChangePasswordState>({
    loading: false,
    error: null,
    success: false,
  });

  const changePassword = useCallback(async (currentPassword: string, newPassword: string): Promise<boolean> => {
    // Validation
    if (!currentPassword || currentPassword.trim() === '') {
      setState((prev) => ({
        ...prev,
        error: 'Mật khẩu hiện tại không được để trống',
      }));
      return false;
    }

    const newPasswordValidation = validatePassword(newPassword);
    if (!newPasswordValidation.isValid) {
      setState((prev) => ({
        ...prev,
        error: newPasswordValidation.message || 'Mật khẩu mới không hợp lệ',
      }));
      return false;
    }

    if (currentPassword === newPassword) {
      setState((prev) => ({
        ...prev,
        error: 'Mật khẩu mới phải khác mật khẩu hiện tại',
      }));
      return false;
    }

    setState((prev) => ({ ...prev, loading: true, error: null, success: false }));
    try {
      const data: ChangePasswordRequest = {
        currentPassword,
        newPassword,
      };
      const response = await ApiService.changePassword(data);
      if (response.success) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: null,
          success: true,
        }));
        return true;
      } else {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: response.message || 'Đổi mật khẩu thất bại',
          success: false,
        }));
        return false;
      }
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error.message || 'Lỗi đổi mật khẩu',
        success: false,
      }));
      return false;
    }
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const reset = useCallback(() => {
    setState({
      loading: false,
      error: null,
      success: false,
    });
  }, []);

  return {
    ...state,
    changePassword,
    clearError,
    reset,
  };
};
