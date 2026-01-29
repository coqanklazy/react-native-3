import React from "react";
import { View, FlatList, TouchableOpacity, Text, Dimensions } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { Category } from "../types/product";

const { width } = Dimensions.get("window");

interface CategorySectionProps {
  categories: Category[];
}

const CategorySection: React.FC<CategorySectionProps> = ({ categories }) => {
  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      style={{ width: width / 4 - 10 }}
      className="items-center mb-4"
    >
      <View
        className="w-12 h-12 rounded-2xl items-center justify-center mb-2 shadow-sm"
        style={{ backgroundColor: `${item.color}20` }}
      >
        <FontAwesome name={item.icon} size={20} color={item.color} />
      </View>
      <Text className="text-xs text-gray-700 text-center font-medium">
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View className="bg-white p-4 mb-2">
      <FlatList
        data={categories}
        renderItem={renderCategoryItem}
        keyExtractor={(item) => item.id}
        numColumns={4}
        scrollEnabled={false}
        columnWrapperStyle={{ justifyContent: "space-between" }}
      />
    </View>
  );
};

export default CategorySection;
