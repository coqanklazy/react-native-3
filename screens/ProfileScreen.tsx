import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
  ActivityIndicator,
  Image,
} from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { NavigationProps } from "../types/navigation";
import { ApiService } from "../services/api";
import { User } from "../types/api";
import { getAvatarUrl } from '../utils/imageHelper';
import BottomTab from "../components/BottomTab";
import AvatarUploadModal from "../components/AvatarUploadModal";
import { useProfile } from "../hooks/useProfile";

interface ProfileScreenProps extends NavigationProps {
  onLogout?: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({
  navigation,
  onLogout,
}) => {
  const { user: profileUser, loadProfile, error: profileError } = useProfile();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditBasicInfo, setShowEditBasicInfo] = useState(false);
  const [showAvatarUpload, setShowAvatarUpload] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [])
  );

  // Update local state when profile user changes
  useEffect(() => {
    if (profileUser) {
      setCurrentUser(profileUser);
    }
  }, [profileUser]);

  const loadUserData = async () => {
    try {
      const user = await ApiService.getCurrentUser();
      setCurrentUser(user);
      // Also fetch from server to ensure latest data
      await loadProfile();
    } catch (error) {
      console.log("Error loading user:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Đăng xuất",
      "Bạn có chắc muốn đăng xuất không?",
      [
        {
          text: "Hủy",
          onPress: () => { },
          style: "cancel",
        },
        {
          text: "Đăng xuất",
          onPress: () => {
            if (onLogout) {
              onLogout();
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleRefresh = async () => {
    setLoading(true);
    await loadUserData();
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 items-center justify-center">
        <Ionicons name="hourglass" size={48} color="#DC2626" />
        <Text className="text-gray-600 mt-4">Đang tải...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="light-content" backgroundColor="#DC2626" />

      {/* Header */}
      <View className="bg-red-600 pt-12 pb-4 px-4 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="white" />
        </TouchableOpacity>
        <Text className="text-white font-bold text-lg">Tài khoản của tôi</Text>
        <TouchableOpacity onPress={handleRefresh}>
          <Ionicons name="refresh" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 p-4"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* User Profile Card */}
        <View className="bg-white rounded-lg shadow-md p-4 mb-4">
          {/* Avatar Section */}
          <View className="items-center mb-6">
            <TouchableOpacity
              onPress={() => setShowAvatarUpload(true)}
              className="relative"
            >
              <View className="w-24 h-24 rounded-full bg-red-500 items-center justify-center overflow-hidden border-4 border-red-50">
                {currentUser?.avatarUrl ? (
                  <Image
                    source={{ uri: getAvatarUrl(currentUser.avatarUrl, true) || '' }}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                ) : (
                  <FontAwesome name="user" size={48} color="white" />
                )}
              </View>
              <View className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2">
                <Ionicons name="camera" size={16} color="white" />
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowAvatarUpload(true)}
              className="mt-3"
            >
              <Text className="text-sm text-red-600 font-semibold">
                Thay đổi ảnh
              </Text>
            </TouchableOpacity>
          </View>

          {/* User Info */}
          <View className="border-t border-gray-200 pt-4">
            <View className="mb-4">
              <Text className="text-xs text-gray-500 uppercase">Thông tin cá nhân</Text>
              <Text className="text-lg font-bold text-gray-800 mt-2">
                {currentUser?.fullName || "Người dùng"}
              </Text>
              <Text className="text-sm text-gray-600 mt-1">
                @{currentUser?.username}
              </Text>
            </View>

            <View className="flex-row items-center mb-3 mt-4">
              <Ionicons name="mail" size={20} color="#DC2626" />
              <Text className="text-sm text-gray-700 ml-3 flex-1">
                {currentUser?.email}
              </Text>
            </View>

            {currentUser?.phoneNumber && (
              <View className="flex-row items-center mb-3">
                <Ionicons name="call" size={20} color="#DC2626" />
                <Text className="text-sm text-gray-700 ml-3 flex-1">
                  {currentUser.phoneNumber}
                </Text>
              </View>
            )}

            <View className="flex-row items-center">
              <Ionicons name="shield-checkmark" size={20} color="#DC2626" />
              <Text className="text-sm text-gray-700 ml-3 flex-1">
                Vai trò: {currentUser?.role || "USER"}
              </Text>
            </View>
          </View>
        </View>

        {/* Settings Menu */}
        <View className="bg-white rounded-lg shadow-sm overflow-hidden mb-4">
          {/* Edit Basic Info */}
          {/* Edit Basic Info */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate("EditName" as never)}
            className="flex-row items-center p-4 border-b border-gray-100"
          >
            <View className="w-10 h-10 rounded-lg bg-blue-100 items-center justify-center">
              <Ionicons name="person" size={20} color="#3B82F6" />
            </View>
            <View className="flex-1 ml-4">
              <Text className="text-base font-semibold text-gray-800">
                Chỉnh sửa tên
              </Text>
              <Text className="text-xs text-gray-500 mt-1">
                Cập nhật họ và tên
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Change Password */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate("ChangePassword" as never)}
            className="flex-row items-center p-4 border-b border-gray-100"
          >
            <View className="w-10 h-10 rounded-lg bg-purple-100 items-center justify-center">
              <Ionicons name="lock-closed" size={20} color="#A855F7" />
            </View>
            <View className="flex-1 ml-4">
              <Text className="text-base font-semibold text-gray-800">
                Đổi mật khẩu
              </Text>
              <Text className="text-xs text-gray-500 mt-1">
                Cập nhật mật khẩu của bạn
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Change Email */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate("EditEmail" as never)}
            className="flex-row items-center p-4 border-b border-gray-100"
          >
            <View className="w-10 h-10 rounded-lg bg-green-100 items-center justify-center">
              <Ionicons name="mail" size={20} color="#10B981" />
            </View>
            <View className="flex-1 ml-4">
              <Text className="text-base font-semibold text-gray-800">
                Đổi email
              </Text>
              <Text className="text-xs text-gray-500 mt-1">
                Cập nhật email của bạn
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Change Phone */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate("EditPhone" as never)}
            className="flex-row items-center p-4 border-b border-gray-100"
          >
            <View className="w-10 h-10 rounded-lg bg-orange-100 items-center justify-center">
              <Ionicons name="call" size={20} color="#F97316" />
            </View>
            <View className="flex-1 ml-4">
              <Text className="text-base font-semibold text-gray-800">
                Đổi số điện thoại
              </Text>
              <Text className="text-xs text-gray-500 mt-1">
                Cập nhật số điện thoại
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Privacy Policy */}
          <TouchableOpacity
            activeOpacity={0.7}
            className="flex-row items-center p-4 border-b border-gray-100"
          >
            <View className="w-10 h-10 rounded-lg bg-indigo-100 items-center justify-center">
              <Ionicons name="document-text" size={20} color="#6366F1" />
            </View>
            <View className="flex-1 ml-4">
              <Text className="text-base font-semibold text-gray-800">
                Chính sách riêng tư
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Help & Support */}
          <TouchableOpacity
            activeOpacity={0.7}
            className="flex-row items-center p-4 border-b border-gray-100"
          >
            <View className="w-10 h-10 rounded-lg bg-cyan-100 items-center justify-center">
              <Ionicons name="help-circle" size={20} color="#06B6D4" />
            </View>
            <View className="flex-1 ml-4">
              <Text className="text-base font-semibold text-gray-800">
                Trợ giúp và hỗ trợ
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* About App */}
          {/* About App */}
          <TouchableOpacity
            activeOpacity={0.7}
            className="flex-row items-center p-4 border-b border-gray-100"
          >
            <View className="w-10 h-10 rounded-lg bg-teal-100 items-center justify-center">
              <Ionicons name="information-circle" size={20} color="#14B8A6" />
            </View>
            <View className="flex-1 ml-4">
              <Text className="text-base font-semibold text-gray-800">
                Về ứng dụng
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Logout */}
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleLogout}
            className="flex-row items-center p-4"
          >
            <View className="w-10 h-10 rounded-lg bg-red-100 items-center justify-center">
              <Ionicons name="log-out" size={20} color="#EF4444" />
            </View>
            <View className="flex-1 ml-4">
              <Text className="text-base font-semibold text-red-600">
                Đăng xuất
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View className="items-center mt-8 mb-4">
          <Text className="text-xs text-gray-400">Đặc Sản Việt v1.0.0</Text>
          <Text className="text-xs text-gray-400 mt-2">
            © 2025 - Tinh Hoa Quà Việt
          </Text>
        </View>
      </ScrollView>

      {/* Modals */}
      <AvatarUploadModal
        visible={showAvatarUpload}
        onClose={() => setShowAvatarUpload(false)}
        onSuccess={loadUserData}
        currentAvatarUrl={currentUser?.avatarUrl}
      />

      {/* Bottom Navigation */}
      <BottomTab />
    </View>
  );
};

export default ProfileScreen;
