import React from "react";
import { View, ScrollView, Text, TouchableOpacity } from "react-native";
import { Product } from "../types/product";
import ProductCard from "./ProductCard";

interface FlashSaleSectionProps {
  products: Product[];
}

const FlashSaleSection: React.FC<FlashSaleSectionProps> = ({ products }) => {
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
          <ProductCard key={item.id} item={item} isGrid={false} />
        ))}
      </ScrollView>
    </View>
  );
};

export default FlashSaleSection;
