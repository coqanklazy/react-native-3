import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainerRef } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { RootStackParamList } from './types/navigation';
import AppNavigator from './navigation/AppNavigator';

export default function App(): React.JSX.Element {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);

  // Check if user is already logged in when app starts
  useEffect(() => {
    bootstrapAsync();
  }, []);

  const bootstrapAsync = async () => {
    try {
      // 🔧 TEMPORARY: Force clear all tokens for testing
      // TODO: Remove this block when done testing
      await AsyncStorage.multiRemove([
        'sessionId',
        'userData',
        'accessToken',
        'refreshToken',
        'userToken'
      ]);
      // 🔧 END TEMPORARY

      const token = await AsyncStorage.getItem('userToken');

      // 🔧 FORCE: Always start from Login for testing
      setIsLoggedIn(false);
    } catch (e) {
      console.log('Error checking auth status:', e);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

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
      // Clear ALL tokens from AsyncStorage (same keys as in api.ts clearSession)
      await AsyncStorage.multiRemove([
        'sessionId',
        'userData',
        'accessToken',
        'refreshToken',
        'userToken'
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
