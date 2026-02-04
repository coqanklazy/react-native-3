import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { Product } from "../types/api";

interface ProductCardProps {
  item: Product;
  isGrid?: boolean;
  onPress?: () => void;
  showSold?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  item,
  isGrid = true,
  onPress,
  showSold = false,
}) => {
  // Format price
  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN') + ' đ';
  };

  const discount = item.originalPrice && item.originalPrice > item.price
    ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100) + '%'
    : null;

  const getImageUrl = (url: string) => {
    if (!url) return 'https://via.placeholder.com/300?text=No+Image';
    if (url.startsWith('http')) return url;
    // Assuming relative path from backend public folder or similar, but for now just return placeholder if not http
    // Or if you have a BASE_URL for images: return `${BASE_URL}${url}`;
    return url;
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      className={`bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mb-3 ${isGrid ? "flex-1 m-1" : "w-40 mr-3"
        }`}
      onPress={onPress}
    >
      <View className="relative">
        <Image
          source={{ uri: getImageUrl(item.imageUrl) }}
          className="w-full h-36 bg-gray-50"
          resizeMode="cover"
        />
        {discount && (
          <View className="absolute top-0 right-0 bg-yellow-400 px-2 py-1 rounded-bl-lg">
            <Text className="text-xs font-bold text-red-600">
              {discount}
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
            {formatPrice(item.price)}
          </Text>
          {(isGrid || showSold) && (
            <Text className="text-[10px] text-gray-400">
              Đã bán {item.soldCount}
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
            <Text className="text-[10px] text-gray-500">Toàn Quốc</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default ProductCard;
