import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  Dimensions,
  BackHandler,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { User } from "../types/api";
import { ApiService } from "../services/api";
import { NavigationProps } from "../types/navigation";
import { COLORS, SIZES, FONTS, SHADOWS } from "../constants/theme";

const { width } = Dimensions.get("window");

interface HomepageScreenProps extends NavigationProps {
  onLogout?: () => void;
}


const HomepageScreen: React.FC<HomepageScreenProps> = ({ navigation, onLogout }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  /* 📝 MOCK DATA
  const userData = {
    name: "Trương Công Anh",
    role: "Sinh viên IT",
    school: "ĐH Công nghệ Kỹ thuật TPHCM",
    age: 20,
    major: "Sinh viên IT",
    field: "Công nghệ thông tin",
    email: "truongconganh5575@gmail.com",
    phone: "+84 123 456 789",
    username: "conganh",
  };

  const skills = [
    { name: "TypeScript/React Native", level: 85, color: "#61DAFB" },
    { name: "JavaScript/ES6+", level: 90, color: "#F7DF1E" },
    { name: "HTML/CSS", level: 88, color: "#E34C26" },
    { name: "Git/GitHub", level: 80, color: "#FF6B14" },
    { name: "Mobile Development", level: 82, color: "#3DDC84" },
  ];

  const interests = [
    "Học lập trình",
    "Phát triển ứng dụng di động",
    "Công nghệ AI",
    "Đọc sách công nghệ",
    "Chơi game",
  ];
  */

  useEffect(() => {
    loadUserData();

    // Prevent back navigation to auth screens
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        // Return true to prevent default back behavior
        // User must use logout button to go back
        Alert.alert(
          "Thoát ứng dụng",
          "Bạn có muốn thoát ứng dụng không?",
          [
            { text: "Hủy", style: "cancel" },
            { text: "Thoát", onPress: () => BackHandler.exitApp() },
          ]
        );
        return true;
      }
    );

    return () => {
      backHandler.remove();
    };
  }, []);

  const loadUserData = async () => {
    try {
      // Check if user is logged in first
      const token = await ApiService.getAccessToken();
      if (!token) {
        console.log("No token found, skipping user data load");
        return;
      }

      const user = await ApiService.getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.log("Error loading user data:", error);
    }
  };

  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          try {
            await ApiService.logout();

            // Wait a bit to ensure AsyncStorage is updated
            await new Promise(resolve => setTimeout(resolve, 100));

            if (onLogout) {
              onLogout();
            }
          } catch (error) {
            console.log("Logout error:", error);
            // Even if error, still call onLogout to navigate away
            if (onLogout) {
              onLogout();
            }
          }
        },
      },
    ]);
  };

  const InfoRow: React.FC<{
    icon: string;
    label: string;
    value: string;
  }> = ({ icon, label, value }) => (
    <View style={styles.infoRow}>
      <View style={styles.infoLeft}>
        <View style={styles.infoIcon}>
          <FontAwesome
            name={icon as any}
            size={16}
            color={COLORS.textLight}
          />
        </View>
        <Text style={styles.infoLabel}>{label}</Text>
      </View>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );

  // If no user data loaded yet, show loading or empty state
  if (!currentUser) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.footerText}>Đang tải thông tin...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Hero Header with Profile */}
      <View style={styles.heroHeader}>
        <View style={styles.heroBackground}>
          <View style={styles.decorCircle1} />
          <View style={styles.decorCircle2} />
        </View>

        <View style={styles.profileSection}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarContainer}>
              <Image
                source={require("../assets/dacsanvietLogo.webp")}
                style={styles.avatar}
                resizeMode="contain"
                accessibilityLabel="Ảnh đại diện người dùng"
              />
            </View>
            <View style={styles.statusBadge}>
              <FontAwesome name="check" size={12} color={COLORS.white} />
            </View>
          </View>

          <Text style={styles.welcomeText}>Xin chào,</Text>
          <Text style={styles.userName}>
            {currentUser?.fullName || "Người dùng"}
          </Text>
          <Text style={styles.userEmail}>
            {currentUser?.email || "user@example.com"}
          </Text>
        </View>
      </View>

      {/* User Info Card */}
      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleWrapper}>
              <FontAwesome name="user" size={20} color={COLORS.primary} />
              <Text style={styles.cardTitle}>Thông Tin Tài Khoản</Text>
            </View>
          </View>

          <View style={styles.cardContent}>
            <InfoRow
              icon="at"
              label="Tên đăng nhập"
              value={currentUser?.username || "N/A"}
            />
            <InfoRow
              icon="envelope"
              label="Email"
              value={currentUser?.email || "N/A"}
            />
            <InfoRow
              icon="phone"
              label="Số điện thoại"
              value={currentUser?.phoneNumber || "Chưa cập nhật"}
            />
            <InfoRow
              icon="shield"
              label="Vai trò"
              value={currentUser?.role || "USER"}
            />
            <InfoRow
              icon={currentUser?.isActive ? "check-circle" : "times-circle"}
              label="Trạng thái"
              value={currentUser?.isActive ? "Hoạt động" : "Không hoạt động"}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Hành động nhanh</Text>

          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionCard}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Cập nhật hồ sơ"
            >
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: COLORS.secondary },
                ]}
              >
                <FontAwesome name="edit" size={24} color={COLORS.white} />
              </View>
              <Text style={styles.actionText}>Cập nhật</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Cài đặt"
            >
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: COLORS.info },
                ]}
              >
                <FontAwesome name="cog" size={24} color={COLORS.white} />
              </View>
              <Text style={styles.actionText}>Cài đặt</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionCard}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Thông báo"
            >
              <View
                style={[
                  styles.actionIcon,
                  { backgroundColor: COLORS.accent },
                ]}
              >
                <FontAwesome name="bell" size={24} color={COLORS.white} />
              </View>
              <Text style={styles.actionText}>Thông báo</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Đăng xuất khỏi tài khoản"
        >
          <FontAwesome name="sign-out" size={20} color={COLORS.white} />
          <Text style={styles.logoutButtonText}>Đăng Xuất</Text>
        </TouchableOpacity>

        {/* Footer */}
        <Text style={styles.footerText}>Đặc Sản Việt © 2026</Text>
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

  // Hero Header
  heroHeader: {
    position: "relative",
    paddingTop: 60,
    paddingBottom: SIZES.xxl + 24,
    overflow: "hidden",
  },
  heroBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 320,
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: SIZES.radiusXl,
    borderBottomRightRadius: SIZES.radiusXl,
    overflow: "hidden",
  },
  decorCircle1: {
    position: "absolute",
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: COLORS.secondary,
    opacity: 0.3,
  },
  decorCircle2: {
    position: "absolute",
    bottom: -30,
    left: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.white,
    opacity: 0.1,
  },

  // Profile Section
  profileSection: {
    alignItems: "center",
    paddingHorizontal: SIZES.lg,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: SIZES.lg,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.white,
    padding: SIZES.md,
    ...SHADOWS.xl,
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  statusBadge: {
    position: "absolute",
    bottom: 5,
    right: 5,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.success,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: COLORS.white,
  },
  welcomeText: {
    ...FONTS.body1,
    color: COLORS.white,
    opacity: 0.9,
  },
  userName: {
    ...FONTS.h2,
    color: COLORS.white,
    marginTop: SIZES.xs,
    marginBottom: SIZES.xs,
    textAlign: "center",
  },
  userEmail: {
    ...FONTS.body2,
    color: COLORS.white,
    opacity: 0.95,
    textAlign: "center",
  },

  // Content
  content: {
    paddingHorizontal: SIZES.lg,
  },

  // Card
  card: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusXl,
    marginTop: SIZES.md,
    ...SHADOWS.xl,
  },
  cardHeader: {
    padding: SIZES.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  cardTitleWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: SIZES.sm,
  },
  cardTitle: {
    ...FONTS.h3,
    color: COLORS.text,
  },
  cardContent: {
    padding: SIZES.lg,
  },

  // Info Row
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  infoLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: SIZES.sm,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: SIZES.radiusSm,
    backgroundColor: COLORS.gray100,
    justifyContent: "center",
    alignItems: "center",
  },
  infoLabel: {
    ...FONTS.body2,
    color: COLORS.textLight,
    flex: 1,
  },
  infoValue: {
    ...FONTS.body1,
    color: COLORS.text,
    textAlign: "right",
  },

  // Actions Section
  actionsSection: {
    marginTop: SIZES.xxl,
  },
  sectionTitle: {
    ...FONTS.h3,
    color: COLORS.text,
    marginBottom: SIZES.md,
  },
  actionsGrid: {
    flexDirection: "row",
    gap: SIZES.md,
  },
  actionCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.lg,
    alignItems: "center",
    ...SHADOWS.md,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: SIZES.radiusMd,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SIZES.sm,
  },
  actionText: {
    ...FONTS.body2,
    color: COLORS.text,
    fontWeight: "600",
    textAlign: "center",
  },

  // Logout Button
  logoutButton: {
    backgroundColor: COLORS.error,
    height: SIZES.buttonLg,
    borderRadius: SIZES.radiusLg,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SIZES.sm,
    marginTop: SIZES.xxl,
    ...SHADOWS.lg,
  },
  logoutButtonText: {
    ...FONTS.h4,
    color: COLORS.white,
  },

  // Footer
  footerText: {
    ...FONTS.body2,
    color: COLORS.textLight,
    textAlign: "center",
    marginTop: SIZES.xl,
    marginBottom: SIZES.xl,
  },
});

export default HomepageScreen;
