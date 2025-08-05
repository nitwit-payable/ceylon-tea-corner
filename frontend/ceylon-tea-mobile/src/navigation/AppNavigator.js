import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  LoginScreen,
  TeaListScreen,
  RecordSaleScreen,
  ReportsScreen,
  ProfileScreen,
} from '../screens';
import LoadingScreen from '../components/LoadingScreen';
import { Text, View } from 'react-native';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Custom tab bar icon component with cart badge
const TabIcon = ({ emoji, focused, showBadge, badgeCount }) => (
  <View style={{ position: 'relative' }}>
    <Text style={{ fontSize: focused ? 24 : 20, opacity: focused ? 1 : 0.6 }}>
      {emoji}
    </Text>
    {showBadge && badgeCount > 0 && (
      <View style={{
        position: 'absolute',
        top: -5,
        right: -8,
        backgroundColor: '#EF4444',
        borderRadius: 10,
        minWidth: 18,
        height: 18,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
      }}>
        <Text style={{
          color: '#FFFFFF',
          fontSize: 10,
          fontWeight: 'bold',
        }}>
          {badgeCount > 99 ? '99+' : badgeCount}
        </Text>
      </View>
    )}
  </View>
);

// Main app tabs for authenticated users
const MainTabs = () => {
  const insets = useSafeAreaInsets();
  const { getCartItemsCount } = useCart();
  const cartItemsCount = getCartItemsCount();
  
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingBottom: insets.bottom + 8,
          paddingTop: 8,
          height: 80 + insets.bottom,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
        tabBarActiveTintColor: '#059669',
        tabBarInactiveTintColor: '#6B7280',
      }}
    >
      <Tab.Screen
        name="TeaList"
        component={TeaListScreen}
        options={{
          title: 'Tea List',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🍃" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="RecordSale"
        component={RecordSaleScreen}
        options={{
          title: 'Cart',
          tabBarIcon: ({ focused }) => (
            <TabIcon 
              emoji="🛒" 
              focused={focused} 
              showBadge={true}
              badgeCount={cartItemsCount}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Reports"
        component={ReportsScreen}
        options={{
          title: 'Reports',
          tabBarIcon: ({ focused }) => <TabIcon emoji="📊" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
};

// Main app navigator
const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        // Authenticated screens
        <Stack.Screen name="MainTabs" component={MainTabs} />
      ) : (
        // Non-authenticated screens
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator; 