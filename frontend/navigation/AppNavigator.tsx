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
import ProductDetailScreen from '../screens/ProductDetailScreen';
import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import OrdersScreen from '../screens/OrdersScreen';
import OrderDetailScreen from '../screens/OrderDetailScreen';
import WriteReviewScreen from '../screens/WriteReviewScreen';
import MyRewardsScreen  from '../screens/MyRewardsScreen';
import ProductReviewsScreen from '../screens/ProductReviewsScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import NotificationScreen from '../screens/NotificationScreen';
import SpendingStatsScreen from '../screens/SpendingStatsScreen';
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

        <Stack.Screen
          name="ProductDetail"
          component={ProductDetailScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Cart"
          component={CartScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Checkout"
          component={CheckoutScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Favorites"
          component={FavoritesScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Orders"
          component={OrdersScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="OrderDetail"
          component={OrderDetailScreen}
          options={{ headerShown: false }}
        />

        <Stack.Screen name="WriteReview" component={WriteReviewScreen} options={{ headerShown: false }} />
        <Stack.Screen name="MyRewards"   component={MyRewardsScreen}   options={{ headerShown: false }} />
        <Stack.Screen name="ProductReviews" component={ProductReviewsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Notifications" component={NotificationScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SpendingStats" component={SpendingStatsScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
