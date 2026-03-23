import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '../../../core/supabase';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../navigation/types';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      Alert.alert('Login Failed', error.message);
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-slate-50 justify-center px-6">
      <View className="mb-10">
        <Text className="text-4xl font-bold text-teal-600 mb-2">PulseSync</Text>
        <Text className="text-lg text-slate-500">Your preventive care companion.</Text>
      </View>

      <View className="space-y-4">
        <View>
          <Text className="text-sm font-medium text-slate-700 mb-1 ml-1">Email</Text>
          <TextInput
            className="bg-white p-4 rounded-xl border border-slate-200 text-slate-900"
            placeholder="sarah@example.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View>
          <Text className="text-sm font-medium text-slate-700 mb-1 ml-1">Password</Text>
          <TextInput
            className="bg-white p-4 rounded-xl border border-slate-200 text-slate-900"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity 
          className={`p-4 rounded-xl items-center mt-2 ${loading ? 'bg-teal-400' : 'bg-teal-600'}`}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Sign In</Text>}
        </TouchableOpacity>

        <TouchableOpacity 
          className="items-center mt-4"
          onPress={() => navigation.navigate('Register')}
        >
          <Text className="text-teal-600 font-medium text-base">Don't have an account? Register</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}