import React from "react";
import { View, Text } from "react-native";

const HomepageFooter: React.FC = () => {
  return (
    <View className="mt-8 items-center pb-8 opacity-50">
      <Text className="text-xs text-gray-400">
        Đặc Sản Việt - Tinh Hoa Quà Việt
      </Text>
      <Text className="text-[10px] text-gray-300 mt-1">
        © 2026 DacSanViet App
      </Text>
    </View>
  );
};

export default HomepageFooter;
