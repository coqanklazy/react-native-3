import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainerRef } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts as useKarla, Karla_400Regular, Karla_600SemiBold } from '@expo-google-fonts/karla';
import { useFonts as usePlayfair, PlayfairDisplaySC_700Bold } from '@expo-google-fonts/playfair-display-sc';
import { View, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';

import { RootStackParamList } from './types/navigation';
import AppNavigator from './navigation/AppNavigator';
import { RealmService } from './services/RealmService';
import { STORAGE_KEYS } from './services/api';
import { AuthProvider } from './store/AuthProvider';
import { useAuth } from './hooks/useAuth';

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
  }, []);

  const bootstrapAsync = async () => {
    try {
      // Check if user has saved token and user data from previous session
      const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);

      // If both token and user data exist, user is still logged in
      if (token && userData) {
        setIsLoggedIn(true);
        // Sync with AuthProvider
        const user = JSON.parse(userData);
        authLogin(user);
      } else {
        // No valid session, user needs to log in
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
    setTimeout(() => {
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
      <Toast />
    </>
  );
}

// Main App wraps AppInner in AuthProvider so useAuth() works everywhere
export default function App(): React.JSX.Element {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}
