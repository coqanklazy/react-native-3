import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainerRef } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts as useKarla, Karla_400Regular, Karla_600SemiBold } from '@expo-google-fonts/karla';
import { useFonts as usePlayfair, PlayfairDisplaySC_700Bold } from '@expo-google-fonts/playfair-display-sc';
import { View, ActivityIndicator } from 'react-native';
import Toast, { BaseToast, InfoToast } from 'react-native-toast-message';

// 🎨 Cấu hình giao diện thông báo giống Hệ thống (giống ảnh bạn gửi)
const toastConfig = {
  info: (props: any) => (
    <InfoToast
      {...props}
      style={{ 
        borderLeftColor: '#4F46E5', // Màu tím Indigo
        height: 80, 
        width: '94%',
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
      }}
      contentContainerStyle={{ paddingHorizontal: 20 }}
      text1Style={{
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1F2937'
      }}
      text2Style={{
        fontSize: 14,
        color: '#4B5563'
      }}
    />
  ),
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{ 
        borderLeftColor: '#10B981', 
        height: 80, 
        width: '94%',
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
      }}
      text1Style={{ fontSize: 16, fontWeight: 'bold' }}
      text2Style={{ fontSize: 14 }}
    />
  ),
};

import { RootStackParamList } from './types/navigation';
import AppNavigator from './navigation/AppNavigator';
import { RealmService } from './services/RealmService';
import { STORAGE_KEYS } from './services/api';
import { AuthProvider } from './store/AuthProvider';
import { useAuth } from './hooks/useAuth';
import { requestNotificationPermission, setupSocketNotificationListener } from './services/NotificationHelper';
import { connectSocket, disconnectSocket } from './services/SocketService';

// Inner component that has access to AuthContext
function AppInner() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);
  const { login: authLogin, logout: authLogout } = useAuth();

  const [karlaLoaded] = useKarla({ Karla_400Regular, Karla_600SemiBold });
  const [playfairLoaded] = usePlayfair({ PlayfairDisplaySC_700Bold });
  const fontsLoaded = karlaLoaded && playfairLoaded;

  // Check if user is already logged in when app starts
  useEffect(() => {
    bootstrapAsync();
    
    // Xin quyền và thiết lập lắng nghe thông báo hệ thống
    requestNotificationPermission();
    const unsubNotifications = setupSocketNotificationListener();
    
    return () => {
      unsubNotifications();
      disconnectSocket();
    };
  }, []);

  const bootstrapAsync = async () => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);

      if (token && userData) {
        setIsLoggedIn(true);
        const user = JSON.parse(userData);
        authLogin(user);
        
        // Kết nối socket nếu đã có token
        connectSocket(token);
      } else {
        setIsLoggedIn(false);
      }
    } catch (e) {
      console.log('Error checking auth status:', e);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (!fontsLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator />
      </View>
    );
  }

  const handleLoginSuccess = async () => {
    setIsLoggedIn(true);
    // Read user from AsyncStorage (saved by ApiService.login) and sync with AuthProvider
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      if (userData) {
        const user = JSON.parse(userData);
        authLogin(user);
      }
    } catch (e) {
      console.log('Error reading user after login:', e);
    }
    // Reset navigation stack to clear auth screen history
    setTimeout(async () => {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (token) connectSocket(token);
      
      navigationRef.current?.reset({
        index: 0,
        routes: [{ name: 'Homepage' }],
      });
    }, 0);
  };

  const handleLogout = async () => {
    try {
      // Clear user data using RealmService
      await RealmService.clearUserData();
    } catch (error) {
      console.log('Error clearing realm data:', error);
    }

    // Use AuthProvider logout (clears session tokens)
    await authLogout();
    setIsLoggedIn(false);

    // Reset navigation stack to Login screen
    setTimeout(() => {
      navigationRef.current?.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }, 100);
  };

  return (
    <>
      <StatusBar style="auto" />
      <AppNavigator
        navigationRef={navigationRef}
        isLoggedIn={isLoggedIn}
        isLoading={isLoading}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
      />
    </>
  );
}

// Main App wraps AppInner in AuthProvider so useAuth() works everywhere
export default function App(): React.JSX.Element {
  return (
    <AuthProvider>
      <AppInner />
      <Toast config={toastConfig} /> 
    </AuthProvider>
  );
}
