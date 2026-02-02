import React from "react";
import { View, ScrollView, Text, TouchableOpacity } from "react-native";
import { Product } from "../types/api";
import ProductCard from "./ProductCard";

interface FlashSaleSectionProps {
  products: Product[];
  onProductPress?: (product: Product) => void;
}

const FlashSaleSection: React.FC<FlashSaleSectionProps> = ({ products, onProductPress }) => {
  if (!products || products.length === 0) return null;

  return (
    <View className="bg-white mb-2 py-3">
      <View className="flex-row justify-between items-center px-4 mb-3">
        <View className="flex-row items-center gap-2">
          <Text className="text-orange-500 font-bold text-lg italic">
            FLASH SALE
          </Text>
          <View className="bg-black px-2 py-1 rounded">
            <Text className="text-white font-bold text-xs">02:14:55</Text>
          </View>
        </View>
        <TouchableOpacity>
          <Text className="text-gray-500 text-xs">Xem tất cả ›</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        {products.map((item) => (
          <ProductCard
            key={item.id}
            item={item}
            isGrid={false}
            onPress={() => onProductPress && onProductPress(item)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

export default FlashSaleSection;
