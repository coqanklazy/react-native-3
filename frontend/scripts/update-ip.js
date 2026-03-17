const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Lấy danh sách tất cả IPv4 đang hoạt động, bỏ qua localhost và các mạng ảo
 */
function getLocalIPs() {
  const interfaces = os.networkInterfaces();
  const foundIPs = [];

  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name]) {
      // Chỉ lấy IPv4 và không phải là loopback (127.0.0.1)
      if (net.family === 'IPv4' && !net.internal) {
        // Bỏ qua dải IP ảo của VirtualBox (thường là 192.168.56.x)
        if (!net.address.startsWith('192.168.56.') && !net.address.startsWith('192.168.99.')) {
          foundIPs.push({
            name: name,
            address: net.address
          });
        }
      }
    }
  }
  return foundIPs;
}

/**
 * Cập nhật file .env với IP chuẩn nhất
 */
function updateEnvFile() {
  const ips = getLocalIPs();
  if (ips.length === 0) {
    console.log('\x1b[31m❌ Không tìm thấy địa chỉ IP LAN nào hợp lệ.\x1b[0m');
    return;
  }

  // Ưu tiên IP WiFi (trên Windows thường có chữ Wi-Fi trong tên interface)
  // Trong trường hợp của bạn, IP đúng là 10.0.149.186
  const bestIP = ips.find(ip => 
    ip.name.toLowerCase().includes('wi-fi') || 
    ip.address.startsWith('10.') || 
    ip.address.startsWith('192.168.1.')
  ) || ips[0];

  const envPath = path.join(__dirname, '..', '.env');
  
  // Đọc file .env cũ nếu có để giữ lại các biến khác
  let envLines = [];
  if (fs.existsSync(envPath)) {
    envLines = fs.readFileSync(envPath, 'utf8').split('\n');
  }

  const newConfig = {
    EXPO_PUBLIC_API_HOST_REAL_DEVICE: bestIP.address,
    EXPO_PUBLIC_API_PORT: '3001',
    EXPO_PUBLIC_DEBUG_API: 'true'
  };

  const updatedKeys = new Set();
  const finalLines = envLines.map(line => {
    const [key] = line.split('=');
    if (newConfig[key]) {
      updatedKeys.add(key);
      return `${key}=${newConfig[key]}`;
    }
    return line;
  }).filter(line => line.trim() !== '');

  // Thêm các key mới nếu chưa có
  Object.keys(newConfig).forEach(key => {
    if (!updatedKeys.has(key)) {
      finalLines.push(`${key}=${newConfig[key]}`);
    }
  });

  try {
    fs.writeFileSync(envPath, finalLines.join('\n') + '\n');
    console.log(`\x1b[32m✅ Cấu hình IP tự động: ${bestIP.address} (Interface: ${bestIP.name})\x1b[0m`);
    return true;
  } catch (err) {
    console.error('❌ Lỗi khi ghi file .env:', err.message);
    return false;
  }
}

updateEnvFile();
