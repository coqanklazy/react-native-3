import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";

const BottomTab: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute();

  const tabs = [
    {
      name: "Homepage",
      icon: "home",
      iconOutline: "home-outline",
      label: "Trang chủ",
      enabled: true,
    },
    {
      name: "Cart",
      icon: "bag-handle",
      iconOutline: "bag-handle-outline",
      label: "Ưu đãi",
      enabled: false,
    },
    {
      name: "Favorites",
      icon: "heart",
      iconOutline: "heart-outline",
      label: "Yêu thích",
      enabled: false,
    },
    {
      name: "Profile",
      icon: "person",
      iconOutline: "person-outline",
      label: "Tài khoản",
      enabled: true,
    },
  ];

  return (
    <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-2 pt-1">
      <View className="flex-row justify-around items-center">
        {tabs.map((tab) => {
          const isActive = route.name === tab.name;

          return (
            <TouchableOpacity
              key={tab.name}
              className="items-center justify-center flex-1 py-2"
              onPress={() => {
                if (tab.enabled && route.name !== tab.name) {
                  navigation.navigate(tab.name);
                }
              }}
              activeOpacity={tab.enabled ? 0.7 : 1}
            >
              <Ionicons
                name={(isActive ? tab.icon : tab.iconOutline) as any}
                size={28}
                color={isActive ? "#DC2626" : "#6B7280"}
              />

              <Text
                className={`text-[11px] mt-1 ${
                  isActive ? "text-gray-900 font-semibold" : "text-gray-500"
                }`}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default BottomTab;


