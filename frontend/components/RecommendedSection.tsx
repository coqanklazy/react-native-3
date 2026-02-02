import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { Product } from "../types/api";
import ProductCard from "./ProductCard";

interface RecommendedSectionProps {
  products: Product[];
  onProductPress?: (product: Product) => void;
}

const RecommendedSection: React.FC<RecommendedSectionProps> = ({
  products,
  onProductPress,
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
            <ProductCard
              item={item}
              isGrid={true}
              onPress={() => onProductPress && onProductPress(item)}
            />
          </View>
        ))}
      </View>

    </View>
  );
};

export default RecommendedSection;
