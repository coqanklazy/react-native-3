import { useState, useEffect } from "react";
import { User } from "../types/api";
import { ApiService } from "../services/api";
import { StorageService } from "../utils/storage";

export const useHomepage = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const loadUserData = async () => {
    // 1. Tải từ Storage trước để hiển thị ngay lập tức
    try {
      const storedUser = await StorageService.getUser();
      if (storedUser) {
        setCurrentUser(storedUser);
      }
    } catch (error) {
      console.log("Error loading user from storage:", error);
    }

    // 2. Sau đó fetch từ API để cập nhật dữ liệu mới nhất
    try {
      const token = await ApiService.getAccessToken();
      if (!token) return;

      const user = await ApiService.getCurrentUser();
      setCurrentUser(user);

      // Lưu lại vào storage
      if (user) {
        await StorageService.updateUser(user);
      }
    } catch (error) {
      console.error("Error syncing user data with API:", error);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

  return {
    currentUser,
    searchQuery,
    setSearchQuery,
  };
};
