import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

import IntroScreen from './screens/IntroScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import HomepageScreen from './screens/HomepageScreen';
import { RootStackParamList } from './types/navigation';

const Stack = createStackNavigator<RootStackParamList>();

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
    <NavigationContainer ref={navigationRef}>
      <StatusBar style="auto" />
      <Stack.Navigator
        initialRouteName="Intro"
        screenOptions={{
          headerShown: false,
          gestureEnabled: false,
        }}
      >
        {/* Auth Screens */}
        <Stack.Screen
          name="Intro"
          component={IntroScreen}
          options={{
            animationEnabled: !isLoggedIn,
          }}
        />
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{
            animationEnabled: !isLoggedIn,
          }}
        />
        <Stack.Screen
          name="Login"
          options={{
            animationEnabled: !isLoggedIn,
          }}
        >
          {(props) => (
            <LoginScreen {...props} onLoginSuccess={handleLoginSuccess} />
          )}
        </Stack.Screen>
        <Stack.Screen
          name="Register"
          options={{
            animationEnabled: !isLoggedIn,
          }}
        >
          {(props) => (
            <RegisterScreen {...props} onRegisterSuccess={handleLoginSuccess} />
          )}
        </Stack.Screen>
        <Stack.Screen
          name="ForgotPassword"
          component={ForgotPasswordScreen}
          options={{
            animationEnabled: !isLoggedIn,
          }}
        />

        {/* Homepage Screen */}
        <Stack.Screen
          name="Homepage"
          options={{
            animationTypeForReplace: isLoggedIn ? 'pop' : 'default',
            headerLeft: () => null, // Disable back button when logged in
            gestureEnabled: false,
          }}
        >
          {(props) => (
            <HomepageScreen {...props} onLogout={handleLogout} />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
