import React from "react";
import { View, TextInput, TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface HomepageHeaderProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  cartCount?: number;
}

const HomepageHeader: React.FC<HomepageHeaderProps> = ({
  searchQuery,
  onSearchChange,
  cartCount = 3,
}) => {
  return (
    <View className="bg-red-600 pt-12 pb-3 px-4 z-50">
      <View className="flex-row items-center gap-3">
        {/* Search Input */}
        <View className="flex-1 bg-white rounded-lg flex-row items-center px-3 py-2">
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            placeholder="Tìm đặc sản vùng miền..."
            className="flex-1 ml-2 text-gray-700 p-0"
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={onSearchChange}
          />
          <TouchableOpacity>
            <Ionicons name="camera-outline" size={22} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Icons */}
        <TouchableOpacity className="relative">
          <Ionicons name="cart-outline" size={26} color="white" />
          <View className="absolute -top-1 -right-1 bg-yellow-400 w-4 h-4 rounded-full items-center justify-center border border-red-600">
            <Text className="text-[10px] font-bold text-red-600">
              {cartCount}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity>
          <Ionicons name="chatbubbles-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomepageHeader;
