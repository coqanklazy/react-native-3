import React from "react";
import { View, ScrollView, Text, TouchableOpacity } from "react-native";
import { Product } from "../types/api";
import ProductCard from "./ProductCard";

interface BestSellerSectionProps {
    products: Product[];
    onProductPress?: (product: Product) => void;
}

const BestSellerSection: React.FC<BestSellerSectionProps> = ({ products, onProductPress }) => {
    if (!products || products.length === 0) return null;

    return (
        <View className="bg-white mb-2 py-3">
            <View className="flex-row justify-between items-center px-4 mb-3">
                <View className="flex-row items-center gap-2">
                    <Text className="text-red-600 font-bold text-lg uppercase">
                        Top bán chạy
                    </Text>
                </View>
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
                        showSold={true}
                        onPress={() => onProductPress && onProductPress(item)}
                    />
                ))}
            </ScrollView>
        </View>
    );
};

export default BestSellerSection;
