import { StatusBar } from 'expo-status-bar';
import React from 'react';
import RootNavigator from './src/navigation/RootNavigator';
import './global.css';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <RootNavigator />
    </SafeAreaProvider>
  );
}