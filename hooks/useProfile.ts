import { useState, useCallback, useEffect } from 'react';
import { ApiService } from '../services/api';
import { User, ProfileUpdateRequest } from '../types/api';
import { validateFullName, validatePhoneNumber } from '../utils/validation';

export interface ProfileError {
  field?: string;
  message: string;
}

export interface UseProfileState {
  loading: boolean;
  updating: boolean;
  uploading: boolean;
  error: ProfileError | null;
  user: User | null;
}

export interface UseProfileActions {
  loadProfile: () => Promise<void>;
  updateProfile: (data: ProfileUpdateRequest) => Promise<boolean>;
  uploadAvatar: (imageUri: string) => Promise<boolean>;
  clearError: () => void;
  setUser: (user: User | null) => void;
}

export const useProfile = (): UseProfileState & UseProfileActions => {
  const [state, setState] = useState<UseProfileState>({
    loading: false,
    updating: false,
    uploading: false,
    error: null,
    user: null,
  });

  // Init user from storage
  useEffect(() => {
    const loadUserFromStorage = async () => {
      const storedUser = await ApiService.getCurrentUser();
      if (storedUser) {
        setState((prev) => ({ ...prev, user: storedUser }));
      }
    };
    loadUserFromStorage();
  }, []);

  const loadProfile = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await ApiService.getProfile();
      if (response.success && response.data) {
        setState((prev) => ({
          ...prev,
          user: response.data.user,
          loading: false,
          error: null,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: { message: response.message || 'Không thể tải thông tin profile' },
        }));
      }
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: {
          message: error.message || 'Lỗi khi tải thông tin profile',
        },
      }));
    }
  }, []);

  const updateProfile = useCallback(async (data: ProfileUpdateRequest): Promise<boolean> => {
    // Validation
    if (data.fullName) {
      const fullNameValidation = validateFullName(data.fullName);
      if (!fullNameValidation.isValid) {
        setState((prev) => ({
          ...prev,
          error: { field: 'fullName', message: fullNameValidation.message || '' },
        }));
        return false;
      }
    }

    if (data.phoneNumber) {
      const phoneValidation = validatePhoneNumber(data.phoneNumber);
      if (!phoneValidation.isValid) {
        setState((prev) => ({
          ...prev,
          error: { field: 'phoneNumber', message: phoneValidation.message || '' },
        }));
        return false;
      }
    }

    setState((prev) => ({ ...prev, updating: true, error: null }));
    try {
      const response = await ApiService.updateProfile(data);
      if (response.success && response.data) {
        setState((prev) => ({
          ...prev,
          user: response.data.user,
          updating: false,
          error: null,
        }));
        return true;
      } else {
        setState((prev) => ({
          ...prev,
          updating: false,
          error: { message: response.message || 'Cập nhật thất bại' },
        }));
        return false;
      }
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        updating: false,
        error: { message: error.message || 'Lỗi cập nhật thông tin' },
      }));
      return false;
    }
  }, []);

  const uploadAvatar = useCallback(async (imageUri: string): Promise<boolean> => {
    if (!imageUri) {
      setState((prev) => ({
        ...prev,
        error: { message: 'Vui lòng chọn ảnh' },
      }));
      return false;
    }

    setState((prev) => ({ ...prev, uploading: true, error: null }));
    try {
      const response = await ApiService.uploadAvatar(imageUri);
      if (response.success && response.data) {
        setState((prev) => ({
          ...prev,
          user: response.data.user,
          uploading: false,
          error: null,
        }));
        return true;
      } else {
        setState((prev) => ({
          ...prev,
          uploading: false,
          error: { message: response.message || 'Tải ảnh thất bại' },
        }));
        return false;
      }
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        uploading: false,
        error: { message: error.message || 'Lỗi tải ảnh' },
      }));
      return false;
    }
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const setUser = useCallback((user: User | null) => {
    setState((prev) => ({ ...prev, user }));
  }, []);

  return {
    ...state,
    loadProfile,
    updateProfile,
    uploadAvatar,
    clearError,
    setUser,
  };
};
