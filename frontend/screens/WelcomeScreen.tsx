import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  ScrollView,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { NavigationProps } from '../types/navigation';
import { COLORS, SIZES, FONTS, SHADOWS } from '../constants/theme';

const { width, height } = Dimensions.get('window');

interface WelcomeScreenProps extends NavigationProps {}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ navigation }) => {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Section with vibrant red theme */}
      <View style={styles.hero}>
        <View style={styles.logoCard}>
          <Image
            source={require('../assets/dacsanvietLogo.webp')}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="Đặc Sản Việt Logo"
          />
        </View>
        <Text style={styles.heroTitle}>Đặc Sản Việt</Text>
        <Text style={styles.heroSubtitle}>
          Khám phá hương vị đặc sản Việt Nam{'\n'}ngay trên điện thoại của bạn
        </Text>
      </View>

      {/* Features Section - Vibrant block style */}
      <View style={styles.featuresSection}>
        <View style={styles.featureCard}>
          <View style={[styles.featureIconWrapper, { backgroundColor: COLORS.primary }]}>
            <FontAwesome
              name="cutlery"
              size={24}
              color={COLORS.white}
              accessibilityLabel="Món ngon icon"
            />
          </View>
          <Text style={styles.featureTitle}>Món Ngon</Text>
          <Text style={styles.featureDesc}>Đặc sản từ khắp vùng miền</Text>
        </View>

        <View style={styles.featureCard}>
          <View style={[styles.featureIconWrapper, { backgroundColor: COLORS.accent }]}>
            <FontAwesome
              name="heart"
              size={24}
              color={COLORS.white}
              accessibilityLabel="Chất lượng icon"
            />
          </View>
          <Text style={styles.featureTitle}>Chất Lượng</Text>
          <Text style={styles.featureDesc}>Sản phẩm chính gốc</Text>
        </View>

        <View style={styles.featureCard}>
          <View style={[styles.featureIconWrapper, { backgroundColor: COLORS.secondary }]}>
            <FontAwesome
              name="truck"
              size={24}
              color={COLORS.white}
              accessibilityLabel="Giao hàng icon"
            />
          </View>
          <Text style={styles.featureTitle}>Giao Nhanh</Text>
          <Text style={styles.featureDesc}>Vận chuyển toàn quốc</Text>
        </View>
      </View>

      {/* CTA Buttons - Bold and prominent */}
      <View style={styles.ctaSection}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Đăng nhập vào tài khoản"
        >
          <FontAwesome name="sign-in" size={20} color={COLORS.white} />
          <Text style={styles.primaryButtonText}>Đăng Nhập</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('Register')}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Tạo tài khoản mới"
        >
          <FontAwesome name="user-plus" size={20} color={COLORS.primary} />
          <Text style={styles.secondaryButtonText}>Đăng Ký Ngay</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.textButton}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.6}
          accessibilityRole="button"
          accessibilityLabel="Tiếp tục không đăng nhập"
        >
          <Text style={styles.textButtonText}>Khám phá ngay →</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
  },

  // Hero Section
  hero: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: SIZES.xxl,
    paddingHorizontal: SIZES.lg,
  },
  logoCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusXl,
    padding: SIZES.xl,
    marginBottom: SIZES.xl,
    borderWidth: 4,
    borderColor: COLORS.primary,
    ...SHADOWS.xl,
  },
  logo: {
    width: width * 0.35,
    height: width * 0.35,
  },
  heroTitle: {
    ...FONTS.h1,
    color: COLORS.primary,
    marginBottom: SIZES.sm,
    textAlign: 'center',
  },
  heroSubtitle: {
    ...FONTS.body1,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },

  // Features Section - Vibrant block style
  featuresSection: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.lg,
    gap: SIZES.md,
  },
  featureCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.md,
    alignItems: 'center',
    ...SHADOWS.md,
  },
  featureIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: SIZES.radiusMd,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  featureTitle: {
    ...FONTS.h4,
    color: COLORS.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  featureDesc: {
    ...FONTS.caption,
    color: COLORS.textLight,
    textAlign: 'center',
  },

  // CTA Section
  ctaSection: {
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.xxl,
    gap: SIZES.md,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    height: SIZES.buttonLg,
    borderRadius: SIZES.radiusLg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.sm,
    ...SHADOWS.lg,
  },
  primaryButtonText: {
    ...FONTS.h4,
    color: COLORS.white,
  },
  secondaryButton: {
    backgroundColor: COLORS.white,
    height: SIZES.buttonLg,
    borderRadius: SIZES.radiusLg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.sm,
    borderWidth: 2,
    borderColor: COLORS.primary,
    ...SHADOWS.sm,
  },
  secondaryButtonText: {
    ...FONTS.h4,
    color: COLORS.primary,
  },
  textButton: {
    alignItems: 'center',
    paddingVertical: SIZES.md,
  },
  textButtonText: {
    ...FONTS.body1,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
});

export default WelcomeScreen;


