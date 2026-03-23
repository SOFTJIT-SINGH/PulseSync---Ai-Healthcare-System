import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '../../../core/supabase';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../navigation/types';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

export default function RegisterScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [bloodType, setBloodType] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // 1. Basic Validation
    if (!email || !password || !confirmPassword || !name || !age || !bloodType) {
      Alert.alert('Error', 'Please fill out all fields.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    setLoading(true);
    
    // 2. Create the Auth User in Supabase
    const { data: authData, error: authError } = await supabase.auth.signUp({ 
      email, 
      password 
    });

    if (authError) {
      Alert.alert('Registration Failed', authError.message);
      setLoading(false);
      return;
    }

    // 3. Create the Database Profile
    if (authData.user) {
      const { error: profileError } = await supabase.from('profiles').insert([
        { 
          id: authData.user.id, 
          name, 
          age: parseInt(age, 10), 
          blood_type: bloodType 
        }
      ]);

      if (profileError) {
        console.error('Profile Insert Error:', profileError);
        Alert.alert('Profile Error', 'Account created, but failed to save medical details. Update them in your Profile later.');
      }
    }
    
    setLoading(false);
    // Since we turned off email confirmations in Supabase, 
    // Zustand will instantly catch the new session and route you to the Dashboard!
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-slate-50">
      <ScrollView contentContainerStyle={{ padding: 24, justifyContent: 'center', flexGrow: 1 }}>
        <Text className="text-3xl font-bold text-slate-800 mb-6">Create Account</Text>

        <View className="space-y-4">
          <View>
            <Text className="text-sm font-medium text-slate-700 mb-1 ml-1">Full Name</Text>
            <TextInput className="bg-white p-4 rounded-xl border border-slate-200" placeholder="Sarah Jenkins" value={name} onChangeText={setName} />
          </View>

          <View className="flex-row space-x-4">
            <View className="flex-1">
              <Text className="text-sm font-medium text-slate-700 mb-1 ml-1">Age</Text>
              <TextInput className="bg-white p-4 rounded-xl border border-slate-200" placeholder="42" value={age} onChangeText={setAge} keyboardType="numeric" maxLength={3} />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-medium text-slate-700 mb-1 ml-1">Blood Type</Text>
              <TextInput className="bg-white p-4 rounded-xl border border-slate-200" placeholder="A+" value={bloodType} onChangeText={setBloodType} autoCapitalize="characters" maxLength={3} />
            </View>
          </View>

          <View>
            <Text className="text-sm font-medium text-slate-700 mb-1 ml-1">Email</Text>
            <TextInput className="bg-white p-4 rounded-xl border border-slate-200" placeholder="sarah@example.com" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
          </View>

          <View>
            <Text className="text-sm font-medium text-slate-700 mb-1 ml-1">Password</Text>
            <TextInput className="bg-white p-4 rounded-xl border border-slate-200" placeholder="••••••••" value={password} onChangeText={setPassword} secureTextEntry />
          </View>

          <View>
            <Text className="text-sm font-medium text-slate-700 mb-1 ml-1">Confirm Password</Text>
            <TextInput className="bg-white p-4 rounded-xl border border-slate-200" placeholder="••••••••" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
          </View>

          <TouchableOpacity className={`p-4 rounded-xl items-center mt-4 ${loading ? 'bg-teal-400' : 'bg-teal-600'}`} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Create Account</Text>}
          </TouchableOpacity>
          
          <TouchableOpacity className="items-center mt-2 p-2" onPress={() => navigation.goBack()}>
            <Text className="text-slate-500 font-medium text-base">Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}