import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useProfile } from '../hooks/useProfile';
import { getAvatarUrl } from '../utils/imageHelper';

interface AvatarUploadModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  currentAvatarUrl?: string;
}

const AvatarUploadModal: React.FC<AvatarUploadModalProps> = ({
  visible,
  onClose,
  onSuccess,
  currentAvatarUrl,
}) => {
  const { uploading, error, clearError, uploadAvatar } = useProfile();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const pickImageFromGallery = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Lỗi', 'Cần quyền truy cập thư viện ảnh để chọn ảnh');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error: any) {
      Alert.alert('Lỗi', 'Không thể mở thư viện ảnh');
    }
  }, []);

  const pickImageFromCamera = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Lỗi', 'Cần quyền truy cập camera để chụp ảnh');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error: any) {
      Alert.alert('Lỗi', 'Không thể mở camera');
    }
  }, []);

  const handleUpload = async () => {
    if (!selectedImage) {
      Alert.alert('Thông báo', 'Vui lòng chọn ảnh');
      return;
    }

    const success = await uploadAvatar(selectedImage);
    if (success) {
      Alert.alert('Thành công', 'Cập nhật ảnh đại diện thành công');
      onSuccess?.();
      handleClose();
    } else {
      Alert.alert('Lỗi', error?.message || 'Cập nhật ảnh thất bại');
    }
  };

  const handleClose = () => {
    setSelectedImage(null);
    clearError();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      statusBarTranslucent={true} // Ensure modal covers the entire screen, including status bar and potential nav bar areas
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
        <View style={{
          backgroundColor: '#fff',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          paddingTop: 20,
          paddingHorizontal: 20,
          paddingBottom: 50, // Increased padding to ensure coverage of bottom area
          width: '100%',     // Ensure full width
        }}>
          {/* Header */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24
          }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1F2937' }}>
              Cập nhật ảnh đại diện
            </Text>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons name="close" size={28} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ marginBottom: 16 }}>
            {/* Current Avatar Preview */}
            {currentAvatarUrl && !selectedImage && (
              <View style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 12 }}>
                  Ảnh hiện tại
                </Text>
                <View style={{
                  width: 128,
                  height: 128,
                  borderRadius: 12,
                  overflow: 'hidden',
                  alignSelf: 'center',
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: '#E5E7EB'
                }}>
                  <Image
                    source={{ uri: getAvatarUrl(currentAvatarUrl, true) || '' }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                </View>
              </View>
            )}

            {/* Selected Image Preview */}
            {selectedImage && (
              <View style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 12 }}>
                  Ảnh được chọn
                </Text>
                <View style={{
                  width: 128,
                  height: 128,
                  borderRadius: 12,
                  overflow: 'hidden',
                  alignSelf: 'center',
                  marginBottom: 16,
                  borderWidth: 2,
                  borderColor: '#DC2626'
                }}>
                  <Image
                    source={{ uri: selectedImage }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                </View>
              </View>
            )}

            {/* Pick Image Options */}
            {!selectedImage && (
              <View style={{ marginBottom: 24 }}>
                <TouchableOpacity
                  onPress={pickImageFromCamera}
                  disabled={uploading}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderWidth: 2,
                    borderColor: '#DC2626',
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                    opacity: uploading ? 0.6 : 1
                  }}
                >
                  <Ionicons name="camera" size={24} color="#DC2626" />
                  <View style={{ marginLeft: 16, flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937' }}>
                      Chụp ảnh
                    </Text>
                    <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>
                      Sử dụng camera
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#DC2626" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={pickImageFromGallery}
                  disabled={uploading}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    borderWidth: 2,
                    borderColor: '#DC2626',
                    borderRadius: 12,
                    padding: 16,
                    opacity: uploading ? 0.6 : 1
                  }}
                >
                  <Ionicons name="images" size={24} color="#DC2626" />
                  <View style={{ marginLeft: 16, flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937' }}>
                      Chọn từ thư viện
                    </Text>
                    <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>
                      Chọn từ điện thoại
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color="#DC2626" />
                </TouchableOpacity>
              </View>
            )}

            {/* Error Message */}
            {error && (
              <View style={{
                backgroundColor: '#FEE2E2',
                borderLeftWidth: 4,
                borderLeftColor: '#DC2626',
                borderRadius: 8,
                padding: 12,
                marginBottom: 16
              }}>
                <Text style={{ color: '#991B1B', fontSize: 14 }}>
                  {error.message}
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Action Buttons */}
          {selectedImage && (
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={() => setSelectedImage(null)}
                disabled={uploading}
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderWidth: 1,
                  borderColor: '#E5E7EB',
                  borderRadius: 8,
                  opacity: uploading ? 0.6 : 1
                }}
              >
                <Ionicons name="close" size={20} color="#6B7280" />
                <Text style={{ color: '#374151', fontWeight: '600', marginLeft: 8 }}>
                  Chọn lại
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleUpload}
                disabled={uploading}
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  backgroundColor: uploading ? '#D1D5DB' : '#DC2626',
                  borderRadius: 8
                }}
              >
                {uploading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <>
                    <Ionicons name="cloud-upload" size={20} color="white" />
                    <Text style={{ color: 'white', fontWeight: '600', marginLeft: 8 }}>
                      Tải lên
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default AvatarUploadModal;
