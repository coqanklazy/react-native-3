import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  StatusBar,
  Alert,
  BackHandler,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Image,
} from "react-native";
import { NavigationProps } from "../types/navigation";
import { useHomepage } from "../hooks/useHomepage";
import BottomTab from "../components/BottomTab";
import HomepageHeader from "../components/HomepageHeader";
import GreetingSection from "../components/GreetingSection";
import CategorySection from "../components/CategorySection";
import BestSellerSection from "../components/BestSellerSection";
import ProductCard from "../components/ProductCard";
import PromoBanner from "../components/PromoBanner";
import { Product } from "../types/api";
import { useCartStore } from "../store/cartStore";
import { useAuth } from "../hooks/useAuth";

interface HomepageScreenProps extends NavigationProps {
  onLogout?: () => void;
}

const HomepageScreen: React.FC<HomepageScreenProps> = ({
  navigation,
  onLogout,
}) => {
  const {
    currentUser,
    searchQuery,
    setSearchQuery,
    selectedCategoryIds,
    setSelectedCategoryIds,
    categories,
    bestSellerProducts,
    discountedProducts,
    loading,
    loadMore,
    hasMore,
    getCategoryName
  } = useHomepage();

  const { currentUser: authUser } = useAuth();
  const userId = authUser?.id?.toString() || 'guest';

  const { addToCart, clearSelectedCart, toggleItemSelection } = useCartStore();
  const cartCount = useCartStore((state) => state.getTotalItems(userId));

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        Alert.alert("Thoát ứng dụng", "Bạn có muốn thoát ứng dụng không?", [
          { text: "Hủy", style: "cancel" },
          { text: "Thoát", onPress: () => BackHandler.exitApp() },
        ]);
        return true;
      }
    );

    return () => {
      backHandler.remove();
    };
  }, []);

  const handleProductPress = (product: Product) => {
    navigation.navigate("ProductDetail", { productId: product.id });
  };

  const handleCategoryPress = (category: any) => {
    setSearchQuery("");
    if (selectedCategoryIds.includes(category.id)) {
      setSelectedCategoryIds(prev => prev.filter(id => id !== category.id));
    } else {
      setSelectedCategoryIds(prev => [...prev, category.id]);
    }
  };

  const removeCategory = (categoryId: string) => {
    setSelectedCategoryIds(prev => prev.filter(id => id !== categoryId));
  };

  const renderHeader = () => (
    <>
      <GreetingSection user={currentUser} />

      <CategorySection
        categories={categories}
        onCategoryPress={handleCategoryPress}
        selectedCategoryIds={selectedCategoryIds}
      />

      <PromoBanner onPress={() => Alert.alert("Siêu Giảm Giá", "Khám phá các ưu đãi giảm tới 50% ngay hôm nay!")} />

      {selectedCategoryIds.length > 0 && (
        <View className="px-4 py-2 flex-row flex-wrap items-center">
          <Text className="text-gray-600 mr-2 mb-2">Đang lọc theo:</Text>
          {selectedCategoryIds.map((id, index) => (
            <View key={index} className="bg-red-100 px-3 py-1 rounded-full flex-row items-center mr-2 mb-2">
              <Text className="text-red-600 font-bold">{getCategoryName(id)}</Text>
              <Text
                className="ml-2 text-red-600 font-bold"
                onPress={() => removeCategory(id)}
              >✕</Text>
            </View>
          ))}
        </View>
      )}

      {bestSellerProducts && bestSellerProducts.length > 0 && (
        <BestSellerSection
          products={bestSellerProducts}
          onProductPress={handleProductPress}
        />
      )}

      <View className="px-2 mt-2 bg-white pt-3 rounded-t-lg mx-2 border-b-2 border-red-500 self-center w-full items-center">
        <Text className="text-red-500 font-bold uppercase text-sm mb-2">
          Sản phẩm giảm giá
        </Text>
      </View>
    </>
  );

  const renderProductItem = ({ item }: { item: Product }) => (
    <View style={{ width: '48%', marginBottom: 10 }}>
      <ProductCard
        item={item}
        isGrid={true}
        onPress={() => handleProductPress(item)}
      />
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="light-content" backgroundColor="#DC2626" />

      <HomepageHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        cartCount={cartCount}
        onCartPress={() => navigation.navigate("Cart")}
      />

      <FlatList
        data={discountedProducts}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        renderItem={renderProductItem}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: 10 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListHeaderComponent={renderHeader}
        onEndReached={hasMore ? loadMore : null}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          loading ? (
            <View className="py-4 items-center">
              <ActivityIndicator size="small" color="#DC2626" />
            </View>
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />

      <BottomTab />
    </View>
  );
};

export default HomepageScreen;
