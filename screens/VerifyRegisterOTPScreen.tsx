import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { NavigationProps, RootStackParamList } from "../types/navigation";
import { ApiService } from "../services/api";
import { COLORS, SIZES, FONTS, SHADOWS } from "../constants/theme";

interface VerifyRegisterOTPScreenProps extends NavigationProps {
  route: {
    params: RootStackParamList["VerifyRegisterOTP"];
  };
}

const VerifyRegisterOTPScreen: React.FC<VerifyRegisterOTPScreenProps> = ({
  navigation,
  route,
}) => {
  const { email, fullName, username, password, phoneNumber } = route.params;
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(300); // 5 phút = 300 giây
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [resendTimer]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  const handleOtpChange = (value: string, index: number) => {
    // Chỉ cho phép nhập số
    if (value && !/^\d+$/.test(value)) return;

    const newOtpCode = [...otpCode];
    newOtpCode[index] = value;
    setOtpCode(newOtpCode);

    // Tự động chuyển sang ô tiếp theo
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    // Xử lý phím Backspace
    if (key === "Backspace" && !otpCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;

    setLoading(true);
    try {
      const response = await ApiService.sendRegistrationOTP({
        email,
        fullName,
        username,
      });
      if (response.success) {
        setResendTimer(300);
        setOtpCode(["", "", "", "", "", ""]);
        Alert.alert("Thành công", "Mã OTP mới đã được gửi đến email của bạn");
      } else {
        // Handle new error format: { errors: [{ resource, field, message }] }
        if (response.errors && Array.isArray(response.errors) && response.errors.length > 0) {
          Alert.alert("Lỗi", response.errors[0].message);
        } else {
          Alert.alert("Lỗi", response.message || "Gửi lại OTP thất bại");
        }
      }
    } catch (error) {
      Alert.alert("Lỗi", "Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    const otpString = otpCode.join("");

    if (otpString.length !== 6) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ mã OTP 6 số");
      return;
    }

    setLoading(true);
    try {
      const response = await ApiService.verifyRegistrationOTP({
        username,
        email,
        password,
        fullName,
        phoneNumber,
        otpCode: otpString,
      });

      if (response.success) {
        Alert.alert(
          "Thành công",
          "Đăng ký thành công. Đăng nhập ngay nào!",
          [
            {
              text: "OK",
              onPress: () => {
                navigation.navigate("Login");
              },
            },
          ]
        );
      } else {
        // Handle new error format: { errors: [{ resource, field, message }] }
        if (response.errors && Array.isArray(response.errors) && response.errors.length > 0) {
          Alert.alert("Lỗi", response.errors[0].message);
        } else {
          Alert.alert("Lỗi", response.message || "Xác thực OTP thất bại");
        }
        // Reset OTP inputs on error
        setOtpCode(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      Alert.alert("Lỗi", "Có lỗi xảy ra. Vui lòng thử lại.");
      setOtpCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Quay lại"
          >
            <FontAwesome name="arrow-left" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        {/* Icon Section */}
        <View style={styles.iconSection}>
          <View style={styles.iconCircle}>
            <FontAwesome name="envelope" size={64} color={COLORS.primary} />
          </View>
        </View>

        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Xác thực đăng ký tài khoản</Text>
          <Text style={styles.subtitle}>
            Vui lòng nhập mã OTP đã được gửi đến email để hoàn tất đăng ký
          </Text>
          <TouchableOpacity activeOpacity={0.7}>
            <Text style={styles.emailText}>{email}</Text>
          </TouchableOpacity>
        </View>

        {/* OTP Input Section */}
        <View style={styles.otpSection}>
          <View style={styles.otpContainer}>
            {otpCode.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => { inputRefs.current[index] = ref; }}
                style={[
                  styles.otpInput,
                  digit && styles.otpInputFilled,
                ]}
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                onKeyPress={({ nativeEvent: { key } }) =>
                  handleKeyPress(key, index)
                }
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                textContentType="oneTimeCode"
                accessibilityLabel={`Ô nhập OTP số ${index + 1}`}
              />
            ))}
          </View>

          {/* Timer */}
          {resendTimer > 0 && (
            <Text style={styles.timerText}>
              Gửi lại mã sau: {formatTime(resendTimer)}
            </Text>
          )}
        </View>

        {/* Verify Button */}
        <TouchableOpacity
          style={[styles.verifyButton, loading && styles.disabledButton]}
          onPress={handleVerifyOTP}
          disabled={loading}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Xác thực OTP"
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} size="small" />
          ) : (
            <Text style={styles.verifyButtonText}>Hoàn tất đăng ký</Text>
          )}
        </TouchableOpacity>

        {/* Resend Button */}
        <TouchableOpacity
          style={[
            styles.resendButton,
            (loading || resendTimer > 0) && styles.disabledButton,
          ]}
          onPress={handleResendOTP}
          disabled={loading || resendTimer > 0}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Gửi lại mã OTP"
        >
          <Text
            style={[
              styles.resendText,
              (loading || resendTimer > 0) && styles.disabledText,
            ]}
          >
            Gửi lại mã OTP
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: SIZES.lg,
  },

  // Header
  header: {
    paddingTop: SIZES.xl,
    marginBottom: SIZES.lg,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: SIZES.radiusMd,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.sm,
  },

  // Icon Section
  iconSection: {
    alignItems: "center",
    marginBottom: SIZES.xl,
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: SIZES.radiusFull,
    backgroundColor: COLORS.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    ...SHADOWS.md,
  },

  // Title Section
  titleSection: {
    alignItems: "center",
    marginBottom: SIZES.xl * 1.5,
  },
  title: {
    ...FONTS.h2,
    color: COLORS.text,
    marginBottom: SIZES.md,
    textAlign: "center",
  },
  subtitle: {
    ...FONTS.body1,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: SIZES.sm,
    paddingHorizontal: SIZES.md,
  },
  emailText: {
    ...FONTS.body1,
    color: COLORS.primary,
    fontWeight: "700",
    textAlign: "center",
  },

  // OTP Section
  otpSection: {
    alignItems: "center",
    marginBottom: SIZES.xl,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: SIZES.sm,
    marginBottom: SIZES.md,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderRadius: SIZES.radiusMd,
    borderWidth: 2,
    borderColor: COLORS.gray200,
    backgroundColor: COLORS.white,
    textAlign: "center",
    ...FONTS.h3,
    color: COLORS.text,
    ...SHADOWS.sm,
  },
  otpInputFilled: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  timerText: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
    marginTop: SIZES.sm,
  },

  // Buttons
  verifyButton: {
    backgroundColor: COLORS.primary,
    height: SIZES.buttonLg,
    borderRadius: SIZES.radiusLg,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SIZES.md,
    ...SHADOWS.lg,
  },
  verifyButtonText: {
    ...FONTS.h4,
    color: COLORS.white,
  },
  resendButton: {
    alignSelf: "center",
    paddingVertical: SIZES.sm,
  },
  resendText: {
    ...FONTS.body1,
    color: COLORS.primary,
    fontWeight: "700",
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledText: {
    color: COLORS.textLight,
  },
});

export default VerifyRegisterOTPScreen;
