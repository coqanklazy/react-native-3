import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { Product } from "../types/product";
import ProductCard from "./ProductCard";

interface RecommendedSectionProps {
  products: Product[];
}

const RecommendedSection: React.FC<RecommendedSectionProps> = ({
  products,
}) => {
  return (
    <View className="px-2">
      <View className="bg-white p-3 rounded-t-lg items-center border-b-2 border-red-500 self-center">
        <Text className="text-red-500 font-bold uppercase text-sm">
          Gợi ý hôm nay
        </Text>
      </View>

      <View className="flex-row flex-wrap justify-between mt-2">
        {products.map((item) => (
          <View className="w-[49%]" key={item.id}>
            <ProductCard item={item} isGrid={true} />
          </View>
        ))}
        {/* Duplicate for demo */}
        {products.map((item) => (
          <View className="w-[49%]" key={`copy-${item.id}`}>
            <ProductCard
              item={{ ...item, id: `copy-${item.id}` }}
              isGrid={true}
            />
          </View>
        ))}
      </View>

      <TouchableOpacity className="bg-white py-3 mt-2 rounded-lg items-center border border-gray-200">
        <Text className="text-gray-500">Xem thêm</Text>
      </TouchableOpacity>
    </View>
  );
};

export default RecommendedSection;
