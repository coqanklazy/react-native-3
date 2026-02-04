export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  avatarUrl?: string;
  role: 'ADMIN' | 'STAFF' | 'USER';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  sessionId: string;
  expiresAt: string;
}

export interface LoginRequest {
  emailOrUsername: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  // Optional properties for error handling and rate limit info
  errors?: Array<{ resource?: string; field?: string; message: string }>;
  retryAfter?: number; // minutes or seconds depending on API contract
}

export interface LoginResponse {
  user: User;
  session: Session;
  tokens?: TokenPair;
}

export interface RegisterResponse {
  user: User;
}

export interface VerifyRegistrationResponse {
  user: User;
  tokens: TokenPair;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}



export type SendOTPResponse = OTPSendResponse;

export interface SendRegistrationOTPRequest {
  email: string;
  fullName?: string;
  username: string;
}

export interface VerifyRegistrationOTPRequest {
  email: string;
  otpCode: string;
  username: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
}

export interface PasswordResetOTPRequest {
  email: string;
}

export interface SendOTPRequest {
  email: string;
  fullName: string;
  username: string;
}

export interface ResetPasswordWithOTPRequest {
  email: string;
  otpCode: string;
  newPassword: string;
}

// Profile Management Types
export interface ProfileUpdateRequest {
  fullName?: string;
  phoneNumber?: string;
}

export interface AvatarUploadResponse {
  user: User;
  avatarUrl: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

// Email Update
export interface SendEmailUpdateOTPRequest {
  newEmail: string;
}

export interface VerifyEmailUpdateRequest {
  newEmail: string;
  otpCode: string;
  otpToken: string;
}

// Phone Update
export interface SendPhoneUpdateOTPRequest {
  newPhone: string;
}

export interface VerifyPhoneUpdateRequest {
  newPhone: string;
  otpCode: string;
  otpToken: string;
}

// Password Change (OTP Flow)
export interface SendPasswordChangeOTPRequest {
  currentPassword: string;
}

export interface VerifyPasswordChangeOTPRequest {
  currentPassword: string;
  newPassword: string;
  otpCode: string;
  otpToken: string;
}

export interface OTPSendResponse {
  email: string;
  expiresAt: string;
  expiresIn: string;
  otpToken?: string;
}

export interface OTPVerifyResponse {
  user: User;
  message?: string;
}

// Product Types
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  imageUrl: string;
  rating: number;
  soldCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface ProductFilter {
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  category?: string;
  sort?: 'price_asc' | 'price_desc' | 'newest';
  page?: number;
  limit?: number;
  offset?: number;
}

export interface Pagination {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface ProductListResponse {
  success: boolean;
  data: Product[];
  pagination: Pagination;
}

export interface CategoryItem {
  id: number;
  name: string;
}

export interface CategoryResponse {
  success: boolean;
  data: CategoryItem[];
}

