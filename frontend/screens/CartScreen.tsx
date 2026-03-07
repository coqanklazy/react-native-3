import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, Alert, StatusBar } from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../types/navigation';
import { useCartStore } from '../store/cartStore';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { User } from '../types/api';
import { StorageService } from '../utils/storage';
import { useAuth } from '../hooks/useAuth';

type Props = StackScreenProps<RootStackParamList, 'Cart'>;

const CartScreen: React.FC<Props> = ({ navigation }) => {
    const { currentUser } = useAuth();
    const userId = currentUser?.id?.toString() || 'guest';
    const userCart = useCartStore((state) => state.carts[userId]);

    const { removeFromCart, updateQuantity, getTotalPrice, clearCart, getCartItems,
        getTotalItems, getSelectedTotalPrice, getSelectedTotalItems,
        toggleItemSelection, toggleAllSelection
    } = useCartStore();

    const items = getCartItems(userId);

    const handleDecrease = (productId: number, currentQuantity: number) => {
        if (currentQuantity > 1) {
            updateQuantity(userId, productId, currentQuantity - 1);
        } else {
            Alert.alert(
                'Xóa sản phẩm',
                'Bạn có chắc muốn xóa sản phẩm này khỏi giỏ hàng?',
                [
                    { text: 'Hủy', style: 'cancel' },
                    { text: 'Xóa', onPress: () => removeFromCart(userId, productId), style: 'destructive' },
                ]
            );
        }
    };

    const handleIncrease = (productId: number, currentQuantity: number) => {
        updateQuantity(userId, productId, currentQuantity + 1);
    };

    const handleRemove = (productId: number) => {
        removeFromCart(userId, productId);
    };

    const handleCheckout = () => {
        const selectedCount = getSelectedTotalItems(userId);
        if (selectedCount === 0) {
            Alert.alert('Thông báo', 'Bạn chưa chọn sản phẩm nào để thanh toán');
            return;
        }
        navigation.navigate('Checkout', { fromQuickBuy: false });
    };

    const isAllSelected = items.length > 0 && items.every(item => item.selected !== false);

    const renderItem = ({ item }: { item: any }) => (
        <View className="flex-row p-4 border-b border-gray-100 bg-white items-center">
            {/* Selection Checkbox */}
            <TouchableOpacity
                onPress={() => toggleItemSelection(userId, item.product.id)}
                className="mr-3"
            >
                <Ionicons
                    name={item.selected !== false ? "checkbox" : "square-outline"}
                    size={24}
                    color={item.selected !== false ? "#EF4444" : "#D1D5DB"}
                />
            </TouchableOpacity>

            {/* Product Image */}
            <View className="w-20 h-20 bg-gray-50 rounded-lg overflow-hidden justify-center items-center border border-gray-200">
                <Image
                    source={{ uri: item.product.imageUrl || 'https://via.placeholder.com/150' }}
                    className="w-full h-full"
                    resizeMode="contain"
                />
            </View>

            {/* Product Info */}
            <View className="flex-1 ml-3">
                <View className="flex-row justify-between">
                    <Text className="text-gray-800 font-semibold mb-1 flex-1" numberOfLines={2}>
                        {item.product.name}
                    </Text>
                    <TouchableOpacity onPress={() => handleRemove(item.product.id)} className="ml-2 pt-1">
                        <Ionicons name="trash-outline" size={20} color="#EF4444" />
                    </TouchableOpacity>
                </View>

                <Text className="text-red-500 font-bold mb-2">
                    {item.product.price.toLocaleString('vi-VN')} đ
                </Text>

                {/* Quantity Controls */}
                <View className="flex-row items-center">
                    <TouchableOpacity
                        onPress={() => handleDecrease(item.product.id, item.quantity)}
                        className="w-8 h-8 bg-gray-100 items-center justify-center rounded-l-md border border-gray-200"
                    >
                        <Ionicons name="remove" size={16} color="#333" />
                    </TouchableOpacity>
                    <View className="w-10 h-8 bg-white items-center justify-center border-t border-b border-gray-200">
                        <Text className="font-medium">{item.quantity}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => handleIncrease(item.product.id, item.quantity)}
                        className="w-8 h-8 bg-gray-100 items-center justify-center rounded-r-md border border-gray-200"
                    >
                        <Ionicons name="add" size={16} color="#333" />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['top', 'bottom']}>
            <StatusBar barStyle="dark-content" backgroundColor="#fff" />

            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shadow-sm z-10">
                <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 -ml-2">
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-gray-800">Giỏ hàng ({items.length})</Text>
                <TouchableOpacity
                    onPress={() => clearCart(userId)}
                    className="p-2 -mr-2"
                    disabled={items.length === 0}
                >
                    <Text className={`font-medium ${items.length > 0 ? 'text-red-500' : 'text-gray-300'}`}>Xóa tất cả</Text>
                </TouchableOpacity>
            </View>

            {items.length === 0 ? (
                <View className="flex-1 justify-center items-center p-6 space-y-4">
                    <View className="w-40 h-40 bg-gray-100 rounded-full items-center justify-center mb-4">
                        <Ionicons name="cart-outline" size={80} color="#9CA3AF" />
                    </View>
                    <Text className="text-xl text-gray-600 font-semibold mb-2 text-center">Giỏ hàng trống</Text>
                    <Text className="text-gray-500 text-center mb-6">Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy thêm sản phẩm nhé!</Text>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Homepage')}
                        className="bg-red-500 py-3 px-8 rounded-full shadow-sm"
                    >
                        <Text className="text-white font-bold text-base">Tiếp tục mua sắm</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <>
                    <FlatList
                        data={items}
                        keyExtractor={(item) => item.product.id.toString()}
                        renderItem={renderItem}
                        contentContainerStyle={{ paddingBottom: 20 }}
                        showsVerticalScrollIndicator={false}
                    />

                    {/* Checkout Footer */}
                    <View className="bg-white p-4 border-t border-gray-200 shadow-lg pb-safe">
                        <View className="flex-row justify-between items-center mb-4">
                            <View className="flex-row items-center">
                                <TouchableOpacity
                                    onPress={() => toggleAllSelection(userId, !isAllSelected)}
                                    className="mr-2 flex-row items-center"
                                >
                                    <Ionicons
                                        name={isAllSelected ? "checkbox" : "square-outline"}
                                        size={24}
                                        color={isAllSelected ? "#EF4444" : "#D1D5DB"}
                                    />
                                    <Text className="ml-2 text-gray-600">Tất cả</Text>
                                </TouchableOpacity>
                            </View>
                            <View className="items-end">
                                <Text className="text-gray-600 font-medium text-xs mb-1">Tổng thanh toán:</Text>
                                <Text className="text-xl font-bold text-red-600">
                                    {getSelectedTotalPrice(userId).toLocaleString('vi-VN')} đ
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            onPress={handleCheckout}
                            className="bg-red-600 py-3.5 rounded-xl items-center shadow-md active:bg-red-700"
                        >
                            <Text className="text-white font-bold text-lg">Mua hàng ({getSelectedTotalItems(userId)})</Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </SafeAreaView>
    );
};

export default CartScreen;
