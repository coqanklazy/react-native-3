import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

interface AddressModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (address: AddressFormData) => void;
  initialData: AddressFormData;
}

export interface AddressFormData {
  fullName: string;
  phoneNumber: string;
  address: string;
  ward: string;
  district: string;
  city: string;
}

const AddressModal: React.FC<AddressModalProps> = ({
  visible,
  onClose,
  onSave,
  initialData,
}) => {
  const [formData, setFormData] = useState<AddressFormData>(initialData);

  const [provinces, setProvinces] = useState<any[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<any>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<any>(null);
  const [selectingField, setSelectingField] = useState<
    "city" | "district" | "ward" | null
  >(null);

  useEffect(() => {
    if (visible) {
      setFormData(initialData);
    }
  }, [initialData, visible]);

  useEffect(() => {
    const fetchVnProvinces = async () => {
      try {
        const res = await fetch("https://provinces.open-api.vn/api/?depth=3");
        const data = await res.json();
        setProvinces(data);
      } catch (error) {
        console.error("Error fetching provinces API", error);
      }
    };
    fetchVnProvinces();
  }, []);

  const handleSave = () => {
    if (
      !formData.fullName.trim() ||
      !formData.phoneNumber.trim() ||
      !formData.address.trim() ||
      !formData.ward.trim() ||
      !formData.district.trim() ||
      !formData.city.trim()
    ) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin giao hàng.");
      return;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phoneNumber.replace(/\s/g, ""))) {
      Alert.alert("Lỗi", "Số điện thoại không hợp lệ (cần 10 số).");
      return;
    }

    onSave(formData);
  };

  const renderLocationSelection = () => {
    if (!selectingField) return null;

    let dataList = [];
    let title = "";

    if (selectingField === "city") {
      dataList = provinces;
      title = "Chọn Tỉnh/Thành phố";
    } else if (selectingField === "district") {
      dataList = selectedProvince?.districts || [];
      title = "Chọn Quận/Huyện";
    } else if (selectingField === "ward") {
      dataList = selectedDistrict?.wards || [];
      title = "Chọn Phường/Xã";
    }

    return (
      <Modal
        visible={!!selectingField}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectingField(null)}
      >
        <SafeAreaView className="flex-1 bg-white">
          <View className="flex-row items-center px-4 py-3 border-b border-gray-200">
            <TouchableOpacity
              onPress={() => setSelectingField(null)}
              className="p-2 -ml-2"
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text className="text-lg font-bold text-gray-800 ml-2 flex-1">
              {title}
            </Text>
          </View>
          <FlatList
            data={dataList}
            keyExtractor={(item) => item.code.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  if (selectingField === "city") {
                    setFormData({
                      ...formData,
                      city: item.name,
                      district: "",
                      ward: "",
                    });
                    setSelectedProvince(item);
                    setSelectingField(null);
                  } else if (selectingField === "district") {
                    setFormData({ ...formData, district: item.name, ward: "" });
                    setSelectedDistrict(item);
                    setSelectingField(null);
                  } else if (selectingField === "ward") {
                    setFormData({ ...formData, ward: item.name });
                    setSelectingField(null);
                  }
                }}
                className="px-4 py-4 border-b border-gray-100"
              >
                <Text className="text-base text-gray-800">{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-row items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
          <TouchableOpacity onPress={onClose} className="p-2 -ml-2">
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-gray-800">
            Chỉnh sửa địa chỉ
          </Text>
          <View className="p-2 w-8" />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1"
        >
          <ScrollView className="p-4" keyboardShouldPersistTaps="handled">
            <View className="bg-white p-4 rounded-xl space-y-3 shadow-sm border border-gray-100">
              <TextInput
                placeholder="Họ và tên người nhận"
                value={formData.fullName}
                onChangeText={(text) =>
                  setFormData({ ...formData, fullName: text })
                }
                className="border-b border-gray-200 py-3 text-base"
              />
              <TextInput
                placeholder="Số điện thoại"
                keyboardType="phone-pad"
                value={formData.phoneNumber}
                onChangeText={(text) =>
                  setFormData({ ...formData, phoneNumber: text })
                }
                className="border-b border-gray-200 py-3 text-base"
              />

              <TouchableOpacity
                className="border-b border-gray-200 py-3 flex-row justify-between items-center"
                onPress={() => setSelectingField("city")}
              >
                <Text
                  className={`text-base ${formData.city ? "text-gray-800" : "text-gray-400"}`}
                >
                  {formData.city || "Tỉnh/Thành phố"}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#9ca3af" />
              </TouchableOpacity>

              <TouchableOpacity
                className="border-b border-gray-200 py-3 flex-row justify-between items-center"
                onPress={() => {
                  if (!selectedProvince)
                    Alert.alert(
                      "Thông báo",
                      "Vui lòng chọn Tỉnh/Thành phố trước",
                    );
                  else setSelectingField("district");
                }}
              >
                <Text
                  className={`text-base ${formData.district ? "text-gray-800" : "text-gray-400"}`}
                >
                  {formData.district || "Quận/Huyện"}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#9ca3af" />
              </TouchableOpacity>

              <TouchableOpacity
                className="border-b border-gray-200 py-3 flex-row justify-between items-center"
                onPress={() => {
                  if (!selectedDistrict)
                    Alert.alert("Thông báo", "Vui lòng chọn Quận/Huyện trước");
                  else setSelectingField("ward");
                }}
              >
                <Text
                  className={`text-base ${formData.ward ? "text-gray-800" : "text-gray-400"}`}
                >
                  {formData.ward || "Phường/Xã"}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#9ca3af" />
              </TouchableOpacity>

              <TextInput
                placeholder="Địa chỉ cụ thể (Số nhà, Tên đường...)"
                value={formData.address}
                onChangeText={(text) =>
                  setFormData({ ...formData, address: text })
                }
                className="border-b border-gray-200 py-3 text-base"
                multiline
              />
            </View>

            <TouchableOpacity
              onPress={handleSave}
              className="mt-6 bg-[#DC2626] py-4 rounded-xl items-center shadow-md mb-8"
            >
              <Text className="text-white font-bold text-lg">Lưu địa chỉ</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
      {renderLocationSelection()}
    </Modal>
  );
};

export default AddressModal;
