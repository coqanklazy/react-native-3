import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, Alert, StatusBar } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { ApiService } from '../services/api';
import { Product } from '../types/api';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

type Props = StackScreenProps<RootStackParamList, 'ProductDetail'>;

const ProductDetailScreen: React.FC<Props> = ({ route, navigation }) => {
    const { productId } = route.params;
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProductDetail();
    }, [productId]);

    const fetchProductDetail = async () => {
        try {
            setLoading(true);
            const response = await ApiService.getProductById(productId);
            if (response.success && response.data) {
                setProduct(response.data);
            } else {
                Alert.alert('Lỗi', response.message || 'Không thể tải thông tin sản phẩm');
                navigation.goBack();
            }
        } catch (error) {
            console.error('Error fetching product detail:', error);
            Alert.alert('Lỗi', 'Đã có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = () => {
        Alert.alert('Thông báo', 'Đã thêm vào giỏ hàng (Chức năng đang phát triển)');
    };

    const handleBuyNow = () => {
        Alert.alert('Thông báo', 'Chức năng đang phát triển');
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
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            <StatusBar barStyle="dark-content" backgroundColor="white" />
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-gray-800" numberOfLines={1}>
                    Chi tiết sản phẩm
                </Text>
                <TouchableOpacity className="p-2">
                    <Ionicons name="cart-outline" size={24} color="#333" />
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Product Image */}
                <View className="w-full h-80 bg-gray-50 justify-center items-center">
                    <Image
                        source={{ uri: product.imageUrl ? (product.imageUrl.startsWith('http') ? product.imageUrl : product.imageUrl) : 'https://via.placeholder.com/400' }}
                        className="w-full h-full"
                        resizeMode="contain"
                    />
                </View>

                {/* Product Info */}
                <View className="p-4">
                    <Text className="text-2xl font-bold text-gray-800 mb-2">{product.name}</Text>

                    <View className="flex-row items-center mb-4">
                        <Text className="text-[#DC2626] text-xl font-bold mr-2">
                            {product.price.toLocaleString('vi-VN')} đ
                        </Text>
                        {product.originalPrice && product.originalPrice > product.price && (
                            <Text className="text-gray-400 line-through text-sm">
                                {product.originalPrice.toLocaleString('vi-VN')} đ
                            </Text>
                        )}
                    </View>

                    <View className="flex-row items-center mb-4">
                        <Ionicons name="star" size={16} color="#FFD700" />
                        <Text className="ml-1 text-gray-600 font-medium">{product.rating} / 5</Text>
                        <Text className="mx-2 text-gray-300">|</Text>
                        <Text className="text-gray-500">{product.soldCount} Đã bán</Text>
                    </View>

                    <View className="border-t border-gray-100 py-4">
                        <Text className="text-lg font-bold text-gray-800 mb-2">Mô tả sản phẩm</Text>
                        <Text className="text-gray-600 leading-6">
                            {product.description ? product.description.replace(/<[^>]*>?/gm, '') : 'Chưa có mô tả cho sản phẩm này.'}
                        </Text>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Action Bar */}
            <View className="flex-row items-center p-4 border-t border-gray-100 bg-white">
                <TouchableOpacity
                    onPress={handleAddToCart}
                    className="flex-1 bg-red-100 py-3 rounded-lg mr-2 items-center justify-center"
                >
                    <Text className="text-[#DC2626] font-bold">Thêm vào giỏ</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={handleBuyNow}
                    className="flex-1 bg-[#DC2626] py-3 rounded-lg items-center justify-center"
                >
                    <Text className="text-white font-bold">Mua ngay</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

export default ProductDetailScreen;
