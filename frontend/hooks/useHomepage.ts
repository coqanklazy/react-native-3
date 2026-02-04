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

  const [bestSellerProducts, setBestSellerProducts] = useState<Product[]>([]);
  const [discountedProducts, setDiscountedProducts] = useState<Product[]>([]);
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
    const res = await ApiService.getCategoriesWithProducts();
    if (res.success && res.data) {
      const mappedCategories = res.data.map((cat: any, index: number) => ({
        id: cat.id,
        name: cat.name,
        productCount: cat.productCount,
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

  const fetchBestSellers = async () => {
    const res = await ApiService.getBestSellers(10);
    if (res.success && res.data) {
      setBestSellerProducts(res.data);
    }
  };

  const fetchDiscountedProducts = async (isLoadMore = false) => {
    // Prevent loading if already loading
    if (loading) return;
    // Prevent loading more if no more items
    if (isLoadMore && !hasMore) return;

    setLoading(true);
    try {
      const limit = 20;
      const currentOffset = isLoadMore ? discountedProducts.length : 0;

      const isFiltering = selectedCategoryIds.length > 0 || searchQuery.length > 0;

      // If default view (no filter) and trying to load more, checking if we already reached our "display limit" isn't strictly necessary if we just load 20 once.
      // But to be safe if we want exactly 20 max:
      if (!isFiltering && currentOffset >= 20) {
        setHasMore(false);
        setLoading(false);
        return;
      }

      let res;

      if (isFiltering) {
        res = await ApiService.getProducts({
          q: searchQuery,
          category: selectedCategoryIds.join(','),
          limit,
          offset: currentOffset,
          sort: 'newest'
        });
      } else {
        res = await ApiService.getDiscountedProducts(limit, currentOffset);
      }

      if (res.success && res.data) {
        if (isLoadMore) {
          setDiscountedProducts(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const newItems = res.data!.filter(p => !existingIds.has(p.id));
            return [...prev, ...newItems];
          });
        } else {
          setDiscountedProducts(res.data);
        }

        // Logic for hasMore:
        // 1. If filtering, use standard pagination logic (more available if returned == limit)
        // 2. If default view, we only want 20 max. Since we asked for 20, we stop here.
        if (isFiltering) {
          setHasMore(res.data.length === limit);
        } else {
          // For default view, we loaded 20 (or less). We stop.
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useFocusEffect(
    useCallback(() => {
      loadUserData();
      fetchCategories();
      fetchBestSellers();
    }, [])
  );

  // Handle Filter Changes
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    // Debounce could be added here for search, but for now direct call
    const timer = setTimeout(() => {
      fetchDiscountedProducts(false);
    }, 500); // Small delay for typing

    return () => clearTimeout(timer);
  }, [selectedCategoryIds, searchQuery]);

  const loadMore = () => {
    fetchDiscountedProducts(true);
  };

  return {
    currentUser,
    searchQuery,
    setSearchQuery,
    selectedCategoryIds,
    setSelectedCategoryIds,
    categories,
    bestSellerProducts,
    discountedProducts,
    loading,
    refreshData: () => fetchDiscountedProducts(false),
    loadMore,
    hasMore,
    getCategoryName
  };
};
