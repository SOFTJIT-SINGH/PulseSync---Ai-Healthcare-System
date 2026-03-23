import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { HealthAPI, ProfileRow } from '../../metrics/services/healthApi';
import { User, Droplet, Activity, LogOut } from 'lucide-react-native';

export default function ProfileScreen() {
  const { user, signOut } = useAuthStore();
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      if (user) {
        const data = await HealthAPI.getProfile(user.id);
        setProfile(data);
      }
      setLoading(false);
    }
    loadProfile();
  }, [user]);

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

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header */}
      <View className="px-6 pt-16 pb-8 bg-teal-600 rounded-b-3xl shadow-sm items-center">
        <View className="w-24 h-24 bg-white rounded-full items-center justify-center mb-4 shadow-sm">
          <User size={40} color="#0d9488" />
        </View>
        <Text className="text-white text-3xl font-bold">{profile?.name || 'User'}</Text>
        <Text className="text-teal-100 text-base mt-1">{user?.email}</Text>
      </View>

      {/* Health Stats */}
      <View className="px-5 mt-8 space-y-4">
        <Text className="text-slate-800 text-lg font-semibold mb-2">Medical Profile</Text>
        
        <View className="flex-row justify-between space-x-4">
          <View className="flex-1 bg-white p-5 rounded-2xl shadow-sm items-center">
            <Activity size={28} color="#0ea5e9" className="mb-2" />
            <Text className="text-slate-500 text-sm mb-1">Age</Text>
            <Text className="text-slate-800 text-2xl font-bold">{profile?.age || '--'}</Text>
          </View>
          
          <View className="flex-1 bg-white p-5 rounded-2xl shadow-sm items-center">
            <Droplet size={28} color="#ef4444" className="mb-2" />
            <Text className="text-slate-500 text-sm mb-1">Blood Type</Text>
            <Text className="text-slate-800 text-2xl font-bold">{profile?.blood_type || '--'}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="mt-8">
          <TouchableOpacity 
            className="bg-white p-4 rounded-xl flex-row justify-between items-center border border-rose-100 shadow-sm"
            onPress={handleSignOut}
            activeOpacity={0.7}
          >
            <View className="flex-row items-center">
              <LogOut size={20} color="#e11d48" />
              <Text className="text-rose-600 font-semibold text-base ml-3">Sign Out</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}