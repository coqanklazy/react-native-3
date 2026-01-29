import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainerRef } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFonts as useKarla, Karla_400Regular, Karla_600SemiBold } from '@expo-google-fonts/karla';
import { useFonts as usePlayfair, PlayfairDisplaySC_700Bold } from '@expo-google-fonts/playfair-display-sc';
import { View, ActivityIndicator } from 'react-native';

import { RootStackParamList } from './types/navigation';
import AppNavigator from './navigation/AppNavigator';
import { RealmService } from './services/RealmService';
import { STORAGE_KEYS } from './services/api';

export default function App(): React.JSX.Element {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);

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

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
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

      // Clear all auth tokens from AsyncStorage
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.SESSION_ID,
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
      ]);
    } catch (error) {
      console.log('Error clearing tokens:', error);
    }

    setIsLoggedIn(false);

    // Reset navigation stack to Login screen (not Intro to avoid 10s loading)
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
