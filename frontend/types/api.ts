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
  avgRating?: number;
  reviewCount?: number;
  commentCount?: number;
  buyerCount?: number;
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

export interface OrderItemRequest {
  productId: number;
  productName: string;
  price: number;
  quantity: number;
  productImage?: string;
}

export interface ShippingAddress {
  fullName: string;
  phoneNumber: string;
  address: string;
  ward: string;
  district: string;
  city: string;
}

export interface CreateOrderRequest {
  items: OrderItemRequest[];
  shippingAddress: ShippingAddress;
  paymentMethod: 'COD' | 'E_WALLET' | 'BANK_TRANSFER';
  couponCode?: string;
  pointsToUse?: number;
  shippingFee?: number;
  note?: string;
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;       // order_number string
  numericId?: number; // bigint PK (orders.id) — used by review API
  userId: number;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: ShippingAddress & { note?: string };
  paymentMethod: string;
  status: 'NEW' | 'CONFIRMED' | 'PREPARING' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED' | 'CANCEL_REQUESTED';
  createdAt: string;
  confirmedAt?: string | null;
  cancelledAt?: string | null;
  deliveredAt?: string | null;  // ISO timestamp, set when status => DELIVERED
  cancelDeadline?: string | null;
  canCancel: boolean;
  isReviewed?: boolean;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  pointsUsed: number;
}

export interface OrdersResponse {
  success: boolean;
  message: string;
  data: Order[];
  pagination: Pagination;
}

// ── Review / Rating ────────────────────────────────────────────
export interface ReviewReward {
  points: number;
  couponCode: string;
  couponDescription: string;
}

export interface Review {
  id: number;
  userId: number;
  productId: number;
  orderId: number;
  rating: number;
  comment?: string;
  userName?: string;
  username?: string;
  createdAt: string;
}

export interface ReviewStats {
  reviewCount: number;
  avgRating: string;
  buyerCount: number;
}

// ── Comment / Q&A ──────────────────────────────────────────────
export interface ProductComment {
  id: number;
  user_id: number;
  user_name: string;
  question: string;
  answer?: string;
  parent_id?: number;
  replies?: ProductComment[];
  user_full_name?: string;
  avatar_url?: string;
  created_at: string;
}

export interface PendingReviewItem {
  productId: number;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
  alreadyReviewed: boolean;
  reviewExpired: boolean;      // true if > 10 days since delivery
  reviewDeadline: string | null;
  daysLeft: number;            // days remaining to review
}

export interface OrderReviewStatus {
  canReview: boolean;
  allReviewed: boolean;
  daysLeft: number | null;
  reviewDeadline: string | null;
  totalItems: number;
  reviewedItems: number;
}

export interface CreateReviewRequest {
  productId: number;
  orderId: number;
  rating: number;
  comment?: string;
}

export interface CreateReviewResponse {
  id: number;
  reward: ReviewReward;
}
