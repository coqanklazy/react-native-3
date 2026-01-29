import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    TextInput,
    StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useProfile } from '../hooks/useProfile';
import { validateFullName } from '../utils/validation';
import { NavigationProps } from '../types/navigation';

const EditNameScreen: React.FC<NavigationProps> = ({ navigation }) => {
    const { user, updateProfile, updating, error, clearError } = useProfile();
    const [fullName, setFullName] = useState(user?.fullName || '');
    const [nameError, setNameError] = useState<string | null>(null);

    useEffect(() => {
        if (user?.fullName) {
            setFullName(user.fullName);
        }
    }, [user]);

    useEffect(() => {
        return () => {
            clearError();
        };
    }, [clearError]);

    const handleValidateName = () => {
        const validation = validateFullName(fullName);
        if (!validation.isValid) {
            setNameError(validation.message || '');
            return false;
        } else {
            setNameError(null);
            return true;
        }
    };

    const handleSubmit = async () => {
        if (!handleValidateName()) {
            return;
        }

        if (fullName === user?.fullName) {
            navigation.goBack();
            return;
        }

        const success = await updateProfile({ fullName });
        if (success) {
            Alert.alert('Thành công', 'Cập nhật tên thành công', [
                { text: 'OK', onPress: () => navigation.goBack() }
            ]);
        }
    };

    return (
        <View className="flex-1 bg-gray-50">
            <StatusBar barStyle="light-content" backgroundColor="#DC2626" />

            {/* Header */}
            <View className="bg-red-600 pt-12 pb-4 px-4 flex-row items-center">
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={28} color="white" />
                </TouchableOpacity>
                <Text className="text-white font-bold text-lg ml-4 flex-1">Chỉnh sửa tên</Text>
            </View>

            <ScrollView className="flex-1 p-4">
                {/* Full Name Field */}
                <View className="mb-4">
                    <Text className="text-sm font-semibold text-gray-700 mb-2">Họ tên</Text>
                    <TextInput
                        value={fullName}
                        onChangeText={setFullName}
                        placeholder="Nhập họ tên"
                        placeholderTextColor="#9CA3AF"
                        onBlur={handleValidateName}
                        className={`border rounded-lg px-4 py-3 text-base text-gray-800 bg-white ${nameError ? 'border-red-500' : 'border-gray-300'
                            }`}
                    />
                    {nameError && (
                        <Text className="text-red-500 text-xs mt-1">{nameError}</Text>
                    )}
                </View>

                {/* Error Message */}
                {error && (
                    <View className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                        <Text className="text-red-700 text-sm">{error.message}</Text>
                    </View>
                )}

                {/* Submit Button */}
                <TouchableOpacity
                    onPress={handleSubmit}
                    disabled={updating || nameError !== null}
                    className={`flex-row items-center justify-center p-4 rounded-lg mt-4 ${updating || nameError !== null ? 'bg-gray-300' : 'bg-red-600'
                        }`}
                >
                    {updating ? (
                        <ActivityIndicator color="white" size="small" />
                    ) : (
                        <>
                            <Ionicons name="save" size={20} color="white" />
                            <Text className="text-white font-semibold ml-2">Lưu thay đổi</Text>
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};

export default EditNameScreen;
