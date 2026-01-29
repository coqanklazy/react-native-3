import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useProfile } from '../hooks/useProfile';
import { validateFullName } from '../utils/validation';

interface EditBasicInfoModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  currentName: string;
}

const EditBasicInfoModal: React.FC<EditBasicInfoModalProps> = ({
  visible,
  onClose,
  onSuccess,
  currentName,
}) => {
  const { updateProfile, updating, error, clearError } = useProfile();
  const [fullName, setFullName] = useState(currentName);
  const [nameError, setNameError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setFullName(currentName);
      setNameError(null);
      clearError();
    }
  }, [visible, currentName, clearError]);

  const handleValidateName = () => {
    const validation = validateFullName(fullName);
    if (!validation.isValid) {
      setNameError(validation.message || '');
    } else {
      setNameError(null);
    }
  };

  const handleSubmit = async () => {
    // Validate before submit
    handleValidateName();

    if (nameError) {
      return;
    }

    const updateData: any = {};
    if (fullName !== currentName) {
      updateData.fullName = fullName;
    }

    if (Object.keys(updateData).length === 0) {
      Alert.alert('Thông báo', 'Không có dữ liệu để cập nhật');
      return;
    }

    const success = await updateProfile(updateData);
    if (success) {
      Alert.alert('Thành công', 'Cập nhật thông tin thành công');
      onSuccess?.();
      onClose();
    } else {
      Alert.alert('Lỗi', error?.message || 'Cập nhật thất bại');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
        <View style={{
          backgroundColor: '#fff',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          paddingTop: 20,
          paddingHorizontal: 20,
          paddingBottom: 30,
          maxHeight: '85%'
        }}>
          {/* Header */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24
          }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1F2937' }}>
              Chỉnh sửa thông tin
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Full Name Field */}
            <View style={{ marginBottom: 20 }}>
              <Text style={{
                fontSize: 14,
                fontWeight: '600',
                color: '#374151',
                marginBottom: 8
              }}>
                Họ tên
              </Text>
              <TextInput
                value={fullName}
                onChangeText={setFullName}
                placeholder="Nhập họ tên"
                placeholderTextColor="#9CA3AF"
                onBlur={handleValidateName}
                style={{
                  borderWidth: 1,
                  borderColor: nameError ? '#DC2626' : '#D1D5DB',
                  borderRadius: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  fontSize: 16,
                  color: '#1F2937',
                  backgroundColor: '#F9FAFB'
                }}
              />
              {nameError && (
                <Text style={{ color: '#DC2626', fontSize: 12, marginTop: 4 }}>
                  {nameError}
                </Text>
              )}
            </View>

            {/* Error Message from Hook */}
            {error && (
              <View style={{
                backgroundColor: '#FEE2E2',
                borderLeftWidth: 4,
                borderLeftColor: '#DC2626',
                borderRadius: 8,
                padding: 12,
                marginBottom: 20
              }}>
                <Text style={{ color: '#991B1B', fontSize: 14 }}>
                  {error.message}
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={updating || nameError !== null}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 14,
              paddingHorizontal: 16,
              backgroundColor: updating || nameError !== null
                ? '#D1D5DB'
                : '#DC2626',
              borderRadius: 8,
              marginTop: 16
            }}
          >
            {updating ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <Ionicons name="save" size={20} color="white" />
                <Text style={{ color: 'white', fontWeight: '600', marginLeft: 8 }}>
                  Lưu thay đổi
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
export default EditBasicInfoModal;
