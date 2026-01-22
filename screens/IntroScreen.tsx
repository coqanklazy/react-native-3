import React, { useEffect, useRef } from "react";
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  Text,
} from "react-native";
import { NavigationProps } from "../types/navigation";
import { COLORS, SIZES, FONTS, SHADOWS, ANIMATIONS } from "../constants/theme";

const { width } = Dimensions.get("window");

interface IntroScreenProps extends NavigationProps {}

const IntroScreen: React.FC<IntroScreenProps> = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo animation sequence
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: ANIMATIONS.slow,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Progress bar animation
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 10000,
      useNativeDriver: false,
    }).start();

    // Navigate to Welcome after 10 seconds
    const timer = setTimeout(() => {
      navigation.replace("Welcome");
    }, 10000);

    return () => clearTimeout(timer);
  }, [navigation, fadeAnim, scaleAnim, progressAnim]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.container}>
      {/* Logo with vibrant red gradient background */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.logoWrapper}>
          <View style={styles.gradientCircle}>
            <Image
              source={require("../assets/dacsanvietLogo.webp")}
              style={styles.logo}
              resizeMode="contain"
              accessibilityLabel="Đặc Sản Việt Logo"
            />
          </View>
        </View>
        <Text style={styles.welcomeText}>Chào mừng bạn!</Text>
        <Text style={styles.subtitle}>Khám phá đặc sản Việt Nam</Text>
      </Animated.View>

      {/* Progress bar with red theme */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <Animated.View
            style={[styles.progressBar, { width: progressWidth }]}
          />
        </View>
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 120,
  },
  logoWrapper: {
    marginBottom: SIZES.lg,
  },
  gradientCircle: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusXl,
    padding: SIZES.xl,
    ...SHADOWS.xl,
    // Add vibrant red border
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  logo: {
    width: width * 0.5,
    height: width * 0.5,
  },
  welcomeText: {
    ...FONTS.h1,
    color: COLORS.text,
    textAlign: "center",
    marginBottom: SIZES.sm,
  },
  subtitle: {
    ...FONTS.body1,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  progressContainer: {
    position: "absolute",
    bottom: 80,
    width: width * 0.7,
    alignItems: "center",
  },
  progressBackground: {
    width: "100%",
    height: 8,
    backgroundColor: COLORS.gray200,
    borderRadius: SIZES.radiusFull,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusFull,
  },
  loadingText: {
    ...FONTS.body2,
    color: COLORS.textLight,
    marginTop: SIZES.md,
    fontWeight: "500",
  },
});

export default IntroScreen;
