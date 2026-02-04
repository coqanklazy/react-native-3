import React, { useEffect } from "react";
import {
  View,
  FlatList, // Changed from ScrollView
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
import BestSellerSection from "../components/BestSellerSection"; // Added
import ProductCard from "../components/ProductCard"; // Added
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
    bestSellerProducts,
    discountedProducts,
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
    setSearchQuery("");
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

  const renderHeader = () => (
    <>
      <GreetingSection user={currentUser} />

      {/* 🧩 CATEGORIES (Horizontal) */}
      <CategorySection
        categories={categories}
        onCategoryPress={handleCategoryPress}
        selectedCategoryIds={selectedCategoryIds}
      />

      {/* 🖼 ADVERTISEMENT BANNER */}
      <View className="px-4 py-2 mb-2">
        <Image
          source={{ uri: "https://t4.ftcdn.net/jpg/03/20/46/13/360_F_320461388_5Snqf6f2tGjKGAv6Wrmcaz2r5AWc7M09.jpg" }}
          className="w-full h-36 rounded-xl"
          resizeMode="cover"
        />
      </View>

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

      {/* 🏆 BEST SELLERS (Horizontal) */}
      {bestSellerProducts && bestSellerProducts.length > 0 && (
        <BestSellerSection
          products={bestSellerProducts}
          onProductPress={handleProductPress}
        />
      )}

      {/* Main List Title */}
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

      {/* 🔴 HEADER (Sticky) */}
      <HomepageHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        cartCount={3}
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

      {/* 🔽 BOTTOM NAVIGATION */}
      <BottomTab />
    </View>
  );
};

export default HomepageScreen;
