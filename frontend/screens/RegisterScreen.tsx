import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
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
  });
  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phoneNumber: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const emailRegex =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  const computeErrors = (data: typeof formData) => {
    const nextErrors = {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      phoneNumber: "",
    };

    if (!data.fullName.trim()) {
      nextErrors.fullName = "Vui lòng nhập họ và tên";
    }

    if (!data.username.trim()) {
      nextErrors.username = "Vui lòng nhập tên đăng nhập";
    } else if (data.username.trim().length < 3) {
      nextErrors.username = "Tên đăng nhập phải có ít nhất 3 ký tự";
    }

    if (!data.email.trim()) {
      nextErrors.email = "Vui lòng nhập email";
    } else if (!emailRegex.test(data.email.trim().toLowerCase())) {
      nextErrors.email = "Email không hợp lệ";
    }

    if (!data.password.trim()) {
      nextErrors.password = "Vui lòng nhập mật khẩu";
    } else if (data.password.trim().length < 6) {
      nextErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (!data.confirmPassword.trim()) {
      nextErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (data.confirmPassword !== data.password) {
      nextErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    return nextErrors;
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    const nextData = { ...formData, [field]: value };
    setFormData(nextData);
    // Không validate real-time - chỉ validate khi submit
  };

  const validateSendOTP = () => {
    const validation = computeErrors(formData);
    setErrors(validation);

    const hasError = Object.values(validation).some((message) => message.trim().length > 0);
    return !hasError;
  };

  const handleSendOTP = async () => {
    if (!validateSendOTP()) return;
    setLoading(true);
    try {
      const response = await ApiService.sendRegistrationOTP({
        email: formData.email.trim(),
        fullName: formData.fullName.trim(),
        username: formData.username.trim(),
      });
      if (response.success) {
        // Chuyển hướng đến màn hình nhập OTP
        navigation.navigate("VerifyRegisterOTP", {
          email: formData.email.trim(),
          fullName: formData.fullName.trim(),
          username: formData.username.trim(),
          password: formData.password,
          phoneNumber: formData.phoneNumber.trim() || undefined,
        });
      } else {
        if (response.errors && Array.isArray(response.errors)) {
          const newErrors = { ...errors };
          response.errors.forEach((error: any) => {
            if (error.field && error.message) {
              const field = error.field as keyof typeof errors;
              if (field in newErrors) {
                newErrors[field] = error.message;
              }
            }
          });
          setErrors(newErrors);
        } else {
          const retryInfo = response.retryAfter ? ` (thử lại sau ${response.retryAfter} phút)` : "";
          setErrors({
            ...errors,
            email: `${response.message || "Gửi OTP thất bại"}${retryInfo}`,
          });
        }
      }
    } catch (error: any) {
      if (error.response?.status === 429) {
        const data = error.response.data;
        const message = data.message || "Quá nhiều yêu cầu. Vui lòng thử lại sau.";
        setErrors({ ...errors, email: message });
      } else {
        setErrors({ ...errors, email: "Có lỗi xảy ra. Vui lòng thử lại." });
      }
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
          style={[
            styles.inputContainer,
            value && styles.inputContainerFocused,
            errors[field] && styles.inputContainerError,
          ]}
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
        {!!errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
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

          <Text style={styles.helperText}>
            Chúng tôi sẽ gửi mã OTP 6 số đến email của bạn để xác thực đăng ký.
          </Text>

          {/* Register Button */}
          <TouchableOpacity
            style={[styles.registerButton, loading && styles.disabledButton]}
            onPress={handleSendOTP}
            disabled={loading}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Gửi OTP"
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <>
                <FontAwesome
                  name="paper-plane"
                  size={20}
                  color={COLORS.white}
                />
                <Text style={styles.registerButtonText}>
                  Gửi OTP
                </Text>
              </>
            )}
          </TouchableOpacity>
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
  inputContainerError: {
    borderColor: COLORS.error,
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
  errorText: {
    ...FONTS.body3,
    color: COLORS.error,
    marginTop: SIZES.xs,
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
