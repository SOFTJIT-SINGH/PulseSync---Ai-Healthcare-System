import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { supabase } from '../../../core/supabase';
import { AuthStackParamList } from '../../../navigation/types';

type OtpRouteProp = RouteProp<AuthStackParamList, 'OtpVerification'>;

export default function OtpScreen() {
  const route = useRoute<OtpRouteProp>();
  const email = route.params.email;
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const handleChange = (text: string, index: number) => {
    // Only allow numbers
    if (text.length > 1) text = text.replace(/[^0-9]/g, '').slice(-1);

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto-advance to next input
    if (text !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    // Auto-go back on backspace if current is empty
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) {
      Alert.alert('Invalid Code', 'Please enter the complete 6-digit code.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'signup',
    });

    if (error) {
      Alert.alert('Verification Failed', error.message);
      setLoading(false);
    }
    // If successful, Supabase sets the session -> useAuthStore updates -> RootNavigator automatically routes to 'Main' Dashboard
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-slate-50 justify-center px-6">
      <View className="items-center mb-8">
        <Text className="text-3xl font-bold text-slate-800 mb-2">Verification Code</Text>
        <Text className="text-slate-500 text-center">We sent a 6-digit code to</Text>
        <Text className="text-teal-600 font-semibold">{email}</Text>
      </View>

      <View className="flex-row justify-center space-x-3 mb-8">
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => (inputRefs.current[index] = ref)}
            className="w-12 h-14 bg-white border border-slate-200 rounded-xl text-center text-2xl font-bold text-slate-800 shadow-sm"
            keyboardType="number-pad"
            maxLength={1}
            value={digit}
            onChangeText={(text) => handleChange(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
          />
        ))}
      </View>

      <TouchableOpacity 
        className={`p-4 rounded-xl items-center ${loading ? 'bg-teal-400' : 'bg-teal-600'}`}
        onPress={handleVerify}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Confirm</Text>}
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}