import { View, Text, Image } from "react-native";
import { User } from "../types/api";
import { Ionicons } from "@expo/vector-icons";
import { getAvatarUrl } from "../utils/imageHelper";

interface GreetingSectionProps {
  user: User | null;
}

const GreetingSection: React.FC<GreetingSectionProps> = ({ user }) => {
  return (
    <View className="bg-white px-4 py-4 border-b border-gray-100 flex-row items-center">
      <View className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden mr-3">
        {user?.avatarUrl ? (
          <Image
            source={{ uri: getAvatarUrl(user.avatarUrl, true) || '' }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-full items-center justify-center bg-red-100">
            <Ionicons name="person" size={24} color="#DC2626" />
          </View>
        )}
      </View>
      <View>
        <Text className="text-gray-600 text-sm">Xin chào,</Text>
        <Text className="text-gray-900 font-bold text-lg">
          {user?.fullName || "Người dùng"}
        </Text>
      </View>
    </View>
  );
};

export default GreetingSection;
