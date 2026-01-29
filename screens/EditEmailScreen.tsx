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
import { useOTP } from '../hooks/useOTP';
import { useProfile } from '../hooks/useProfile';
import { isValidEmail } from '../utils/validation';

interface EditEmailScreenProps extends NavigationProps { }

const EditEmailScreen: React.FC<EditEmailScreenProps> = ({ navigation }) => {
  const { user, loadProfile } = useProfile();
  const { sendOTP, verifyOTP, resendOTP, reset, loading, error, message, otpSent, timeRemaining, canResend } = useOTP();

  const [step, setStep] = useState<'input' | 'otp'>('input');
  const [newEmail, setNewEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);

  // Load profile if missing
  useEffect(() => {
    if (!user) {
      loadProfile();
    }
  }, [user, loadProfile]);

  // Reset OTP state on unmount
  useEffect(() => {
    return () => {
      reset();
    };
  }, []);

  const handleValidateEmail = () => {
    if (!newEmail) {
      setEmailError('Vui lòng nhập email mới');
      return false;
    }
    if (!isValidEmail(newEmail)) {
      setEmailError('Email không hợp lệ');
      return false;
    }
    if (user?.email && newEmail.toLowerCase() === user.email.toLowerCase()) {
      setEmailError('Email mới phải khác email hiện tại');
      return false;
    }
    setEmailError(null);
    return true;
  };

  const handleSendOTP = async () => {
    if (!handleValidateEmail()) {
      return;
    }

    // Backend sends OTP to CURRENT email (user.email), but takes newEmail as param
    const result = await sendOTP('email', newEmail);
    if (result) {
      setStep('otp');
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpCode || otpCode.length !== 6) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã OTP 6 chữ số');
      return;
    }

    const result = await verifyOTP(otpCode, newEmail, 'email');
    if (result) {
      Alert.alert(
        'Thành công',
        'Email đã được cập nhật thành công. Vui lòng đăng nhập lại.',
        [
          {
            text: 'OK',
            onPress: () => {
              reset();
              // Navigate to Login or Home? Usually logout is safer after email change
              // For now simpler to go back or handle logout if needed.
              // Given the previous ChangePassword behavior, let's keep it consistent if needed,
              // but standard flow usually just updates.
              navigation.goBack();
            },
          },
        ]
      );
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="light-content" backgroundColor="#DC2626" />

      {/* Header */}
      <View className="bg-red-600 pt-12 pb-4 px-4 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        <Text className="text-white font-bold text-lg ml-4 flex-1">Đổi email</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1 p-4"
          contentContainerStyle={{ paddingBottom: 50 }}
        >
          {step === 'input' ? (
            <>
              {/* Info Box */}
              <View className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <View className="flex-row items-start">
                  <Ionicons name="information-circle" size={20} color="#1E40AF" style={{ marginTop: 2 }} />
                  <View className="ml-3 flex-1">
                    <Text className="text-blue-900 text-sm">
                      Để bảo mật, mã xác nhận (OTP) sẽ được gửi đến email hiện tại của bạn:
                    </Text>
                    <Text className="text-blue-800 font-bold mt-1 text-base">{user?.email || 'Đang tải...'}</Text>
                  </View>
                </View>
              </View>

              {/* Email Input */}
              <View className="mb-6">
                <Text className="text-base font-semibold text-gray-800 mb-2">Email mới</Text>
                <TextInput
                  value={newEmail}
                  onChangeText={(text) => {
                    setNewEmail(text);
                    if (emailError) setEmailError(null);
                  }}
                  placeholder="Nhập địa chỉ email mới"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className={`bg-white border rounded-lg px-4 py-3 text-base text-gray-800 ${emailError ? 'border-red-500' : 'border-gray-300'
                    }`}
                />
                {emailError && (
                  <Text className="text-red-500 text-sm mt-1 ml-1">{emailError}</Text>
                )}
              </View>

              {/* API Error */}
              {error && (
                <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
                  <Text className="text-red-700 text-sm">{error}</Text>
                </View>
              )}

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleSendOTP}
                disabled={loading || !user?.email}
                className={`flex-row items-center justify-center p-4 rounded-lg shadow-sm ${loading || !user?.email ? 'bg-gray-300' : 'bg-red-600'
                  }`}
              >
                {loading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <Ionicons name="send" size={20} color="white" />
                    <Text className="text-white font-semibold ml-2 text-base">Gửi mã OTP</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* OTP Sent Success Msg */}
              <View className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={20} color="#15803d" />
                  <Text className="text-green-900 text-sm ml-3 flex-1">
                    Mã OTP đã được gửi đến <Text className="font-bold">{user?.email}</Text>
                  </Text>
                </View>
              </View>

              {/* OTP Input */}
              <View className="mb-6">
                <Text className="text-base font-semibold text-gray-800 mb-2">Nhập mã xác thực</Text>
                <TextInput
                  onChangeText={(text) => setOtpCode(text)}
                  value={otpCode}
                  placeholder="Nhập 6 số OTP"
                  keyboardType="number-pad"
                  maxLength={6}
                  editable={!loading}
                  className="bg-white border border-gray-300 rounded-lg px-4 py-3 text-base text-gray-800 tracking-widest text-center font-bold"
                />
              </View>

              {/* Error */}
              {error && (
                <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
                  <Text className="text-red-700 text-sm">{error}</Text>
                </View>
              )}

              {/* Verify Button */}
              <TouchableOpacity
                onPress={handleVerifyOTP}
                disabled={loading}
                className={`flex-row items-center justify-center p-4 rounded-lg mb-4 shadow-sm ${loading ? 'bg-gray-300' : 'bg-red-600'
                  }`}
              >
                {loading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <Ionicons name="checkmark-done-circle" size={24} color="white" />
                    <Text className="text-white font-semibold ml-2 text-base">Xác nhận thay đổi</Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Resend Link */}
              <View className="flex-row justify-center items-center mt-2">
                <Text className="text-gray-500 mr-2">Bạn chưa nhận được mã?</Text>
                <TouchableOpacity
                  onPress={() => resendOTP()}
                  disabled={loading || !canResend}
                >
                  <Text className={`font-semibold ${!canResend ? 'text-gray-400' : 'text-red-600'}`}>
                    {!canResend ? `Gửi lại sau ${timeRemaining}s` : 'Gửi lại ngay'}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default EditEmailScreen;
