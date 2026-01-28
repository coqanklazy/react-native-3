import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Alert,
} from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { NavigationProps } from "../types/navigation";
import { ApiService } from "../services/api";
import { User } from "../types/api";
import BottomTab from "../components/BottomTab";

interface ProfileScreenProps extends NavigationProps {
  onLogout?: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({
  navigation,
  onLogout,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await ApiService.getCurrentUser();
      setCurrentUser(user);
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
          onPress: () => {},
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
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1 p-4"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* User Card */}
        <View className="bg-white rounded-lg shadow-md p-4 mb-4">
          <View className="flex-row items-center mb-4">
            <View className="w-16 h-16 rounded-full bg-red-500 items-center justify-center">
              <FontAwesome name="user" size={32} color="white" />
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-lg font-bold text-gray-800">
                {currentUser?.fullName || "Người dùng"}
              </Text>
              <Text className="text-sm text-gray-500 mt-1">
                @{currentUser?.username}
              </Text>
            </View>
          </View>
          <View className="border-t border-gray-200 pt-4">
            <View className="flex-row items-center mb-3">
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

        {/* Menu Items */}
        <View className="bg-white rounded-lg shadow-sm overflow-hidden">
          <TouchableOpacity
            activeOpacity={0.7}
            className="flex-row items-center p-4 border-b border-gray-100"
          >
            <Ionicons name="document-text" size={24} color="#DC2626" />
            <View className="flex-1 ml-4">
              <Text className="text-base font-semibold text-gray-800">
                Chính sách riêng tư
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            className="flex-row items-center p-4 border-b border-gray-100"
          >
            <Ionicons name="help-circle" size={24} color="#DC2626" />
            <View className="flex-1 ml-4">
              <Text className="text-base font-semibold text-gray-800">
                Trợ giúp và hỗ trợ
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            className="flex-row items-center p-4 border-b border-gray-100"
          >
            <Ionicons name="information-circle" size={24} color="#DC2626" />
            <View className="flex-1 ml-4">
              <Text className="text-base font-semibold text-gray-800">
                Về ứng dụng
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleLogout}
            className="flex-row items-center p-4"
          >
            <Ionicons name="log-out" size={24} color="#EF4444" />
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
          <Text className="text-xs text-gray-400">
            Đặc Sản Việt v1.0.0
          </Text>
          <Text className="text-xs text-gray-400 mt-2">
            © 2025 - Tinh Hoa Quà Việt
          </Text>
        </View>
      </ScrollView>

      {/* 🔽 BOTTOM NAVIGATION */}
      <BottomTab />
    </View>
  );
};

export default ProfileScreen;
