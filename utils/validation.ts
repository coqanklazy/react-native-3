/**
 * Validation Utilities - Các hàm helper để validate dữ liệu
 */

/**
 * Validate email
 * @param email - Email cần validate
 * @returns true nếu email hợp lệ
 */
export const isValidEmail = (email: string): boolean => {
  if (!email) return false;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password
 * @param password - Password cần validate
 * @returns Object chứa kết quả validate và message
 */
export const validatePassword = (password: string): {
  isValid: boolean;
  message?: string;
} => {
  if (!password) {
    return { isValid: false, message: 'Mật khẩu không được để trống' };
  }

  if (password.length < 6) {
    return { isValid: false, message: 'Mật khẩu phải có ít nhất 6 ký tự' };
  }

  if (password.length > 100) {
    return { isValid: false, message: 'Mật khẩu không được quá 100 ký tự' };
  }

  // Optional: Check for strong password
  // const hasUpperCase = /[A-Z]/.test(password);
  // const hasLowerCase = /[a-z]/.test(password);
  // const hasNumber = /[0-9]/.test(password);
  // const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return { isValid: true };
};

/**
 * Validate số điện thoại Việt Nam
 * @param phoneNumber - Số điện thoại cần validate
 * @returns true nếu số điện thoại hợp lệ
 */
export const isValidPhoneNumber = (phoneNumber: string): boolean => {
  if (!phoneNumber) return false;

  // Vietnamese phone number format: 10 digits starting with 0
  const phoneRegex = /^0[0-9]{9}$/;
  const cleaned = phoneNumber.replace(/\D/g, '');

  return phoneRegex.test(cleaned);
};

/**
 * Validate username
 * @param username - Username cần validate
 * @returns Object chứa kết quả validate và message
 */
export const validateUsername = (username: string): {
  isValid: boolean;
  message?: string;
} => {
  if (!username) {
    return { isValid: false, message: 'Tên đăng nhập không được để trống' };
  }

  if (username.length < 3) {
    return { isValid: false, message: 'Tên đăng nhập phải có ít nhất 3 ký tự' };
  }

  if (username.length > 50) {
    return { isValid: false, message: 'Tên đăng nhập không được quá 50 ký tự' };
  }

  // Username should only contain letters, numbers, underscores, and hyphens
  const usernameRegex = /^[a-zA-Z0-9_-]+$/;
  if (!usernameRegex.test(username)) {
    return {
      isValid: false,
      message: 'Tên đăng nhập chỉ được chứa chữ cái, số, gạch dưới và gạch ngang',
    };
  }

  return { isValid: true };
};

/**
 * Validate full name
 * @param fullName - Họ tên cần validate
 * @returns Object chứa kết quả validate và message
 */
export const validateFullName = (fullName: string): {
  isValid: boolean;
  message?: string;
} => {
  if (!fullName) {
    return { isValid: false, message: 'Họ tên không được để trống' };
  }

  if (fullName.length < 2) {
    return { isValid: false, message: 'Họ tên phải có ít nhất 2 ký tự' };
  }

  if (fullName.length > 100) {
    return { isValid: false, message: 'Họ tên không được quá 100 ký tự' };
  }

  return { isValid: true };
};

/**
 * Validate OTP code
 * @param otp - Mã OTP cần validate
 * @returns Object chứa kết quả validate và message
 */
export const validateOTP = (otp: string): {
  isValid: boolean;
  message?: string;
} => {
  if (!otp) {
    return { isValid: false, message: 'Mã OTP không được để trống' };
  }

  if (otp.length !== 6) {
    return { isValid: false, message: 'Mã OTP phải có 6 chữ số' };
  }

  const otpRegex = /^[0-9]{6}$/;
  if (!otpRegex.test(otp)) {
    return { isValid: false, message: 'Mã OTP chỉ được chứa chữ số' };
  }

  return { isValid: true };
};

/**
 * Validate empty field
 * @param value - Giá trị cần validate
 * @param fieldName - Tên field
 * @returns Object chứa kết quả validate và message
 */
export const validateRequired = (
  value: string,
  fieldName: string
): {
  isValid: boolean;
  message?: string;
} => {
  if (!value || value.trim() === '') {
    return { isValid: false, message: `${fieldName} không được để trống` };
  }

  return { isValid: true };
};
