const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

/**
 * Lấy IP IPv4 thực tế từ lệnh ipconfig trên Windows
 */
function findWindowsIP() {
  try {
    const output = execSync('ipconfig', { encoding: 'utf8' });
    const lines = output.split('\n');

    // Ưu tiên tìm các card mạng phổ biến (Wi-Fi hoặc Ethernet)
    for (let line of lines) {
      if (line.includes('IPv4 Address') && !line.includes('127.0.0.1')) {
        const match = line.match(/(\d+\.\d+\.\d+\.\d+)/);
        if (match) return match[0];
      }
    }
  } catch (error) {
    console.error('❌ Lỗi khi thực thi ipconfig:', error.message);
  }
  return null;
}

/**
 * Cập nhật file .env với IP mới
 */
function updateEnvFile(ip) {
  const envPath = path.join(__dirname, '..', '.env');

  // Định nghĩa các giá trị cần ghi
  const config = {
    EXPO_PUBLIC_API_HOST_REAL_DEVICE: ip,
    EXPO_PUBLIC_API_PORT: '3001',
    EXPO_PUBLIC_DEBUG_API: 'true'
  };

  let content = '';
  // Nếu file .env đã tồn tại, chúng ta có thể muốn giữ lại các biến khác,
  // nhưng ở đây tôi sẽ tạo mới/ghi đè để đảm bảo sạch sẽ cho phần IP.
  Object.keys(config).forEach(key => {
    content += `${key}=${config[key]}\n`;
  });

  try {
    fs.writeFileSync(envPath, content);
    return true;
  } catch (err) {
    console.error('❌ Lỗi khi ghi file .env:', err.message);
    return false;
  }
}

// Chạy chính
const ip = findWindowsIP();
if (ip) {
  if (updateEnvFile(ip)) {
    console.log(`\x1b[32m✅ Đã lấy IP từ ipconfig: ${ip}\x1b[0m`);
    console.log(`\x1b[34m🚀 Biến EXPO_PUBLIC_API_HOST_REAL_DEVICE đã được cập nhật.\x1b[0m`);
  }
} else {
  console.log('\x1b[31m❌ Không tìm thấy IP hợp lệ. Vui lòng kiểm tra kết nối mạng.\x1b[0m');
}
