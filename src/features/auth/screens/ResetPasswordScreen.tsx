import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../../../core/supabase';
import { useNavigation } from '@react-navigation/native';

export default function ResetPasswordScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'Check your email for the password reset link.');
      navigation.goBack();
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-slate-50 justify-center px-6">
      <View className="mb-8">
        <Text className="text-3xl font-bold text-slate-800 mb-2">Reset Password</Text>
        <Text className="text-slate-500">Enter your email and we'll send you a link to reset your password.</Text>
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

        <TouchableOpacity 
          className={`p-4 rounded-xl items-center mt-2 ${loading ? 'bg-teal-400' : 'bg-teal-600'}`}
          onPress={handleReset}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Send Reset Link</Text>}
        </TouchableOpacity>

        <TouchableOpacity className="items-center mt-4 p-2" onPress={() => navigation.goBack()}>
          <Text className="text-slate-500 font-medium text-base">Back to Login</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}