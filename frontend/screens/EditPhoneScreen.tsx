import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NavigationProps } from '../types/navigation';
import { useOTP } from '../hooks/useOTP';
import { validatePhoneNumber } from '../utils/validation';

interface EditPhoneScreenProps extends NavigationProps {}

const EditPhoneScreen: React.FC<EditPhoneScreenProps> = ({ navigation }) => {
  const { sendOTP, verifyOTP, resendOTP, reset, loading, error, message, otpSent, timeRemaining, canResend } =
    useOTP();
  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [newPhone, setNewPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [phoneError, setPhoneError] = useState<string | null>(null);

  const handleValidatePhone = () => {
    const validation = validatePhoneNumber(newPhone);
    if (!validation.isValid) {
      setPhoneError(validation.message || '');
      return false;
    }
    setPhoneError(null);
    return true;
  };

  const handleSendOTP = async () => {
    if (!handleValidatePhone()) {
      return;
    }

    const result = await sendOTP('phone', newPhone);
    if (result) {
      setStep('otp');
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpCode || otpCode.length !== 6) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã OTP 6 chữ số');
      return;
    }

    const result = await verifyOTP(otpCode, newPhone, 'phone');
    if (result) {
      Alert.alert(
        'Thành công',
        'Số điện thoại đã được cập nhật thành công',
        [
          {
            text: 'OK',
            onPress: () => {
              reset();
              navigation.goBack();
            },
          },
        ]
      );
    }
  };

  const handleResendOTP = async () => {
    await resendOTP();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="light-content" backgroundColor="#DC2626" />

      {/* Header */}
      <View className="bg-red-600 pt-12 pb-4 px-4 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        <Text className="text-white font-bold text-lg ml-4 flex-1">Đổi số điện thoại</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 p-4"
        contentContainerStyle={{ paddingBottom: 50 }}
      >
        {step === 'input' ? (
          <>
            {/* Step 1: Phone Input */}
            <View className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <View className="flex-row items-center">
                <Ionicons name="information-circle" size={20} color="#1E40AF" />
                <Text className="text-blue-900 text-sm ml-3 flex-1">
                  Nhập số điện thoại mới của bạn. Chúng tôi sẽ gửi mã xác nhận đến email của bạn.
                </Text>
              </View>
            </View>

            {/* Phone Input Field */}
            <View className="mb-5">
              <Text className="text-sm font-semibold text-gray-700 mb-2">Số điện thoại mới</Text>
              <View className={`border rounded-lg px-4 py-3 ${phoneError ? 'border-red-500' : 'border-gray-300'}`}>
                <TextInput
                  onChangeText={setNewPhone}
                  value={newPhone}
                  placeholder="0xxxxxxxxx"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                  editable={!loading}
                  className="text-base text-gray-800"
                />
              </View>
              {phoneError && <Text className="text-red-500 text-xs mt-1">{phoneError}</Text>}
              <Text className="text-xs text-gray-500 mt-1">Định dạng: 0123456789 (10 chữ số)</Text>
            </View>

            {/* Error Message */}
            {error && (
              <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-5">
                <Text className="text-red-700 text-sm">{error}</Text>
              </View>
            )}

            {/* Send OTP Button */}
            <TouchableOpacity
              onPress={handleSendOTP}
              disabled={loading || !newPhone}
              className={`flex-row items-center justify-center p-4 rounded-lg ${
                loading || !newPhone ? 'bg-gray-300' : 'bg-red-600'
              }`}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <Ionicons name="send" size={20} color="white" />
                  <Text className="text-white font-semibold ml-2">Gửi mã OTP</Text>
                </>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Step 2: OTP Verification */}
            <View className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <View className="flex-row items-center">
                <Ionicons name="information-circle" size={20} color="#1E40AF" />
                <Text className="text-blue-900 text-sm ml-3 flex-1">
                  Nhập mã OTP 6 chữ số đã được gửi đến email của bạn.
                </Text>
              </View>
            </View>

            {/* Phone Display */}
            <View className="bg-gray-100 rounded-lg p-4 mb-5">
              <Text className="text-xs text-gray-600">Số điện thoại mới</Text>
              <Text className="text-base font-semibold text-gray-800 mt-1">{newPhone}</Text>
            </View>

            {/* OTP Input Field */}
            <View className="mb-5">
              <Text className="text-sm font-semibold text-gray-700 mb-2">Mã OTP</Text>
              <View className="border border-gray-300 rounded-lg px-4 py-3">
                <TextInput
                  onChangeText={setOtpCode}
                  value={otpCode}
                  placeholder="Nhập 6 chữ số"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="number-pad"
                  maxLength={6}
                  editable={!loading}
                  className="text-base text-gray-800 tracking-widest"
                />
              </View>
            </View>

            {/* Timer */}
            {timeRemaining > 0 && (
              <View className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-5">
                <Text className="text-amber-900 text-sm">
                  Mã OTP hết hạn trong: <Text className="font-bold">{formatTime(timeRemaining)}</Text>
                </Text>
              </View>
            )}

            {/* Error Message */}
            {error && (
              <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-5">
                <Text className="text-red-700 text-sm">{error}</Text>
              </View>
            )}

            {/* Verify Button */}
            <TouchableOpacity
              onPress={handleVerifyOTP}
              disabled={loading || otpCode.length !== 6}
              className={`flex-row items-center justify-center p-4 rounded-lg mb-3 ${
                loading || otpCode.length !== 6 ? 'bg-gray-300' : 'bg-red-600'
              }`}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <Ionicons name="checkmark-done" size={20} color="white" />
                  <Text className="text-white font-semibold ml-2">Xác nhận</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Resend OTP Button */}
            <TouchableOpacity
              onPress={handleResendOTP}
              disabled={!canResend || loading}
              className="flex-row items-center justify-center p-3"
            >
              <Ionicons
                name="refresh-circle"
                size={20}
                color={canResend ? '#DC2626' : '#D1D5DB'}
              />
              <Text className={`font-semibold ml-2 ${canResend ? 'text-red-600' : 'text-gray-400'}`}>
                Gửi lại mã OTP
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default EditPhoneScreen;
