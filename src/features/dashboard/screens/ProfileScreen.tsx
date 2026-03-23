import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { HealthAPI, ProfileRow } from '../../metrics/services/healthApi';
import { User, Droplet, Activity, LogOut, Edit2, Check, Scale, Ruler } from 'lucide-react-native';

export default function ProfileScreen() {
  const { user, signOut } = useAuthStore();
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Editable Form State
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    blood_type: '',
    weight_kg: '',
    height_cm: '',
  });

  useEffect(() => {
    async function loadProfile() {
      if (user) {
        const data = await HealthAPI.getProfile(user.id);
        if (data) {
          setProfile(data);
          setFormData({
            name: data.name || '',
            age: data.age ? data.age.toString() : '',
            blood_type: data.blood_type || '',
            weight_kg: data.weight_kg ? data.weight_kg.toString() : '',
            height_cm: data.height_cm ? data.height_cm.toString() : '',
          });
        }
      }
      setLoading(false);
    }
    loadProfile();
  }, [user]);

  const calculateBMI = () => {
    if (!profile?.weight_kg || !profile?.height_cm) return null;
    const heightInMeters = profile.height_cm / 100;
    const bmi = profile.weight_kg / (heightInMeters * heightInMeters);
    return bmi.toFixed(1);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    
    const updates = {
      name: formData.name,
      age: parseInt(formData.age, 10) || 0,
      blood_type: formData.blood_type,
      weight_kg: parseFloat(formData.weight_kg) || undefined,
      height_cm: parseFloat(formData.height_cm) || undefined,
    };

    const updatedData = await HealthAPI.updateProfile(user.id, updates);
    
    if (updatedData) {
      setProfile(updatedData);
      setIsEditing(false);
    } else {
      Alert.alert('Error', 'Failed to update profile.');
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error: any) {
      Alert.alert('Error signing out', error.message);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color="#0d9488" />
      </View>
    );
  }

  const bmi = calculateBMI();

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-slate-50">
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* Header */}
        <View className="px-6 pt-16 pb-8 bg-teal-600 rounded-b-3xl shadow-sm items-center relative">
          <TouchableOpacity 
            className="absolute top-16 right-6 bg-teal-500 p-2 rounded-full"
            onPress={() => isEditing ? handleSave() : setIsEditing(true)}
            disabled={saving}
          >
            {saving ? <ActivityIndicator color="white" size="small" /> : 
             isEditing ? <Check size={20} color="white" /> : <Edit2 size={20} color="white" />}
          </TouchableOpacity>

          <View className="w-24 h-24 bg-white rounded-full items-center justify-center mb-4 shadow-sm">
            <User size={40} color="#0d9488" />
          </View>

          {isEditing ? (
            <TextInput 
              className="text-white text-3xl font-bold border-b border-teal-300 pb-1 text-center w-3/4"
              value={formData.name}
              onChangeText={(text) => setFormData({...formData, name: text})}
              placeholder="Your Name"
              placeholderTextColor="#99f6e4"
            />
          ) : (
            <Text className="text-white text-3xl font-bold">{profile?.name || 'User'}</Text>
          )}
          <Text className="text-teal-100 text-base mt-1">{user?.email}</Text>
        </View>

        {/* Dynamic Health Stats */}
        <View className="px-5 mt-8 space-y-4">
          <Text className="text-slate-800 text-lg font-semibold mb-2">Medical Profile</Text>
          
          <View className="flex-row justify-between space-x-4">
            <View className="flex-1 bg-white p-5 rounded-2xl shadow-sm items-center">
              <Activity size={28} color="#0ea5e9" className="mb-2" />
              <Text className="text-slate-500 text-sm mb-1">Age</Text>
              {isEditing ? (
                <TextInput className="text-slate-800 text-2xl font-bold border-b border-slate-200 text-center w-full" value={formData.age} onChangeText={(text) => setFormData({...formData, age: text})} keyboardType="numeric" placeholder="26" />
              ) : (
                <Text className="text-slate-800 text-2xl font-bold">{profile?.age || '--'}</Text>
              )}
            </View>
            
            <View className="flex-1 bg-white p-5 rounded-2xl shadow-sm items-center">
              <Droplet size={28} color="#ef4444" className="mb-2" />
              <Text className="text-slate-500 text-sm mb-1">Blood Type</Text>
              {isEditing ? (
                <TextInput className="text-slate-800 text-2xl font-bold border-b border-slate-200 text-center w-full" value={formData.blood_type} onChangeText={(text) => setFormData({...formData, blood_type: text})} placeholder="O+" autoCapitalize="characters" />
              ) : (
                <Text className="text-slate-800 text-2xl font-bold">{profile?.blood_type || '--'}</Text>
              )}
            </View>
          </View>

          <View className="flex-row justify-between space-x-4 mt-2">
            <View className="flex-1 bg-white p-5 rounded-2xl shadow-sm items-center">
              <Scale size={28} color="#f59e0b" className="mb-2" />
              <Text className="text-slate-500 text-sm mb-1">Weight (kg)</Text>
              {isEditing ? (
                <TextInput className="text-slate-800 text-2xl font-bold border-b border-slate-200 text-center w-full" value={formData.weight_kg} onChangeText={(text) => setFormData({...formData, weight_kg: text})} keyboardType="numeric" placeholder="78" />
              ) : (
                <Text className="text-slate-800 text-2xl font-bold">{profile?.weight_kg || '--'}</Text>
              )}
            </View>
            
            <View className="flex-1 bg-white p-5 rounded-2xl shadow-sm items-center">
              <Ruler size={28} color="#8b5cf6" className="mb-2" />
              <Text className="text-slate-500 text-sm mb-1">Height (cm)</Text>
              {isEditing ? (
                <TextInput className="text-slate-800 text-2xl font-bold border-b border-slate-200 text-center w-full" value={formData.height_cm} onChangeText={(text) => setFormData({...formData, height_cm: text})} keyboardType="numeric" placeholder="170" />
              ) : (
                <Text className="text-slate-800 text-2xl font-bold">{profile?.height_cm || '--'}</Text>
              )}
            </View>
          </View>

          {/* BMI Indicator (Only shows when not editing and data exists) */}
          {!isEditing && bmi && (
            <View className="bg-white p-5 rounded-2xl shadow-sm mt-2 flex-row justify-between items-center border-l-4 border-teal-500">
              <View>
                <Text className="text-slate-500 text-sm mb-1">Body Mass Index</Text>
                <Text className="text-slate-800 text-2xl font-bold">{bmi}</Text>
              </View>
              <View className="bg-teal-50 px-3 py-1 rounded-full">
                <Text className="text-teal-700 font-medium text-sm">Active Baseline</Text>
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View className="mt-8">
            <TouchableOpacity 
              className="bg-white p-4 rounded-xl flex-row justify-center items-center border border-rose-100 shadow-sm"
              onPress={handleSignOut}
              activeOpacity={0.7}
            >
              <LogOut size={20} color="#e11d48" />
              <Text className="text-rose-600 font-semibold text-base ml-3">Secure Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}