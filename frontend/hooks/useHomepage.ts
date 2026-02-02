import { useState, useCallback, useEffect } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { User, Product } from "../types/api";
import { ApiService } from "../services/api";
import { StorageService } from "../utils/storage";

export const useHomepage = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const [flashSaleProducts, setFlashSaleProducts] = useState<Product[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Helper to get category name from ID
  const getCategoryName = (id: string) => {
    const cat = categories.find(c => c.id === id);
    return cat ? cat.name : '';
  };

  const loadUserData = async () => {
    try {
      const storedUser = await StorageService.getUser();
      if (storedUser) {
        setCurrentUser(storedUser);
      }
    } catch (error) {
      console.log("Error loading user from storage:", error);
    }

    try {
      const token = await ApiService.getAccessToken();
      if (!token) return;

      const user = await ApiService.getCurrentUser();
      if (user) {
        setCurrentUser(user);
        await StorageService.updateUser(user);
      }
    } catch (error) {
      console.error("Error syncing user data with API:", error);
    }
  };

  const fetchCategories = async () => {
    const res = await ApiService.getCategories();
    if (res.success) {
      const mappedCategories = res.data.map((cat: any, index: number) => ({
        id: cat.id.toString(),
        name: cat.name,
        icon: getCategoryIcon(cat.name),
        color: getCategoryColor(index)
      }));
      setCategories(mappedCategories);
    }
  };

  const getCategoryIcon = (name: string): string => {
    if (name.includes('Bắc')) return 'map-marker';
    if (name.includes('Trung')) return 'sun-o';
    if (name.includes('Nam')) return 'leaf';
    if (name.includes('Bánh')) return 'gift';
    if (name.includes('Nem')) return 'cubes';
    if (name.includes('Đồ uống')) return 'coffee';
    return 'star';
  };

  const getCategoryColor = (index: number): string => {
    const colors = ["#EF4444", "#F59E0B", "#10B981", "#8B5CF6", "#EC4899", "#3B82F6", "#6366F1", "#6B7280"];
    return colors[index % colors.length];
  };

  const fetchFlashSale = async () => {
    const categoryParam = selectedCategoryIds.length > 0 ? selectedCategoryIds.join(',') : undefined;
    const res = await ApiService.getProducts({
      q: searchQuery,
      category: categoryParam,
      sort: 'price_asc',
      limit: 10
    });
    if (res.success) {
      setFlashSaleProducts(res.data);
    }
  };

  const fetchRecommended = async (isLoadMore = false) => {
    if (isLoadMore && !hasMore) return;

    setLoading(true);
    try {
      const categoryParam = selectedCategoryIds.length > 0 ? selectedCategoryIds.join(',') : undefined;
      const currentPage = isLoadMore ? page + 1 : 1;
      const limit = 6;

      const res = await ApiService.getProducts({
        q: searchQuery,
        category: categoryParam,
        limit: limit,
        page: currentPage
      });

      if (res.success) {
        if (isLoadMore) {
          setRecommendedProducts(prev => [...prev, ...res.data]);
        } else {
          setRecommendedProducts(res.data);
        }

        setPage(currentPage);

        const currentTotal = isLoadMore ? recommendedProducts.length + res.data.length : res.data.length;
        setHasMore(currentTotal < res.pagination.totalItems);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setHasMore(true);
      fetchRecommended(false);
      fetchFlashSale();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategoryIds]);

  useFocusEffect(
    useCallback(() => {
      loadUserData();
      fetchCategories();
      fetchFlashSale();
    }, [])
  );

  const loadMore = () => {
    fetchRecommended(true);
  };

  return {
    currentUser,
    searchQuery,
    setSearchQuery,
    selectedCategoryIds,
    setSelectedCategoryIds,
    categories,
    flashSaleProducts,
    recommendedProducts,
    loading,
    refreshData: () => fetchRecommended(false),
    loadMore,
    hasMore,
    getCategoryName
  };
};
