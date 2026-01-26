import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  KeyboardTypeOptions,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { NavigationProps } from "../types/navigation";
import { ApiService } from "../services/api";
import { COLORS, SIZES, FONTS, SHADOWS } from "../constants/theme";

interface RegisterScreenProps extends NavigationProps {
  onRegisterSuccess?: () => void;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation, onRegisterSuccess }) => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phoneNumber: "",
    otpCode: "",
  });
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateSendOTP = () => {
    const { email, fullName } = formData;
    if (!email.trim() || !fullName.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập họ tên và email trước khi gửi OTP");
      return false;
    }
    if (!email.includes("@")) {
      Alert.alert("Lỗi", "Email không hợp lệ");
      return false;
    }
    return true;
  };

  const validateForm = () => {
    const { username, email, password, confirmPassword, fullName, otpCode } = formData;

    if (
      !username.trim() ||
      !email.trim() ||
      !password.trim() ||
      !fullName.trim() ||
      !otpCode.trim()
    ) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin bắt buộc và mã OTP");
      return false;
    }

    if (!email.includes("@")) {
      Alert.alert("Lỗi", "Email không hợp lệ");
      return false;
    }

    if (password.length < 6) {
      Alert.alert("Lỗi", "Mật khẩu phải có ít nhất 6 ký tự");
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp");
      return false;
    }

    if (username.length < 3) {
      Alert.alert("Lỗi", "Tên đăng nhập phải có ít nhất 3 ký tự");
      return false;
    }

    return true;
  };

  const handleSendOTP = async () => {
    if (!validateSendOTP()) return;
    setLoading(true);
    try {
      const response = await ApiService.sendRegistrationOTP({
        email: formData.email.trim(),
        fullName: formData.fullName.trim(),
      });
      if (response.success) {
        setOtpSent(true);
        Alert.alert("Thành công", "Mã OTP đã được gửi đến email của bạn");
      } else {
        Alert.alert("Lỗi", response.message || "Gửi OTP thất bại");
      }
    } catch (error) {
      Alert.alert("Lỗi", "Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!otpSent) {
      Alert.alert("Thông báo", "Vui lòng gửi và nhập mã OTP trước khi đăng ký.");
      return;
    }

    if (!validateForm()) return;

    setLoading(true);
    try {
      const { confirmPassword, ...registerData } = formData;
      const response = await ApiService.verifyRegistrationOTP({
        ...registerData,
        username: registerData.username.trim(),
        email: registerData.email.trim(),
        fullName: registerData.fullName.trim(),
        phoneNumber: registerData.phoneNumber.trim() || undefined,
        otpCode: registerData.otpCode.trim(),
      });

      if (response.success) {
        Alert.alert(
          "Thành công",
          "Đăng ký thành công. Đăng nhập ngay nào!",
          [
            {
              text: "OK",
              onPress: () => {
                // Navigate to Login screen for user to login with new account
                // Don't call onRegisterSuccess - let user login manually
                navigation.navigate("Login");
              },
            },
          ]
        );
      } else {
        Alert.alert("Lỗi", response.message || "Đăng ký thất bại");
      }
    } catch (error) {
      Alert.alert("Lỗi", "Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (
    label: string,
    field: keyof typeof formData,
    icon: string,
    placeholder: string,
    options?: {
      secure?: boolean;
      showToggle?: boolean;
      optional?: boolean;
      keyboardType?: KeyboardTypeOptions;
    },
  ) => {
    const value = formData[field];
    const isPasswordField = field === "password" || field === "confirmPassword";

    // Xác định xem có đang hiển thị mật khẩu hay không
    const isCurrentlyVisible = isPasswordField
      ? (field === "password" ? showPassword : showConfirmPassword)
      : true;

    return (
      <View style={styles.inputWrapper}>
        <Text style={styles.inputLabel}>
          {label} {!options?.optional && <Text style={styles.required}>*</Text>}
        </Text>
        <View
          style={[styles.inputContainer, value && styles.inputContainerFocused]}
        >
          <FontAwesome
            name={icon as any}
            size={20}
            color={value ? COLORS.primary : COLORS.textLight}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor={COLORS.textLight}
            value={value}
            onChangeText={(text) => handleInputChange(field, text)}
            secureTextEntry={!!options?.secure && !isCurrentlyVisible}
            autoCapitalize={options?.secure || field === "email" ? "none" : "words"}
            autoCorrect={false}
            spellCheck={false}
            autoComplete={options?.secure ? "off" : undefined}
            textContentType={options?.secure ? (Platform.OS === "ios" ? "oneTimeCode" : "none") : "none"}
            keyboardType={options?.keyboardType || "default"}
            accessibilityLabel={`Nhập ${label.toLowerCase()}`}
          />
          {options?.showToggle && (
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => {
                if (field === "password") setShowPassword(!showPassword);
                else setShowConfirmPassword(!showConfirmPassword);
              }}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={isCurrentlyVisible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              <FontAwesome
                name={isCurrentlyVisible ? "eye" : "eye-slash"}
                size={20}
                color={COLORS.textLight}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
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

        {/* Title Section */}
        <View style={styles.titleSection}>
          <View style={styles.iconCircle}>
            <FontAwesome name="user-plus" size={32} color={COLORS.white} />
          </View>
          <Text style={styles.title}>Đăng Ký</Text>
          <Text style={styles.subtitle}>Tạo tài khoản của bạn</Text>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          {renderInput("Họ và tên", "fullName", "user", "Nguyễn Văn A")}
          {renderInput("Tên đăng nhập", "username", "at", "username123")}
          {renderInput("Email", "email", "envelope", "example@email.com", {
            keyboardType: "email-address",
          })}
          {renderInput("Số điện thoại", "phoneNumber", "phone", "0912345678", {
            optional: true,
            keyboardType: "phone-pad",
          })}
          {renderInput("Mật khẩu", "password", "lock", "••••••••", {
            secure: true,
            showToggle: true,
          })}
          {renderInput(
            "Xác nhận mật khẩu",
            "confirmPassword",
            "lock",
            "••••••••",
            { secure: true, showToggle: true },
          )}
          {otpSent &&
            renderInput("Mã OTP", "otpCode", "key", "Nhập mã OTP", {
              keyboardType: "numeric",
            })}

          {!otpSent && (
            <Text style={styles.helperText}>
              Chúng tôi sẽ gửi mã OTP 6 số đến email của bạn để xác thực đăng ký.
            </Text>
          )}

          {/* Register Button */}
          <TouchableOpacity
            style={[styles.registerButton, loading && styles.disabledButton]}
            onPress={otpSent ? handleRegister : handleSendOTP}
            disabled={loading}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Đăng ký tài khoản"
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <>
                <FontAwesome
                  name={otpSent ? "user-plus" : "paper-plane"}
                  size={20}
                  color={COLORS.white}
                />
                <Text style={styles.registerButtonText}>
                  {otpSent ? "Hoàn tất đăng ký" : "Gửi OTP"}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {otpSent && (
            <TouchableOpacity
              style={styles.resendButton}
              onPress={handleSendOTP}
              disabled={loading}
              activeOpacity={0.75}
            >
              <Text style={styles.resendText}>Gửi lại OTP</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={() => navigation.navigate("Login")}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Chuyển đến trang đăng nhập"
          >
            <Text style={styles.loginText}>
              Đã có tài khoản? <Text style={styles.loginLink}>Đăng nhập</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: SIZES.xl,
  },

  // Header
  header: {
    paddingHorizontal: SIZES.lg,
    paddingTop: SIZES.xl,
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

  // Title Section
  titleSection: {
    alignItems: "center",
    paddingVertical: SIZES.xl,
    paddingHorizontal: SIZES.lg,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: SIZES.radiusFull,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SIZES.lg,
    ...SHADOWS.lg,
  },
  title: {
    ...FONTS.h1,
    color: COLORS.text,
    marginBottom: SIZES.xs,
  },
  subtitle: {
    ...FONTS.body1,
    color: COLORS.textSecondary,
  },

  // Form Card
  formCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SIZES.lg,
    borderRadius: SIZES.radiusXl,
    padding: SIZES.lg,
    ...SHADOWS.xl,
  },
  inputWrapper: {
    marginBottom: SIZES.md,
  },
  inputLabel: {
    ...FONTS.body2,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  required: {
    color: COLORS.error,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.gray50,
    borderRadius: SIZES.radiusMd,
    borderWidth: 2,
    borderColor: COLORS.gray200,
    paddingHorizontal: SIZES.md,
    height: SIZES.inputHeight,
  },
  inputContainerFocused: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.white,
  },
  inputIcon: {
    marginRight: SIZES.sm,
  },
  input: {
    flex: 1,
    ...FONTS.body1,
    color: COLORS.text,
  },
  eyeIcon: {
    padding: SIZES.sm,
  },
  helperText: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
    marginBottom: SIZES.md,
    textAlign: "center",
  },

  // Buttons
  registerButton: {
    backgroundColor: COLORS.primary,
    height: SIZES.buttonLg,
    borderRadius: SIZES.radiusLg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SIZES.sm,
    marginTop: SIZES.md,
    ...SHADOWS.lg,
  },
  disabledButton: {
    opacity: 0.6,
  },
  registerButtonText: {
    ...FONTS.h4,
    color: COLORS.white,
  },
  resendButton: {
    marginTop: SIZES.sm,
    alignSelf: "center",
  },
  resendText: {
    ...FONTS.body2,
    color: COLORS.primary,
    fontWeight: "700",
  },

  // Footer
  footer: {
    alignItems: "center",
    paddingTop: SIZES.xl,
  },
  loginText: {
    ...FONTS.body1,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  loginLink: {
    ...FONTS.body1,
    color: COLORS.primary,
    fontWeight: "700",
  },
});

export default RegisterScreen;
