import React from 'react';
import { View, Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Heart, Activity, User } from 'lucide-react-native';
import DashboardScreen from '../features/dashboard/screens/DashboardScreen';
import { BottomTabParamList } from './types';
import ProfileScreen from '../features/dashboard/screens/ProfileScreen';
import MetricsScreen from '../features/dashboard/screens/MetricsScreen';

// Temporary placeholders for our other tabs
const Tab = createBottomTabNavigator<BottomTabParamList>();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0d9488', // Teal 600
        tabBarInactiveTintColor: '#94a3b8', // Slate 400
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopColor: '#f1f5f9',
          elevation: 0, // Removes shadow on Android
          shadowOpacity: 0, // Removes shadow on iOS
          height: 65,
          paddingBottom: 10,
          paddingTop: 10,
        },
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <Heart color={color} size={size} />,
        }}
      />
      <Tab.Screen 
        name="Metrics" 
        component={MetricsScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <Activity color={color} size={size} />,
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}