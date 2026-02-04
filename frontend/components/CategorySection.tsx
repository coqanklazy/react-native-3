import React, { useState } from "react";
import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  Dimensions,
  Modal,
  SafeAreaView,
  StatusBar
} from "react-native";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { Category } from "../types/product";

const { width } = Dimensions.get("window");

interface CategorySectionProps {
  categories: Category[];
  onCategoryPress?: (category: Category) => void;
  selectedCategoryIds?: string[];
}

const CategorySection: React.FC<CategorySectionProps> = ({
  categories,
  onCategoryPress,
  selectedCategoryIds = []
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const MAX_VISIBLE_ITEMS = 7;
  const shouldShowMore = categories.length > 8;

  const visibleCategories = shouldShowMore
    ? categories.slice(0, MAX_VISIBLE_ITEMS)
    : categories;

  const renderCategoryItem = ({ item }: { item: Category }) => {
    const isSelected = selectedCategoryIds.includes(item.id.toString());

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        style={{ width: width / 4 - 10 }}
        className="items-center mb-4"
        onPress={() => onCategoryPress && onCategoryPress(item)}
      >
        <View
          className={`w-12 h-12 rounded-2xl items-center justify-center mb-2 shadow-sm ${isSelected ? 'border-2 border-red-500' : ''}`}
          style={{ backgroundColor: `${item.color}20` }}
        >
          <FontAwesome name={item.icon} size={20} color={item.color} />
          {isSelected && (
            <View className="absolute top-0 right-0 bg-red-500 rounded-full w-4 h-4 items-center justify-center border border-white">
              <FontAwesome name="check" size={8} color="white" />
            </View>
          )}
        </View>
        <Text className="text-xs text-gray-700 text-center font-medium" numberOfLines={2}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderModalItem = ({ item }: { item: Category }) => {
    const isSelected = selectedCategoryIds.includes(item.id.toString());
    return (
      <TouchableOpacity
        className={`flex-row items-center p-3 mb-2 rounded-lg border ${isSelected ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100'}`}
        onPress={() => onCategoryPress && onCategoryPress(item)}
      >
        <View
          className="w-10 h-10 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: `${item.color}20` }}
        >
          <FontAwesome name={item.icon} size={16} color={item.color} />
        </View>
        <Text className={`flex-1 font-medium ${isSelected ? 'text-red-700' : 'text-gray-700'}`}>
          {item.name}
        </Text>
        <View className={`w-6 h-6 rounded-full border items-center justify-center ${isSelected ? 'bg-red-500 border-red-500' : 'border-gray-300'}`}>
          {isSelected && <FontAwesome name="check" size={12} color="white" />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="bg-white py-4 mb-2">
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        renderItem={({ item }) => (
          <View style={{ width: width / 4 - 10, marginRight: 10 }}>
            {renderCategoryItem({ item })}
          </View>
        )}
      />
    </View>
  );
};

export default CategorySection;
