import { useState, useCallback, useEffect, useRef } from 'react';
import { ApiService } from '../services/api';
import { OTPSendResponse } from '../types/api';
import { validateEmail, validateOTP } from '../utils/validation';

export interface OTPState {
  step: 'idle' | 'sending' | 'verifying';
  loading: boolean;
  error: string | null;
  message: string | null;
  otpSent: boolean;
  timeRemaining: number;
  canResend: boolean;
  otpData: OTPSendResponse | null;
  otpToken: string | null;
}

export interface UseOTPActions {
  sendOTP: (type: 'email' | 'phone', value: string) => Promise<boolean>;
  verifyOTP: (otpCode: string, newValue: string, type: 'email' | 'phone') => Promise<boolean>;
  resendOTP: () => Promise<boolean>;
  reset: () => void;
  clearError: () => void;
}

// Helper to check email validity using the imported validateEmail function
// Updated to match validation.ts export which returns { isValid, message }
const isValidEmail = (email: string) => {
  // Assuming validateEmail returns { isValid: boolean, ... }
  // Check validation.ts to be sure. If validation.ts exports 'isValidEmail' check closely.
  // Based on your view: export const isValidEmail = (email: string): boolean => { ... } is in lines 10-15
  // Wait, I saw two functions in validation.ts:
  // export const isValidEmail = (email: string): boolean => { ... }
  // So I can just use it directly.
  return validateEmailWrapper(email);
};

// Re-implementing wrapper if needed or just import correctly.
// validation.ts has: export const isValidEmail = ...
// So I should import { isValidEmail } instead of validateEmail?
// No, lines 10 says: export const isValidEmail = ...
// But lines 4-6 say: import { validateEmail... } from ...
// Let's check validation.ts again.
// Line 10: export const isValidEmail ...
// Line 163: export const validateRequired ...
// There is NO "validateEmail" export in the previous file view?
// Wait, I see:
// 10: export const isValidEmail = (email: string): boolean => {
// ...
// 139: export const validateOTP = ...
// So "validateEmail" does NOT exist as an export?
// Ah, usually it's named isValidEmail OR validateEmail.
// In the view of validation.ts:
// 10: export const isValidEmail = (email: string): boolean
// So I should import isValidEmail, NOT validateEmail.

// CORRECTION: I will import isValidEmail.

import { isValidEmail as checkEmailValid, validateOTP as checkOTPValid } from '../utils/validation';

