import React from "react";
import { View, Text } from "react-native";
import { User } from "../types/api";

interface GreetingSectionProps {
  user: User | null;
}

const GreetingSection: React.FC<GreetingSectionProps> = ({ user }) => {
  return (
    <View className="bg-white px-4 py-4 border-b border-gray-100">
      <Text className="text-gray-600 text-sm">Xin chào,</Text>
      <Text className="text-gray-900 font-bold text-lg">
        {user?.fullName || "Người dùng"}
      </Text>
    </View>
  );
};

export default GreetingSection;
