import React from "react";
import { View, ScrollView, Image, Text } from "react-native";

const BannerSlider: React.FC = () => {
  return (
    <View className="h-40 bg-white mb-2">
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
      >
        <Image
          source={require("../assets/dacsanvietLogo.webp")}
          className="w-screen h-40"
          resizeMode="cover"
        />
        <View className="w-screen h-40 bg-red-100 items-center justify-center">
          <Text className="text-red-500 font-bold text-lg">
            Đại Tiệc Sale Đặc Sản
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default BannerSlider;