export const useOTP = (): OTPState & UseOTPActions => {
  const [state, setState] = useState<OTPState>({
    step: 'idle',
    loading: false,
    error: null,
    message: null,
    otpSent: false,
    timeRemaining: 0,
    canResend: false,
    otpData: null,
    otpToken: null,
  });

  const [pendingValue, setPendingValue] = useState<{ type: 'email' | 'phone'; value: string } | null>(null);
  const countdownInterval = useRef<NodeJS.Timeout | null>(null);

  // Clear interval on unmount
  useEffect(() => {
    return () => {
      if (countdownInterval.current) {
        clearInterval(countdownInterval.current);
      }
    };
  }, []);

  // Countdown logic
  useEffect(() => {
    if (state.timeRemaining > 0 && !countdownInterval.current) {
      countdownInterval.current = setInterval(() => {
        setState((prev) => {
          if (prev.timeRemaining <= 1) {
            if (countdownInterval.current) {
              clearInterval(countdownInterval.current);
              countdownInterval.current = null;
            }
            return { ...prev, timeRemaining: 0, canResend: true };
          }
          return { ...prev, timeRemaining: prev.timeRemaining - 1 };
        });
      }, 1000);
    } else if (state.timeRemaining === 0 && countdownInterval.current) {
      clearInterval(countdownInterval.current);
      countdownInterval.current = null;
    }
  }, [state.timeRemaining]);

  const sendOTP = useCallback(
    async (type: 'email' | 'phone', value: string): Promise<boolean> => {
      // Validation
      if (type === 'email') {
        if (!checkEmailValid(value)) {
          setState((prev) => ({
            ...prev,
            error: 'Email không hợp lệ',
          }));
          return false;
        }
      } else if (type === 'phone') {
        if (!value || value.trim() === '') {
          setState((prev) => ({
            ...prev,
            error: 'Số điện thoại không được để trống',
          }));
          return false;
        }
      }

      setState((prev) => ({ ...prev, loading: true, error: null, message: null }));
      try {
        let response;
        if (type === 'email') {
          response = await ApiService.sendEmailUpdateOTP({ newEmail: value });
        } else {
          response = await ApiService.sendPhoneUpdateOTP({ newPhone: value });
        }

        if (response.success && response.data) {
          setPendingValue({ type, value });

          if (countdownInterval.current) {
            clearInterval(countdownInterval.current);
            countdownInterval.current = null;
          }

          setState((prev) => ({
            ...prev,
            step: 'verifying',
            loading: false,
            otpSent: true,
            otpData: response.data!,
            otpToken: response.data!.otpToken || null,
            timeRemaining: 300,
            canResend: false,
            message: `Mã OTP đã được gửi. Vui lòng kiểm tra ${type === 'email' ? 'email' : 'email'} của bạn`,
            error: null,
          }));
          return true;
        } else {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: response.message || `Gửi OTP thất bại`,
          }));
          return false;
        }
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error.message || 'Lỗi khi gửi OTP',
        }));
        return false;
      }
    },
    []
  );

  const verifyOTP = useCallback(
    async (otpCode: string, newValue: string, type: 'email' | 'phone'): Promise<boolean> => {
      const otpValidation = checkOTPValid(otpCode);
      if (!otpValidation.isValid) {
        setState((prev) => ({
          ...prev,
          error: otpValidation.message || 'Mã OTP không hợp lệ',
        }));
        return false;
      }

      if (!state.otpToken) {
        setState((prev) => ({
          ...prev,
          error: 'Không tìm thấy token xác thực. Vui lòng gửi lại OTP.',
        }));
        return false;
      }

      setState((prev) => ({ ...prev, loading: true, error: null, message: null }));
      try {
        let response;
        if (type === 'email') {
          response = await ApiService.verifyEmailUpdate({
            newEmail: newValue,
            otpCode,
            otpToken: state.otpToken,
          });
        } else {
          response = await ApiService.verifyPhoneUpdate({
            newPhone: newValue,
            otpCode,
            otpToken: state.otpToken,
          });
        }

        if (response.success) {
          if (countdownInterval.current) {
            clearInterval(countdownInterval.current);
            countdownInterval.current = null;
          }

          setState((prev) => ({
            ...prev,
            loading: false,
            error: null,
            step: 'idle',
            otpSent: false,
            timeRemaining: 0,
            message: `Cập nhật ${type === 'email' ? 'email' : 'số điện thoại'} thành công`,
          }));
          setPendingValue(null);
          return true;
        } else {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: response.message || 'Xác nhận OTP thất bại',
          }));
          return false;
        }
      } catch (error: any) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error.message || 'Lỗi xác nhận OTP',
        }));
        return false;
      }
    },
    [state.otpToken]
  );

  const resendOTP = useCallback(async (): Promise<boolean> => {
    if (!pendingValue) return false;
    return sendOTP(pendingValue.type, pendingValue.value);
  }, [pendingValue, sendOTP]);

  const reset = useCallback(() => {
    if (countdownInterval.current) {
      clearInterval(countdownInterval.current);
      countdownInterval.current = null;
    }

    setState({
      step: 'idle',
      loading: false,
      error: null,
      message: null,
      otpSent: false,
      timeRemaining: 0,
      canResend: false,
      otpData: null,
      otpToken: null,
    });
    setPendingValue(null);
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    sendOTP,
    verifyOTP,
    resendOTP,
    reset,
    clearError,
  };
};
