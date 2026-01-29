import React from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import IntroScreen from '../screens/IntroScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import VerifyRegisterOTPScreen from '../screens/VerifyRegisterOTPScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import HomepageScreen from '../screens/HomepageScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import EditEmailScreen from '../screens/EditEmailScreen';
import EditPhoneScreen from '../screens/EditPhoneScreen';
import EditNameScreen from '../screens/EditNameScreen';
import { RootStackParamList } from '../types/navigation';

const Stack = createStackNavigator<RootStackParamList>();

interface AppNavigatorProps {
  navigationRef: React.RefObject<NavigationContainerRef<RootStackParamList> | null>;
  isLoggedIn: boolean;
  isLoading: boolean;
  onLoginSuccess: () => void;
  onLogout: () => void;
}

const AppNavigator: React.FC<AppNavigatorProps> = ({
  navigationRef,
  isLoggedIn,
  isLoading,
  onLoginSuccess,
  onLogout,
}) => {
  return (
    <NavigationContainer ref={navigationRef as React.RefObject<NavigationContainerRef<RootStackParamList>>}>
      <Stack.Navigator
        initialRouteName="Intro"
        screenOptions={{
          headerShown: false,
          gestureEnabled: false,
        }}
      >
        {/* Auth Screens */}
        <Stack.Screen name="Intro" component={IntroScreen} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login">
          {(props) => (
            <LoginScreen {...props} onLoginSuccess={onLoginSuccess} />
          )}
        </Stack.Screen>
        <Stack.Screen name="Register">
          {(props) => (
            <RegisterScreen {...props} onRegisterSuccess={onLoginSuccess} />
          )}
        </Stack.Screen>
        <Stack.Screen name="VerifyRegisterOTP" component={VerifyRegisterOTPScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />

        {/* Homepage Screen */}
        <Stack.Screen
          name="Homepage"
          options={{
            animationTypeForReplace: isLoggedIn ? 'pop' : 'push',
            headerLeft: () => null,
            gestureEnabled: false,
          }}
        >
          {(props) => (
            <HomepageScreen {...props} onLogout={onLogout} />
          )}
        </Stack.Screen>

        {/* Shop Screens */}
        <Stack.Screen
          name="Profile"
          options={{
            headerShown: false,
          }}
        >
          {(props) => (
            <ProfileScreen {...props} onLogout={onLogout} />
          )}
        </Stack.Screen>

        {/* Profile Management Screens */}
        <Stack.Screen
          name="ChangePassword"
          component={ChangePasswordScreen}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="EditEmail"
          component={EditEmailScreen}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="EditPhone"
          component={EditPhoneScreen}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="EditName"
          component={EditNameScreen}
          options={{
            headerShown: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
