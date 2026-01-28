import React, { useEffect } from "react";
import {
  View,
  ScrollView,
  StatusBar,
  Alert,
  BackHandler,
} from "react-native";
import { NavigationProps } from "../types/navigation";
import { useHomepage } from "../hooks/useHomepage";
import {
  CATEGORIES,
  FLASH_SALE_PRODUCTS,
  RECOMMENDED_PRODUCTS,
} from "../constants/mockData";
import BottomTab from "../components/BottomTab";
import HomepageHeader from "../components/HomepageHeader";
import GreetingSection from "../components/GreetingSection";
import BannerSlider from "../components/BannerSlider";
import CategorySection from "../components/CategorySection";
import FlashSaleSection from "../components/FlashSaleSection";
import RecommendedSection from "../components/RecommendedSection";
import HomepageFooter from "../components/HomepageFooter";

interface HomepageScreenProps extends NavigationProps {
  onLogout?: () => void;
}

const HomepageScreen: React.FC<HomepageScreenProps> = ({
  navigation,
  onLogout,
}) => {
  const { currentUser, searchQuery, setSearchQuery } = useHomepage();

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

        {/* 🎞️ BANNER SLIDER */}
        <BannerSlider />

        {/* 🧩 CATEGORIES */}
        <CategorySection categories={CATEGORIES} />

        {/* ⚡ FLASH SALE */}
        <FlashSaleSection products={FLASH_SALE_PRODUCTS} />

        {/* 🔥 DISCOVERY / RECOMMENDATIONS */}
        <RecommendedSection products={RECOMMENDED_PRODUCTS} />

        {/* Footer Brand */}
        <HomepageFooter />
      </ScrollView>

      {/* 🔽 BOTTOM NAVIGATION */}
      <BottomTab />
    </View>
  );
};

export default HomepageScreen;
