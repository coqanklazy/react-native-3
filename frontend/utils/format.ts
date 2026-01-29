/**
 * Format Utilities - Các hàm helper để format dữ liệu
 */

/**
 * Format số tiền Việt Nam
 * @param amount - Số tiền cần format
 * @returns Chuỗi số tiền đã được format (ví dụ: "1.500.000₫")
 */
export const formatCurrency = (amount: number | string): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) return '0₫';

  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(numAmount);
};

/**
 * Format số điện thoại Việt Nam
 * @param phoneNumber - Số điện thoại cần format
 * @returns Số điện thoại đã được format (ví dụ: "0912 345 678")
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber) return '';

  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');

  // Format: 0912 345 678
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }

  return phoneNumber;
};

/**
 * Format ngày tháng
 * @param date - Date object hoặc ISO string
 * @param format - Format kiểu ('short' | 'long' | 'full')
 * @returns Chuỗi ngày tháng đã được format
 */
export const formatDate = (
  date: Date | string,
  format: 'short' | 'long' | 'full' = 'short'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) return '';

  const options: Intl.DateTimeFormatOptions = {
    short: { day: '2-digit', month: '2-digit', year: 'numeric' },
    long: { day: '2-digit', month: 'long', year: 'numeric' },
    full: {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    },
  }[format];

  return new Intl.DateTimeFormat('vi-VN', options).format(dateObj);
};

/**
 * Format thời gian tương đối (ví dụ: "2 giờ trước")
 * @param date - Date object hoặc ISO string
 * @returns Chuỗi thời gian tương đối
 */
export const formatRelativeTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'Vừa xong';
  if (diffMin < 60) return `${diffMin} phút trước`;
  if (diffHour < 24) return `${diffHour} giờ trước`;
  if (diffDay < 7) return `${diffDay} ngày trước`;

  return formatDate(dateObj, 'short');
};

/**
 * Truncate text với dấu "..."
 * @param text - Text cần cắt
 * @param maxLength - Độ dài tối đa
 * @returns Text đã được cắt
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
};

/**
 * Capitalize first letter của mỗi từ
 * @param text - Text cần capitalize
 * @returns Text đã được capitalize
 */
export const capitalizeWords = (text: string): string => {
  if (!text) return '';
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Format rating (ví dụ: 4.8 → "4.8⭐")
 * @param rating - Số rating
 * @returns Chuỗi rating đã được format
 */
export const formatRating = (rating: number): string => {
  return `${rating.toFixed(1)}⭐`;
};

/**
 * Format số lượng đã bán
 * @param sold - Số lượng đã bán
 * @returns Chuỗi số lượng đã format (ví dụ: "1.2K đã bán")
 */
export const formatSoldCount = (sold: number): string => {
  if (sold < 1000) return `${sold} đã bán`;
  if (sold < 1000000) return `${(sold / 1000).toFixed(1)}K đã bán`;
  return `${(sold / 1000000).toFixed(1)}M đã bán`;
};
