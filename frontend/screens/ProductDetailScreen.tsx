import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
  TextInput,
} from "react-native";
import { StackScreenProps } from "@react-navigation/stack";
import { RootStackParamList } from "../types/navigation";
import { ApiService } from "../services/api";
import { Product } from "../types/api";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCartStore } from "../store/cartStore";
import { useAuth } from "../hooks/useAuth";
import { useFocusEffect } from "@react-navigation/native";
import BottomTab from "../components/BottomTab";
import QuickBuyModal from "../components/QuickBuyModal";
import { ProductComment } from "../types/api";

interface ProductReviewType {
  id: number;
  rating: number;
  comment?: string;
  created_at?: string;
  createdAt?: string;
  user_name?: string;
  userName?: string;
}

interface ProductReviewStats {
  reviewCount: number;
  avgRating: number | string;
  distribution?: { [key: string]: number };
}

type Props = StackScreenProps<RootStackParamList, "ProductDetail">;

const ProductDetailScreen: React.FC<Props> = ({ route, navigation }) => {
  const { productId } = route.params;
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const userId = currentUser?.id?.toString() || "guest";

  const addToCart = useCartStore((state) => state.addToCart);
  const cartItemCount = useCartStore((state) =>
    state.getTotalItems(userId),
  );

  const [quickBuyVisible, setQuickBuyVisible] = useState(false);
  
  // Reviews state
  const [reviews, setReviews] = useState<ProductReviewType[]>([]);
  const [reviewStats, setReviewStats] = useState<ProductReviewStats | null>(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [eligibleOrderId, setEligibleOrderId] = useState<number | null>(null);

  // Comments state
  const [comments, setComments] = useState<ProductComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [similarLoading, setSimilarLoading] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);


  useEffect(() => {
    fetchProductDetail();
  }, [productId]);

  const checkLikedStatus = useCallback(async () => {
    if (userId === "guest") {
        setIsFavorite(false);
        return;
    }
    try {
      const pid = Number(productId);
      const res = await ApiService.checkFavoriteStatus(pid);
      if (res.success && res.data) {
        setIsFavorite(!!res.data.isLiked);
      }
    } catch (error) {
      console.log('Error checking favorite status:', error);
    }
  }, [productId, userId]);

  const checkEligibility = useCallback(async () => {
    if (userId === "guest") return;
    try {
      const res = await ApiService.checkReviewEligibility(productId);
      if (res.success && res.data?.canReview) {
        setCanReview(true);
        setEligibleOrderId(res.data.orderId || null);
      }
    } catch (e) {
      console.log('Eligibility check error:', e);
    }
  }, [productId, userId]);

  const handleToggleFavorite = async () => {
    if (userId === "guest") {
      Alert.alert("Yêu cầu đăng nhập", "Vui lòng đăng nhập để lưu sản phẩm yêu thích.");
      return;
    }
    try {
      const pid = Number(productId);
      const res = await ApiService.toggleFavorite(pid);
      if (res.success) {
        setIsFavorite(prev => !prev);
      }
    } catch (error) {
       Alert.alert("Lỗi", "Không thể thực hiện thao tác này.");
    }
  };

  const trackView = async () => {
    if (userId === "guest") return;
    try {
      await ApiService.trackProductView(productId);
    } catch (error) {
      // Ignore
    }
  };

  const fetchRecentlyViewed = async () => {
    if (userId === "guest") return;
    try {
      const res = await ApiService.getRecentlyViewed(8);
      if (res.success && res.data) {
        // Filter out current product
        setRecentlyViewed(res.data.filter((p: Product) => p.id !== productId));
      }
    } catch (error) {
      console.log('Error fetching recently viewed:', error);
    }
  };

  // Consolidate status checks for useFocusEffect
  const refreshStatus = useCallback(() => {
    if (productId && userId !== "guest") {
      checkLikedStatus();
      checkEligibility();
    }
  }, [productId, userId, checkLikedStatus, checkEligibility]);

  useFocusEffect(
    useCallback(() => {
      refreshStatus();
    }, [refreshStatus])
  );

  // Re-check when userId changes (e.g. after login)
  useEffect(() => {
    if (userId !== "guest") {
      checkLikedStatus();
      checkEligibility();
    }
  }, [userId, checkLikedStatus, checkEligibility]);

  const fetchProductDetail = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getProductById(productId);
      if (response.success && response.data) {
        setProduct(response.data);
        fetchReviews(); // Fetch reviews after product
        fetchComments(); // Fetch comments
        fetchSimilarProducts(); // Fetch similar products
        fetchRecentlyViewed(); // Fetch recently viewed
        checkLikedStatus(); // Check favorite status
        trackView(); // Track product view
      } else {
        Alert.alert(
          "Lỗi",
          response.message || "Không thể tải thông tin sản phẩm",
        );
        navigation.goBack();
      }
    } catch (error) {
      console.error("Error fetching product detail:", error);
      Alert.alert("Lỗi", "Đã có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const res = await ApiService.getProductReviews(productId);
      if (res.success && res.data) {
        setReviews(res.data.reviews || []);
        setReviewStats(res.data.stats || null);
      }
    } catch (error) {
      console.log('Error fetching reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      setCommentsLoading(true);
      const res = await ApiService.getProductComments(productId);
      if (res.success && res.data) {
        setComments(res.data);
      }
    } catch (error) {
      console.log('Error fetching comments:', error);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handlePostComment = async () => {
    if (userId === "guest") {
      Alert.alert("Yêu cầu đăng nhập", "Vui lòng đăng nhập để gửi bình luận.");
      return;
    }

    if (!commentContent.trim()) {
      Alert.alert("Lỗi", "Nội dung bình luận không được để trống.");
      return;
    }

    try {
      setIsSubmittingComment(true);
      const res = await ApiService.addProductComment(productId, commentContent);
      if (res.success) {
        setCommentContent("");
        fetchComments();
        // Cập nhật count locale
        if (product) {
          setProduct({ ...product, commentCount: (product.commentCount || 0) + 1 });
        }
        Alert.alert("Thành công", "Bình luận của bạn đã được đăng.");
      } else {
        Alert.alert("Lỗi", (res as any).error || res.message || "Không thể đăng bình luận.");
      }
    } catch (error: any) {
      console.error("Error posting comment:", error);
      Alert.alert("Lỗi", "Đã có lỗi xảy ra khi đăng bình luận: " + error.message);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const fetchSimilarProducts = async () => {
    try {
      setSimilarLoading(true);
      const res = await ApiService.getSimilarProducts(productId, 6);
      if (res.success && res.data) {
        setSimilarProducts(res.data);
      }
    } catch (error) {
      console.log('Error fetching similar products:', error);
    } finally {
      setSimilarLoading(false);
    }
  };

  // Removed local useEffect for checkEligibility as it's now in useFocusEffect

  const handleAddToCartAction = () => {
    if (product) {
      addToCart(userId, product, 1);
      Alert.alert("Thành công", "Sản phẩm đã được thêm vào giỏ hàng");
    }
  };

  const handleBuyNowAction = (quantity: number, prod: Product) => {
    // 1. Unselect all items first
    useCartStore.getState().toggleAllSelection(userId, false);

    // 2. Remove if exists to reset quantity for this quick buy session
    useCartStore.getState().removeFromCart(userId, prod.id);

    // 3. Add to cart (will default to selected: true)
    addToCart(userId, prod, quantity);

    setQuickBuyVisible(false);
    navigation.navigate("Checkout", { fromQuickBuy: true });
  };

  const openQuickBuy = () => {
    if (product) {
      setQuickBuyVisible(true);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#DC2626" />
      </View>
    );
  }

  if (!product) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-500">Không tìm thấy sản phẩm</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-gray-800" numberOfLines={1}>
          Chi tiết sản phẩm
        </Text>
        <TouchableOpacity
          className="p-2 relative"
          onPress={() => navigation.navigate("Cart")}
        >
          <Ionicons name="cart-outline" size={24} color="#333" />
          {cartItemCount > 0 && (
            <View className="absolute top-0 right-0 bg-red-500 rounded-full w-4 h-4 items-center justify-center">
              <Text className="text-white text-[10px] font-bold">
                {cartItemCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Product Image */}
        <View className="w-full h-80 bg-gray-50 justify-center items-center">
          <Image
            source={{
              uri: product.imageUrl
                ? product.imageUrl.startsWith("http")
                  ? product.imageUrl
                  : product.imageUrl
                : "https://via.placeholder.com/400",
            }}
            className="w-full h-full"
            resizeMode="contain"
          />
        </View>

        {/* Product Info */}
        <View className="p-4">
          <View className="flex-row justify-between items-start">
            <View className="flex-1">
              <Text className="text-2xl font-bold text-gray-800 mb-2">
                {product.name}
              </Text>
            </View>
            <TouchableOpacity 
              onPress={handleToggleFavorite}
              className="p-2 bg-gray-100 rounded-full ml-2"
            >
              <Ionicons 
                name={isFavorite ? "heart" : "heart-outline"} 
                size={24} 
                color={isFavorite ? "#EF4444" : "#6B7280"} 
              />
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center mb-4">
            <View className="flex-row items-center mr-4">
              <Ionicons name="star" size={16} color="#F59E0B" />
              <Text className="text-gray-700 font-bold ml-1">{(Number(product.avgRating) || 0).toFixed(1)}</Text>
              <Text className="text-gray-400 text-xs ml-1">({product.reviewCount || 0})</Text>
            </View>
            <View className="w-1 h-1 rounded-full bg-gray-300 mr-4" />
            <Text className="text-gray-500 text-sm">{product.soldCount || 0} đã bán</Text>
            <View className="w-1 h-1 rounded-full bg-gray-300 mx-4" />
            <Text className="text-gray-500 text-sm">{product.buyerCount || 0} người mua</Text>
            <View className="w-1 h-1 rounded-full bg-gray-300 mx-4" />
            <Text className="text-gray-500 text-sm">{product.commentCount || 0} bình luận</Text>
          </View>

          <View className="flex-row items-center mb-4">
            <Text className="text-[#DC2626] text-xl font-bold mr-2">
              {(product.price || 0).toLocaleString("vi-VN")} đ
            </Text>
            {product.originalPrice && product.originalPrice > product.price && (
              <Text className="text-gray-400 line-through text-sm">
                {(product.originalPrice || 0).toLocaleString("vi-VN")} đ
              </Text>
            )}
          </View>


          <View className="border-t border-gray-100 py-4">
            <Text className="text-lg font-bold text-gray-800 mb-2">
              Mô tả sản phẩm
            </Text>
            <Text className="text-gray-600 leading-6">
              {product.description
                ? product.description.replace(/<[^>]*>?/gm, "") // simple html tag strip
                : "Chưa có mô tả cho sản phẩm này."}
            </Text>
          </View>

          {/* ── Review Prompt Box ── */}
          {canReview && (
            <TouchableOpacity 
              onPress={() => navigation.navigate('WriteReview', { 
                orderId: eligibleOrderId?.toString() || '', 
                orderId_numeric: eligibleOrderId || 0 
              })}
              activeOpacity={0.8}
              className="mb-4 bg-red-50 p-4 rounded-xl border border-red-200 flex-row items-center"
            >
              <View className="bg-red-500 w-10 h-10 rounded-full items-center justify-center mr-3 shadow-sm">
                <Ionicons name="gift" size={20} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-red-800 font-bold text-sm">Đánh giá nhận quà ngay!</Text>
                <Text className="text-red-600 text-[11px] mt-0.5">Nhận ngay 500 điểm thưởng & Mã giảm 10%</Text>
              </View>
              <View className="bg-red-200 px-3 py-1.5 rounded-lg flex-row items-center">
                <Text className="text-red-700 font-bold text-xs mr-1">Viết</Text>
                <Ionicons name="chevron-forward" size={14} color="#B91C1C" />
              </View>
            </TouchableOpacity>
          )}
          
          {/* ── Reviews Section ── */}
          <View className="border-t border-gray-100 py-4 mt-2">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-gray-800">Đánh giá sản phẩm</Text>
              <TouchableOpacity onPress={() => navigation.navigate('ProductReviews', { productId })}>
                <Text className="text-sm text-red-600">Xem tất cả</Text>
              </TouchableOpacity>
            </View>

            {reviewsLoading ? (
              <ActivityIndicator size="small" color="#DC2626" />
            ) : reviews.length === 0 ? (
              <View className="items-center py-6 bg-gray-50 rounded-lg">
                <Ionicons name="chatbubble-ellipses-outline" size={32} color="#D1D5DB" />
                <Text className="text-gray-500 mt-2">Chưa có đánh giá nào.</Text>
                <Text className="text-sm text-gray-400 mt-1">Mua hàng để trở thành người đầu tiên đánh giá!</Text>
              </View>
            ) : (
              <>
                {/* Stats summary */}
                {reviewStats && (
                  <View className="flex-row items-center mb-6 bg-red-50 p-4 rounded-xl">
                    <View className="items-center mr-6 border-r border-red-200 pr-6">
                      <Text className="text-3xl font-bold text-red-600">
                        {(Number(reviewStats.avgRating) || 0).toFixed(1)}
                      </Text>
                      <View className="flex-row my-1">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Ionicons key={s} name={s <= Math.round(Number(reviewStats.avgRating)) ? "star" : "star-outline"} size={14} color="#F59E0B" />
                        ))}
                      </View>
                      <Text className="text-xs text-gray-500">{reviewStats.reviewCount} đánh giá</Text>
                    </View>
                    <View className="flex-1">
                      {[5, 4, 3, 2, 1].map(star => {
                        const count = reviewStats.distribution?.[star.toString()] || 0;
                        const pct = reviewStats.reviewCount > 0 ? (count / reviewStats.reviewCount) * 100 : 0;
                        return (
                          <View key={star} className="flex-row items-center mb-1">
                            <Text className="text-xs text-gray-600 w-3">{star}</Text>
                            <Ionicons name="star" size={10} color="#9CA3AF" />
                            <View className="flex-1 h-1.5 bg-gray-200 rounded-full mx-2 overflow-hidden">
                              <View className="h-full bg-red-500 rounded-full" style={{ width: `${pct}%` }} />
                            </View>
                            <Text className="text-[10px] text-gray-400 w-6 text-right">{count}</Text>
                          </View>
                        );
                      })}
                    </View>
                  </View>
                )}

                {/* Review items */}
                {reviews.map((rv) => (
                  <View key={rv.id} className="mb-4 pb-4 border-b border-gray-100 last:border-b-0">
                    <View className="flex-row align-center justify-between mb-2">
                      <View className="flex-row items-center">
                        <View className="w-8 h-8 rounded-full bg-red-100 items-center justify-center mr-3 overflow-hidden">
                          {(rv as any).avatar_url ? (
                            <Image source={{ uri: (rv as any).avatar_url }} className="w-8 h-8" />
                          ) : (
                            <Text className="text-red-700 font-bold">{(rv.user_name || rv.userName || 'U').charAt(0).toUpperCase()}</Text>
                          )}
                        </View>
                        <View>
                          <Text className="font-semibold text-gray-800 text-sm">{rv.user_name || rv.userName || 'Ẩn danh'}</Text>
                          <View className="flex-row items-center">
                            {[1, 2, 3, 4, 5].map(s => (
                              <Ionicons key={s} name={s <= rv.rating ? "star" : "star-outline"} size={12} color="#F59E0B" />
                            ))}
                          </View>
                        </View>
                      </View>
                      <Text className="text-xs text-gray-400">
                        {new Date(rv.created_at || rv.createdAt || '').toLocaleDateString('vi-VN')}
                      </Text>
                    </View>
                    <Text className="text-gray-800 text-sm leading-5 mt-2 bg-gray-50 p-2 rounded-lg italic">
                      "{rv.comment}"
                    </Text>
                    {/* Shop Response Placeholder — matches premium shopping apps */}
                    <View className="mt-3 bg-red-50/30 p-3 rounded-lg border-l-2 border-red-400">
                      <Text className="text-[11px] font-bold text-red-800">Phản hồi của người bán:</Text>
                      <Text className="text-[11px] text-gray-500 mt-1 leading-4">
                        Cảm ơn bạn đã tin tưởng và ủng hộ shop nhé! Rất vui vì bạn hài lòng với sản phẩm. 
                        Nếu cần hỗ trợ thêm hãy nhắn tin cho shop ngay nha! ❤️
                      </Text>
                    </View>
                  </View>
                ))}
              </>
            )}
          </View>

          {/* ── Q&A / Comments Section ── */}
          <View className="border-t border-gray-100 py-6 mt-2">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-gray-800">Hỏi đáp & Bình luận</Text>
              <Text className="text-xs text-gray-400">{comments.length} bình luận</Text>
            </View>

            {/* Input field */}
            <View className="mb-6 bg-white border border-gray-200 rounded-xl p-3 shadow-sm">
              <TextInput
                className="text-gray-800 text-sm h-20"
                placeholder="Bạn có thắc mắc gì về sản phẩm này không? Đừng ngần ngại hỏi nhé..."
                placeholderTextColor="#9CA3AF"
                multiline
                value={commentContent}
                onChangeText={setCommentContent}
                textAlignVertical="top"
              />
              <View className="flex-row justify-end mt-2 items-center">
                 {isSubmittingComment && <ActivityIndicator size="small" color="#DC2626" className="mr-3" />}
                 <TouchableOpacity 
                   onPress={handlePostComment}
                   disabled={isSubmittingComment}
                   className={`${isSubmittingComment ? 'bg-gray-300' : 'bg-red-600'} px-5 py-2 rounded-lg shadow-sm`}
                 >
                   <Text className="text-white font-bold text-xs">Gửi thắc mắc</Text>
                 </TouchableOpacity>
              </View>
            </View>

            {/* Comments List */}
            {commentsLoading ? (
               <ActivityIndicator size="small" color="#DC2626" />
            ) : comments.length === 0 ? (
               <View className="items-center py-4">
                 <Text className="text-gray-400 text-xs italic">Hãy là người đầu tiên đặt câu hỏi!</Text>
               </View>
            ) : (
                comments.map((cm) => (
                  <View key={cm.id} className="mb-5">
                    <View className="flex-row">
                      <View className="w-8 h-8 rounded-full bg-gray-200 items-center justify-center mr-3 overflow-hidden">
                         {cm.avatar_url ? (
                           <Image source={{ uri: cm.avatar_url }} className="w-8 h-8" />
                         ) : (
                           <Ionicons name="person" size={16} color="#9CA3AF" />
                         )}
                      </View>
                      <View className="flex-1">
                        <View className="flex-row items-center justify-between">
                          <Text className="font-bold text-gray-800 text-sm">
                            {cm.user_full_name || cm.user_name}
                          </Text>
                          <Text className="text-[10px] text-gray-400">
                             {new Date(cm.created_at).toLocaleDateString('vi-VN')}
                          </Text>
                        </View>
                        <Text className="text-gray-700 text-sm mt-1">{cm.question}</Text>
                        
                        {/* Internal Replies / Answer */}
                        {(cm.answer || (cm.replies && cm.replies.length > 0)) && (
                          <View className="mt-3 bg-gray-50 p-3 rounded-lg border-l-2 border-red-500">
                            {cm.answer && (
                              <View className="mb-2">
                                <Text className="text-[11px] font-bold text-red-700">Admin trả lời:</Text>
                                <Text className="text-[11px] text-gray-600 mt-1 font-medium">{cm.answer}</Text>
                              </View>
                            )}
                            {cm.replies?.map(rp => (
                              <View key={rp.id} className="mt-2 border-t border-gray-100 pt-2">
                                <Text className="text-[10px] font-bold text-gray-800">{rp.user_full_name || rp.user_name}:</Text>
                                <Text className="text-[11px] text-gray-600">{rp.question}</Text>
                              </View>
                            ))}
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                ))
            )}
          </View>

          {/* ── Similar Products Section ── */}
          {similarProducts.length > 0 && (
            <View className="py-6 px-4 border-t border-gray-100">
              <Text className="text-lg font-bold text-gray-800 mb-4">Sản phẩm tương tự</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                {similarProducts.map((p) => (
                  <TouchableOpacity 
                    key={p.id} 
                    className="mr-4 w-36"
                    onPress={() => {
                        // In a real app we might need to push a new screen or use push()
                        navigation.navigate('ProductDetail', { productId: p.id });
                    }}
                  >
                    <View className="bg-gray-100 rounded-xl overflow-hidden aspect-square mb-2">
                      <Image source={{ uri: p.imageUrl || 'https://via.placeholder.com/150' }} className="w-full h-full" />
                    </View>
                    <Text className="text-gray-800 text-sm font-semibold" numberOfLines={2}>{p.name}</Text>
                    <Text className="text-red-600 font-bold mt-1">{(p.price || 0).toLocaleString('vi-VN')}đ</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* ── Recently Viewed Section ── */}
          {recentlyViewed.length > 0 && (
            <View className="py-6 px-4 border-t border-gray-100">
              <Text className="text-lg font-bold text-gray-800 mb-4">Sản phẩm đã xem</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                {recentlyViewed.map((p) => (
                  <TouchableOpacity 
                    key={p.id} 
                    className="mr-4 w-28"
                    onPress={() => {
                        navigation.navigate('ProductDetail', { productId: p.id });
                    }}
                  >
                    <View className="bg-gray-100 rounded-lg overflow-hidden aspect-square mb-2">
                      <Image source={{ uri: p.imageUrl || 'https://via.placeholder.com/150' }} className="w-full h-full" />
                    </View>
                    <Text className="text-gray-800 text-xs font-medium" numberOfLines={1}>{p.name}</Text>
                    <Text className="text-red-500 text-xs font-bold mt-1">{(p.price || 0).toLocaleString('vi-VN')}đ</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View className="flex-row items-center p-4 border-t border-gray-100 bg-white">
        <TouchableOpacity
          onPress={handleAddToCartAction}
          className="flex-1 bg-red-100 py-3 rounded-lg mr-2 items-center justify-center"
        >
          <Text className="text-[#DC2626] font-bold">Thêm vào giỏ</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={openQuickBuy}
          className="flex-1 bg-[#DC2626] py-3 rounded-lg items-center justify-center"
        >
          <Text className="text-white font-bold">Mua ngay</Text>
        </TouchableOpacity>
      </View>

      <QuickBuyModal
        visible={quickBuyVisible}
        product={product}
        onClose={() => setQuickBuyVisible(false)}
        onBuyNow={handleBuyNowAction}
      />
    </SafeAreaView>
  );
};

export default ProductDetailScreen;
