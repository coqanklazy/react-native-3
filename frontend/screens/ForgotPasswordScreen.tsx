import React, { useState, useEffect } from "react";
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
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { NavigationProps } from "../types/navigation";
import { ApiService } from "../services/api";
import { COLORS, SIZES, FONTS, SHADOWS } from "../constants/theme";

interface ForgotPasswordScreenProps extends NavigationProps {}

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0); // 60 giây cooldown

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;

    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [resendCooldown]);

  const validateEmail = () => {
    if (!email.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập email");
      return false;
    }
    if (!email.includes("@")) {
      Alert.alert("Lỗi", "Email không hợp lệ");
      return false;
    }
    return true;
  };

  const validatePasswords = () => {
    if (newPassword.length < 6) {
      Alert.alert("Lỗi", "Mật khẩu phải có ít nhất 6 ký tự");
      return false;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp");
      return false;
    }
    if (!otpCode.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập mã OTP");
      return false;
    }
    return true;
  };

  const handleSendOTP = async () => {
    if (!validateEmail()) return;
    setLoading(true);
    try {
      const response = await ApiService.sendPasswordResetOTP({ email: email.trim() });
      if (response.success) {
        setOtpSent(true);
        setResendCooldown(60); // Bắt đầu cooldown 60 giây
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

  const handleResetPassword = async () => {
    if (!validateEmail() || !validatePasswords()) return;
    setLoading(true);
    try {
      const response = await ApiService.resetPasswordWithOTP({
        email: email.trim(),
        otpCode: otpCode.trim(),
        newPassword,
      });

      if (response.success) {
        Alert.alert("Thành công", "Đặt lại mật khẩu thành công. Đăng nhập ngay.", [
          { text: "OK", onPress: () => navigation.replace("Login") },
        ]);
      } else {
        Alert.alert("Lỗi", response.message || "Đặt lại mật khẩu thất bại");
      }
    } catch (error) {
      Alert.alert("Lỗi", "Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (
    label: string,
    value: string,
    onChange: (text: string) => void,
    icon: string,
    placeholder: string,
    options?: { secure?: boolean; showToggle?: boolean; keyboardType?: string },
  ) => {
    const isPasswordField = options?.secure;
    const showValue = label === "Mật khẩu mới" ? showPassword : label === "Xác nhận mật khẩu" ? showConfirmPassword : false;

    return (
      <View style={styles.inputWrapper}>
        <Text style={styles.inputLabel}>{label}</Text>
        <View style={[styles.inputContainer, value && styles.inputContainerFocused]}>
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
            onChangeText={onChange}
            secureTextEntry={options?.secure && !showValue}
            autoCapitalize={label === "Email" ? "none" : "none"}
            autoCorrect={false}
            keyboardType={(options?.keyboardType as any) || "default"}
          />
          {options?.showToggle && (
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() =>
                label === "Mật khẩu mới"
                  ? setShowPassword(!showPassword)
                  : setShowConfirmPassword(!showConfirmPassword)
              }
              activeOpacity={0.7}
            >
              <FontAwesome
                name={showValue ? "eye" : "eye-slash"}
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
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <FontAwesome name="arrow-left" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.titleSection}>
          <View style={styles.iconCircle}>
            <FontAwesome name="unlock-alt" size={32} color={COLORS.white} />
          </View>
          <Text style={styles.title}>Quên mật khẩu</Text>
          <Text style={styles.subtitle}>
            Nhập email để nhận OTP và đặt lại mật khẩu
          </Text>
        </View>

        <View style={styles.formCard}>
          {!otpSent && renderInput("Email", email, setEmail, "envelope", "example@email.com", {
            keyboardType: "email-address",
          })}

          {otpSent && (
            <>
              <View style={styles.emailInfoSection}>
                <Text style={styles.emailInfoLabel}>Mã OTP đã được gửi đến</Text>
                <Text style={styles.emailInfoText}>{email}</Text>
              </View>
              {renderInput("Mã OTP", otpCode, setOtpCode, "key", "Nhập mã OTP", {
                keyboardType: "number-pad",
              })}
              {renderInput(
                "Mật khẩu mới",
                newPassword,
                setNewPassword,
                "lock",
                "••••••••••",
                { secure: true, showToggle: true },
              )}
              {renderInput(
                "Xác nhận mật khẩu",
                confirmPassword,
                setConfirmPassword,
                "lock",
                "••••••••••",
                { secure: true, showToggle: true },
              )}
            </>
          )}

          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.disabledButton]}
            onPress={otpSent ? handleResetPassword : handleSendOTP}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <>
                <FontAwesome
                  name={otpSent ? "check" : "paper-plane"}
                  size={20}
                  color={COLORS.white}
                />
                <Text style={styles.primaryButtonText}>
                  {otpSent ? "Đặt lại mật khẩu" : "Gửi mã OTP"}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {otpSent && (
            <TouchableOpacity
              style={[
                styles.secondaryButton,
                (loading || resendCooldown > 0) && styles.disabledButton,
              ]}
              onPress={handleSendOTP}
              activeOpacity={0.75}
              disabled={loading || resendCooldown > 0}
            >
              <Text
                style={[
                  styles.secondaryButtonText,
                  (loading || resendCooldown > 0) && styles.disabledButtonText,
                ]}
              >
                {resendCooldown > 0
                  ? `Gửi lại sau ${resendCooldown}s`
                  : "Gửi lại OTP"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity onPress={() => navigation.replace("Login")} activeOpacity={0.7}>
            <Text style={styles.footerText}>
              Nhớ mật khẩu rồi? <Text style={styles.footerLink}>Đăng nhập</Text>
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
    textAlign: "center",
  },
  formCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SIZES.lg,
    borderRadius: SIZES.radiusXl,
    padding: SIZES.lg,
    ...SHADOWS.xl,
  },
  emailInfoSection: {
    backgroundColor: COLORS.gray50,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    marginBottom: SIZES.md,
    alignItems: "center",
  },
  emailInfoLabel: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
    marginBottom: SIZES.xs,
  },
  emailInfoText: {
    ...FONTS.body1,
    color: COLORS.primary,
    fontWeight: "700",
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
  primaryButton: {
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
  secondaryButton: {
    marginTop: SIZES.sm,
    paddingVertical: SIZES.sm,
    alignItems: "center",
  },
  secondaryButtonText: {
    ...FONTS.body1,
    color: COLORS.primary,
    fontWeight: "700",
  },
  disabledButton: {
    opacity: 0.6,
  },
  disabledButtonText: {
    color: COLORS.textLight,
  },
  primaryButtonText: {
    ...FONTS.h4,
    color: COLORS.white,
  },
  footer: {
    alignItems: "center",
    paddingTop: SIZES.xl,
  },
  footerText: {
    ...FONTS.body1,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  footerLink: {
    ...FONTS.body1,
    color: COLORS.primary,
    fontWeight: "700",
  },
});

export default ForgotPasswordScreen;
