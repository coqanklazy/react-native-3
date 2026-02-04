import React from 'react';
import { View, Text, ImageBackground, TouchableOpacity } from 'react-native';

interface PromoBannerProps {
    onPress?: () => void;
}

const PromoBanner: React.FC<PromoBannerProps> = ({ onPress }) => {
    return (
        <TouchableOpacity
            activeOpacity={0.9}
            onPress={onPress}
            className="rounded-2xl overflow-hidden shadow-lg mx-4 my-2 h-44 border-2 border-white"
        >
            <ImageBackground
                source={{ uri: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' }}
                className="w-full h-full flex-1 justify-center"
                resizeMode="cover"
            >
                {/* Simple Gradient Overlay using rgba */}
                <View style={{ backgroundColor: 'rgba(0,0,0,0.5)', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />

                <View className="px-6 py-2 z-10 w-full items-start">
                    <View className="flex-row items-center space-x-2 mb-2">
                        <View className="bg-brand-primary px-3 py-1 rounded-full">
                            <Text className="text-white font-bold text-xs uppercase">Hot Deal</Text>
                        </View>
                        <View className="bg-yellow-400 px-3 py-1 rounded-full">
                            <Text className="text-brand-text font-bold text-xs uppercase">Giảm 50%</Text>
                        </View>
                    </View>

                    <Text className="text-white font-display text-3xl mb-1 leading-tight shadow-sm">
                        SẢN PHẨM GIÁ HỜI
                    </Text>
                    <Text className="text-gray-200 font-bodyBold text-base mb-4 italic">
                        Mua sắm thả ga, không lo về giá!
                    </Text>

                    <TouchableOpacity
                        onPress={onPress}
                        className="bg-brand-cta px-6 py-3 rounded-full shadow-lg active:scale-95 transform transition"
                        style={{ elevation: 5 }}
                    >
                        <Text className="text-white font-bold font-body text-sm uppercase tracking-wider">
                            Mua Ngay ➔
                        </Text>
                    </TouchableOpacity>
                </View>
            </ImageBackground>
        </TouchableOpacity>
    );
};

export default PromoBanner;
