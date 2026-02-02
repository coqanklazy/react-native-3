import React, { useEffect } from "react";
import {
  View,
  ScrollView,
  StatusBar,
  Alert,
  BackHandler,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from "react-native";
import { NavigationProps } from "../types/navigation";
import { useHomepage } from "../hooks/useHomepage";
import { CATEGORIES } from "../constants/mockData";
import BottomTab from "../components/BottomTab";
import HomepageHeader from "../components/HomepageHeader";
import GreetingSection from "../components/GreetingSection";
import BannerSlider from "../components/BannerSlider";
import CategorySection from "../components/CategorySection";
import FlashSaleSection from "../components/FlashSaleSection";
import RecommendedSection from "../components/RecommendedSection";
import HomepageFooter from "../components/HomepageFooter";
import { Product } from "../types/api"; // Updated import

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
    flashSaleProducts,
    recommendedProducts,
    loading,
    loadMore,
    hasMore,
    getCategoryName
  } = useHomepage();

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
    // Toggle multiple category selection by ID
    if (selectedCategoryIds.includes(category.id)) {
      setSelectedCategoryIds(prev => prev.filter(id => id !== category.id));
    } else {
      setSelectedCategoryIds(prev => [...prev, category.id]);
    }
  };

  const removeCategory = (categoryId: string) => {
    setSelectedCategoryIds(prev => prev.filter(id => id !== categoryId));
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar barStyle="light-content" backgroundColor="#DC2626" />

      {/* 🔴 HEADER (Sticky) */}
      <HomepageHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        cartCount={3}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* 👋 GREETING SECTION */}
        <GreetingSection user={currentUser} />

        {/* 🎞️ BANNER SLIDER removed as per request */}
        {/* <BannerSlider /> */}

        {/* 🧩 CATEGORIES */}
        <CategorySection
          categories={categories}
          onCategoryPress={handleCategoryPress}
          selectedCategoryIds={selectedCategoryIds}
        />

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

        {/* ⚡ FLASH SALE */}
        {flashSaleProducts && flashSaleProducts.length > 0 && (
          <FlashSaleSection
            products={flashSaleProducts}
            onProductPress={handleProductPress}
          />
        )}

        {/* 🔥 DISCOVERY / RECOMMENDATIONS */}
        <RecommendedSection
          products={recommendedProducts}
          onProductPress={handleProductPress}
        />

        {loading && (
          <View className="py-4">
            <ActivityIndicator size="small" color="#DC2626" />
          </View>
        )}

        {!loading && hasMore && recommendedProducts.length > 0 && (
          <TouchableOpacity
            onPress={loadMore}
            className="bg-gray-100 mx-4 py-3 rounded-lg items-center mt-2"
          >
            <Text className="text-gray-600 font-medium">Xem thêm</Text>
          </TouchableOpacity>
        )}

        {!loading && recommendedProducts.length === 0 && (
          <View className="py-10 items-center">
            <Text className="text-gray-500">Không tìm thấy sản phẩm nào</Text>
          </View>
        )}

        {/* Footer Brand */}
        <HomepageFooter />
      </ScrollView>

      {/* 🔽 BOTTOM NAVIGATION */}
      <BottomTab />
    </View>
  );
};

export default HomepageScreen;
