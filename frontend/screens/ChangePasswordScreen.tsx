import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NavigationProps } from '../types/navigation';
import { ApiService } from '../services/api';
import { useProfile } from '../hooks/useProfile';

interface ChangePasswordScreenProps extends NavigationProps { }

const ChangePasswordScreen: React.FC<ChangePasswordScreenProps> = ({ navigation }) => {
  const { user, loadProfile } = useProfile();
  const [step, setStep] = useState<'input_current' | 'verify'>('input_current');
  const [loading, setLoading] = useState(false);

  // Initialize user data
  useEffect(() => {
    if (!user) {
      loadProfile();
    }
  }, [user, loadProfile]);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpToken, setOtpToken] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Timer for cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => setResendCooldown(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [resendCooldown]);

  const handleSendOTP = async () => {
    if (!currentPassword) {
      setError('Vui lòng nhập mật khẩu hiện tại');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Use the Profile controller's password change OTP endpoint
      const response = await ApiService.sendPasswordChangeOTP({ currentPassword });
      if (response.success && response.data?.otpToken) {
        setOtpToken(response.data.otpToken);
        setStep('verify');
        setResendCooldown(60);
        Alert.alert('Thông báo', `Mã OTP đã được gửi đến email ${response.data.email}`);
      } else {
        setError(response.message || 'Gửi OTP thất bại');
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối mạng');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndChange = async () => {
    if (otpCode.length !== 6) {
      setError('Vui lòng nhập mã OTP 6 chữ số');
      return;
    }
    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await ApiService.verifyPasswordChangeOTP({
        currentPassword,
        newPassword,
        otpCode,
        otpToken // Pass the JWT token for verification
      });

      if (response.success) {
        Alert.alert(
          'Thành công',
          'Đổi mật khẩu thành công.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        setError(response.message || 'Đổi mật khẩu thất bại');
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối mạng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {/* Header */}
      <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-800">Đổi mật khẩu</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          {/* Info Section */}
          <View className="items-center mb-8">
            <View className="w-20 h-20 rounded-full bg-orange-100 items-center justify-center mb-3">
              <Ionicons name="lock-closed" size={32} color="#FF6B00" />
            </View>
            <Text className="text-gray-500 text-center px-4">
              {step === 'input_current'
                ? 'Nhập mật khẩu hiện tại để xác thực trước khi thay đổi.'
                : `Nhập mã OTP đã gửi đến ${user?.email || 'email'} và thiết lập mật khẩu mới.`}
            </Text>
          </View>

          {error && (
            <View className="bg-red-50 p-3 rounded-lg mb-4 flex-row items-center">
              <Ionicons name="alert-circle" size={20} color="#EF4444" />
              <Text className="text-red-500 ml-2 flex-1">{error}</Text>
            </View>
          )}

          {step === 'input_current' ? (
            <View>
              <Text className="text-gray-700 font-medium mb-1">Mật khẩu hiện tại</Text>
              <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-lg h-12 px-3 mb-6">
                <Ionicons name="key-outline" size={20} color="#9CA3AF" />
                <TextInput
                  className="flex-1 ml-2 text-gray-800 h-full"
                  placeholder="Nhập mật khẩu hiện tại"
                  secureTextEntry={!showCurrentPassword}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowCurrentPassword(!showCurrentPassword)}>
                  <Ionicons name={showCurrentPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                className={`h-12 rounded-full items-center justify-center mt-4 ${!currentPassword || loading ? 'bg-gray-300' : 'bg-[#FF6B00]'}`}
                onPress={handleSendOTP}
                disabled={!currentPassword || loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold text-base">Tiếp tục</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              {/* OTP Input */}
              <Text className="text-gray-700 font-medium mb-1">Mã OTP</Text>
              <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-lg h-12 px-3 mb-4">
                <Ionicons name="chatbubble-ellipses-outline" size={20} color="#9CA3AF" />
                <TextInput
                  className="flex-1 ml-2 text-gray-800 h-full"
                  placeholder="Nhập mã 6 số"
                  keyboardType="numeric"
                  maxLength={6}
                  value={otpCode}
                  onChangeText={setOtpCode}
                />
              </View>

              {/* New Password */}
              <Text className="text-gray-700 font-medium mb-1">Mật khẩu mới</Text>
              <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-lg h-12 px-3 mb-4">
                <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
                <TextInput
                  className="flex-1 ml-2 text-gray-800 h-full"
                  placeholder="Mật khẩu mới (tối thiểu 6 ký tự)"
                  secureTextEntry={!showNewPassword}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                  <Ionicons name={showNewPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {/* Confirm Password */}
              <Text className="text-gray-700 font-medium mb-1">Xác nhận mật khẩu mới</Text>
              <View className="flex-row items-center bg-gray-50 border border-gray-200 rounded-lg h-12 px-3 mb-6">
                <Ionicons name="checkmark-circle-outline" size={20} color="#9CA3AF" />
                <TextInput
                  className="flex-1 ml-2 text-gray-800 h-full"
                  placeholder="Nhập lại mật khẩu mới"
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} size={20} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                className={`h-12 rounded-full items-center justify-center mt-2 ${loading ? 'bg-gray-300' : 'bg-[#FF6B00]'}`}
                onPress={handleVerifyAndChange}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold text-base">Đổi mật khẩu</Text>
                )}
              </TouchableOpacity>

              {/* Resend OTP */}
              <View className="flex-row justify-center mt-6">
                <Text className="text-gray-500">Chưa nhận được mã? </Text>
                {resendCooldown > 0 ? (
                  <Text className="text-gray-400">Gửi lại sau {resendCooldown}s</Text>
                ) : (
                  <TouchableOpacity onPress={handleSendOTP}>
                    <Text className="text-[#FF6B00] font-medium">Gửi lại</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ChangePasswordScreen;
