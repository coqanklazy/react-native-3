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
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { NavigationProps } from "../types/navigation";
import { ApiService } from "../services/api";
import { COLORS, SIZES, FONTS, SHADOWS } from "../constants/theme";

interface LoginScreenProps extends NavigationProps {
  onLoginSuccess?: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation, onLoginSuccess }) => {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!emailOrUsername.trim() || !password.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin");
      return;
    }

    setLoading(true);
    try {
      const response = await ApiService.login({
        emailOrUsername: emailOrUsername.trim(),
        password,
      });

      if (response.success) {
        Alert.alert("Thành công", "Đăng nhập thành công!", [
          {
            text: "OK",
            onPress: () => {
              if (onLoginSuccess) {
                onLoginSuccess();
                // onLoginSuccess will handle navigation reset to Homepage
                // No need to call navigation.replace here
              }
            },
          },
        ]);
      } else {
        Alert.alert("Lỗi", response.message || "Đăng nhập thất bại");
      }
    } catch (error) {
      Alert.alert("Lỗi", "Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
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
        {/* Header with back button */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              }
              // If can't go back, do nothing (don't trigger error)
            }}
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
            <FontAwesome name="sign-in" size={32} color={COLORS.white} />
          </View>
          <Text style={styles.title}>Đăng Nhập</Text>
          <Text style={styles.subtitle}>Chào mừng bạn trở lại!</Text>
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          {/* Email/Username Input */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Email hoặc Username</Text>
            <View
              style={[
                styles.inputContainer,
                emailOrUsername && styles.inputContainerFocused,
              ]}
            >
              <FontAwesome
                name="user"
                size={20}
                color={emailOrUsername ? COLORS.primary : COLORS.textLight}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="example@email.com"
                placeholderTextColor={COLORS.textLight}
                value={emailOrUsername}
                onChangeText={setEmailOrUsername}
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
                accessibilityLabel="Nhập email hoặc username"
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Mật khẩu</Text>
            <View
              style={[
                styles.inputContainer,
                password && styles.inputContainerFocused,
              ]}
            >
              <FontAwesome
                name="lock"
                size={20}
                color={password ? COLORS.primary : COLORS.textLight}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={COLORS.textLight}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
                autoComplete="off"
                textContentType={Platform.OS === "ios" ? "oneTimeCode" : "none"}
                keyboardType="default"
                accessibilityLabel="Nhập mật khẩu"
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={
                  showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                }
              >
                <FontAwesome
                  name={showPassword ? "eye" : "eye-slash"}
                  size={20}
                  color={COLORS.textLight}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.forgotButton}
            onPress={() => navigation.navigate("ForgotPassword")}
            activeOpacity={0.7}
          >
            <Text style={styles.forgotText}>Quên mật khẩu?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, loading && styles.disabledButton]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Đăng nhập"
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} size="small" />
            ) : (
              <>
                <FontAwesome name="sign-in" size={20} color={COLORS.white} />
                <Text style={styles.loginButtonText}>Đăng Nhập</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={() => navigation.navigate("Register")}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Chuyển đến trang đăng ký"
          >
            <Text style={styles.registerText}>
              Chưa có tài khoản?{" "}
              <Text style={styles.registerLink}>Đăng ký ngay</Text>
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
    paddingVertical: SIZES.xxl,
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
    marginBottom: SIZES.lg,
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
  forgotButton: {
    alignSelf: "flex-end",
    marginTop: SIZES.sm,
  },
  forgotText: {
    ...FONTS.body2,
    color: COLORS.primary,
    fontWeight: "500",
  },

  // Buttons
  loginButton: {
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
  loginButtonText: {
    ...FONTS.h4,
    color: COLORS.white,
  },

  // Footer
  footer: {
    alignItems: "center",
    paddingTop: SIZES.xxl,
  },
  registerText: {
    ...FONTS.body1,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  registerLink: {
    ...FONTS.body1,
    color: COLORS.primary,
    fontWeight: "700",
  },
});

export default LoginScreen;
