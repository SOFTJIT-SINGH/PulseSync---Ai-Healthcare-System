import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { HealthAPI } from '../../metrics/services/healthApi';
import { Pill, Stethoscope, Plus, AlertCircle } from 'lucide-react-native';

export default function MetricsScreen() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'meds' | 'symptoms'>('meds');
  
  // Data State
  const [medications, setMedications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State - Medications
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('');
  const [medTime, setMedTime] = useState(''); // e.g., '08:00 AM'

  // Form State - Symptoms
  const [symptomDesc, setSymptomDesc] = useState('');
  const [severity, setSeverity] = useState<'Low' | 'Medium' | 'High'>('Low');

  const loadData = async () => {
    if (!user) return;
    const meds = await HealthAPI.getAllMedications(user.id);
    setMedications(meds);
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [user])
  );

  const handleAddMedication = async () => {
    if (!user || !medName || !medDosage || !medTime) {
      Alert.alert('Error', 'Please fill out all medication fields.');
      return;
    }
    setSaving(true);
    await HealthAPI.addMedication(user.id, medName, medDosage, medTime);
    setMedName(''); setMedDosage(''); setMedTime('');
    await loadData(); // Refresh list
    setSaving(false);
  };

  const handleLogSymptom = async () => {
    if (!user || !symptomDesc) {
      Alert.alert('Error', 'Please describe your symptom.');
      return;
    }
    setSaving(true);
    await HealthAPI.logSymptom(user.id, symptomDesc, severity);
    setSymptomDesc('');
    setSeverity('Low');
    Alert.alert('Success', 'Symptom logged for AI analysis.');
    setSaving(false);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color="#0d9488" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-slate-50">
      
      {/* Header */}
      <View className="px-6 pt-16 pb-6 bg-teal-600 rounded-b-3xl shadow-sm">
        <Text className="text-white text-3xl font-bold">Health Metrics</Text>
        <Text className="text-teal-100 mt-1">Manage your active care plan.</Text>
      </View>

      {/* Tabs */}
      <View className="flex-row mx-5 mt-6 bg-slate-200 p-1 rounded-xl">
        <TouchableOpacity 
          className={`flex-1 py-3 items-center rounded-lg flex-row justify-center space-x-2 ${activeTab === 'meds' ? 'bg-white shadow-sm' : ''}`}
          onPress={() => setActiveTab('meds')}
        >
          <Pill size={18} color={activeTab === 'meds' ? '#0d9488' : '#64748b'} />
          <Text className={`font-semibold ${activeTab === 'meds' ? 'text-teal-700' : 'text-slate-500'}`}>Prescriptions</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className={`flex-1 py-3 items-center rounded-lg flex-row justify-center space-x-2 ${activeTab === 'symptoms' ? 'bg-white shadow-sm' : ''}`}
          onPress={() => setActiveTab('symptoms')}
        >
          <Stethoscope size={18} color={activeTab === 'symptoms' ? '#0d9488' : '#64748b'} />
          <Text className={`font-semibold ${activeTab === 'symptoms' ? 'text-teal-700' : 'text-slate-500'}`}>Symptoms</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        
        {/* MEDICATION TAB */}
        {activeTab === 'meds' && (
          <View className="space-y-6">
            <View className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
              <Text className="text-slate-800 text-lg font-semibold mb-4">Add New Medication</Text>
              
              <View className="space-y-3">
                <TextInput className="bg-slate-50 p-4 rounded-xl border border-slate-200" placeholder="Medication Name (e.g. Lisinopril)" value={medName} onChangeText={setMedName} />
                <View className="flex-row space-x-3">
                  <TextInput className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-200" placeholder="Dosage (e.g. 10mg)" value={medDosage} onChangeText={setMedDosage} />
                  <TextInput className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-200" placeholder="Time (e.g. 08:00 AM)" value={medTime} onChangeText={setMedTime} />
                </View>
                <TouchableOpacity 
                  className={`p-4 rounded-xl items-center flex-row justify-center mt-2 ${saving ? 'bg-teal-400' : 'bg-teal-600'}`}
                  onPress={handleAddMedication} disabled={saving}
                >
                  {saving ? <ActivityIndicator color="white" /> : (
                    <>
                      <Plus size={20} color="white" />
                      <Text className="text-white font-bold ml-2">Add to Schedule</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View>
              <Text className="text-slate-800 text-lg font-semibold mb-3 ml-1">Current Prescriptions</Text>
              {medications.length > 0 ? medications.map((med) => (
                <View key={med.id} className="bg-white p-4 rounded-xl mb-3 border-l-4 border-teal-500 shadow-sm flex-row justify-between items-center">
                  <View>
                    <Text className="text-slate-800 font-bold text-base">{med.name}</Text>
                    <Text className="text-slate-500 text-sm">{med.dosage} • Scheduled for {med.scheduled_time}</Text>
                  </View>
                  <View className="bg-teal-50 px-3 py-1 rounded-full">
                    <Text className="text-teal-700 text-xs font-semibold">Active</Text>
                  </View>
                </View>
              )) : (
                <Text className="text-slate-400 text-center mt-4">No medications added yet.</Text>
              )}
            </View>
          </View>
        )}

        {/* SYMPTOMS TAB */}
        {activeTab === 'symptoms' && (
          <View className="space-y-6">
            <View className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
              <Text className="text-slate-800 text-lg font-semibold mb-2">Log a Symptom</Text>
              <Text className="text-slate-500 text-sm mb-4">Record how you're feeling so PulseSync AI can look for correlations with your blood pressure.</Text>
              
              <TextInput 
                className="bg-slate-50 p-4 rounded-xl border border-slate-200 h-28 mb-4 text-slate-800" 
                placeholder="E.g., Woke up with a mild headache and felt slightly dizzy when standing up." 
                value={symptomDesc} 
                onChangeText={setSymptomDesc}
                multiline
                textAlignVertical="top"
              />

              <Text className="text-slate-700 font-medium mb-2 ml-1">Severity</Text>
              <View className="flex-row space-x-3 mb-6">
                {['Low', 'Medium', 'High'].map((level) => (
                  <TouchableOpacity 
                    key={level}
                    onPress={() => setSeverity(level as 'Low' | 'Medium' | 'High')}
                    className={`flex-1 py-3 rounded-lg border items-center ${
                      severity === level 
                        ? level === 'High' ? 'bg-rose-100 border-rose-500' : level === 'Medium' ? 'bg-amber-100 border-amber-500' : 'bg-teal-100 border-teal-500'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <Text className={`font-semibold ${
                      severity === level 
                        ? level === 'High' ? 'text-rose-700' : level === 'Medium' ? 'text-amber-700' : 'text-teal-700'
                        : 'text-slate-500'
                    }`}>{level}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity 
                className={`p-4 rounded-xl items-center flex-row justify-center ${saving ? 'bg-teal-400' : 'bg-teal-600'}`}
                onPress={handleLogSymptom} disabled={saving}
              >
                {saving ? <ActivityIndicator color="white" /> : (
                  <>
                    <AlertCircle size={20} color="white" />
                    <Text className="text-white font-bold ml-2">Save Record</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

      </ScrollView>
    </KeyboardAvoidingView>
  );
}