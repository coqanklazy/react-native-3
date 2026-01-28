import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { Product } from "../types/product";

interface ProductCardProps {
  item: Product;
  isGrid?: boolean;
  onPress?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  item,
  isGrid = true,
  onPress,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      className={`bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mb-3 ${
        isGrid ? "flex-1 m-1" : "w-40 mr-3"
      }`}
      onPress={onPress}
    >
      <View className="relative">
        <Image
          source={item.image}
          className="w-full h-36 bg-gray-50"
          resizeMode="cover"
        />
        {item.discount && (
          <View className="absolute top-0 right-0 bg-yellow-400 px-2 py-1 rounded-bl-lg">
            <Text className="text-xs font-bold text-red-600">
              {item.discount}
            </Text>
          </View>
        )}
      </View>

      <View className="p-2">
        <Text
          numberOfLines={2}
          className="text-sm text-gray-800 mb-1 leading-5 h-10"
        >
          {item.name}
        </Text>

        <View className="flex-row items-center justify-between mb-1">
          <Text className="text-red-500 font-bold text-base">
            {item.price}
          </Text>
          {isGrid && (
            <Text className="text-[10px] text-gray-400">
              Đã bán {item.sold}
            </Text>
          )}
        </View>

        {isGrid && (
          <View className="flex-row items-center justify-between mt-1">
            <View className="flex-row items-center bg-orange-50 px-1 rounded">
              <FontAwesome name="star" size={8} color="#F59E0B" />
              <Text className="text-[10px] text-orange-600 ml-1">
                {item.rating}
              </Text>
            </View>
            <Text className="text-[10px] text-gray-500">{item.location}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default ProductCard;
