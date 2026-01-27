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
import { RootStackParamList } from '../types/navigation';

const Stack = createStackNavigator<RootStackParamList>();

interface AppNavigatorProps {
  navigationRef: React.RefObject<NavigationContainerRef<RootStackParamList>>;
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
    <NavigationContainer ref={navigationRef}>
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
            <LoginScreen {...props} onLoginSuccess={onLoginSuccess} />
          )}
        </Stack.Screen>
        <Stack.Screen
          name="Register"
          options={{
            animationEnabled: !isLoggedIn,
          }}
        >
          {(props) => (
            <RegisterScreen {...props} onRegisterSuccess={onLoginSuccess} />
          )}
        </Stack.Screen>
        <Stack.Screen
          name="VerifyRegisterOTP"
          component={VerifyRegisterOTPScreen}
          options={{
            animationEnabled: !isLoggedIn,
          }}
        />
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
            <HomepageScreen {...props} onLogout={onLogout} />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
