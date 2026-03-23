import React, { useState, useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LineChart } from 'react-native-gifted-charts';
import { Sparkles } from 'lucide-react-native';

import { useAuthStore } from '../../auth/store/useAuthStore';
import { HealthAPI, ProfileRow, BloodPressureRow } from '../../metrics/services/healthApi';
import { AIService } from '../../metrics/services/aiService';

export default function DashboardScreen() {
  const { user } = useAuthStore();
  
  // Dynamic State
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [bpHistory, setBpHistory] = useState<BloodPressureRow[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  const [symptoms, setSymptoms] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Local state for BP quick entry
  const [sysInput, setSysInput] = useState('');
  const [diaInput, setDiaInput] = useState('');
  const [savingBp, setSavingBp] = useState(false);

  // AI State
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Fetch all dashboard data from Supabase
  const loadDashboardData = async () => {
    if (!user) return;
    
    try {
      const [profileData, bpData, medsData, symptomsData] = await Promise.all([
        HealthAPI.getProfile(user.id),
        HealthAPI.getRecentBloodPressure(user.id),
        HealthAPI.getTodayMedications(user.id),
        HealthAPI.getRecentSymptoms(user.id)
      ]);

      setProfile(profileData);
      setBpHistory(bpData);
      setMedications(medsData);
      setSymptoms(symptomsData);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [user])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const handleGenerateInsight = async () => {
    setAnalyzing(true);
    const insight = await AIService.generateHealthInsight(profile, bpHistory, medications, symptoms);
    setAiInsight(insight);
    setAnalyzing(false);
  };

  // Transform database rows for Gifted Charts
  const chartData = useMemo(() => {
    if (bpHistory.length === 0) return { sysData: [], diaData: [] };

    const sysData = bpHistory.map((bp, index) => ({
      value: bp.systolic,
      label: index % 2 === 0 ? new Date(bp.recorded_at).toLocaleDateString('en-US', { weekday: 'short' }) : '',
    }));
    
    const diaData = bpHistory.map((bp) => ({
      value: bp.diastolic,
    }));

    return { sysData, diaData };
  }, [bpHistory]);

  const handleLogBP = async () => {
    const sys = parseInt(sysInput, 10);
    const dia = parseInt(diaInput, 10);
    
    if (!user || isNaN(sys) || isNaN(dia) || sys <= 0 || dia <= 0) return;

    setSavingBp(true);
    await HealthAPI.logBloodPressure(user.id, sys, dia);
    
    setSysInput('');
    setDiaInput('');
    await loadDashboardData();
    setSavingBp(false);
  };

  const handleToggleMedication = async (medId: string, currentTakenStatus: boolean) => {
    if (!user) return;
    setMedications(prev => prev.map(med => 
      med.id === medId ? { ...med, taken: !currentTakenStatus } : med
    ));
    await HealthAPI.toggleMedicationTaken(user.id, medId, currentTakenStatus);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-slate-50 justify-center items-center">
        <ActivityIndicator size="large" color="#0d9488" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-slate-50"
    >
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0d9488" />}
      >
        {/* Header Section */}
        <View className="px-6 pt-16 pb-6 bg-teal-600 rounded-b-3xl shadow-sm">
          <Text className="text-teal-100 text-lg font-medium">Good Morning,</Text>
          <Text className="text-white text-3xl font-bold mt-1">{profile?.name || 'Soft'}</Text>
          <Text className="text-teal-100 mt-2">Let&apos;s check in on your health today.</Text>
        </View>

        <View className="px-5 mt-6 space-y-6">
          
          {/* BP Chart Section */}
          <View className="bg-white p-5 rounded-2xl shadow-sm">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-slate-800 text-lg font-semibold">Blood Pressure Trends</Text>
            </View>
            
            {bpHistory.length > 0 ? (
              <View className="items-center overflow-hidden">
                <LineChart
                  data={chartData.sysData}
                  data2={chartData.diaData}
                  height={160}
                  width={280}
                  color1="#0d9488"
                  color2="#94a3b8"
                  dataPointsColor1="#0f766e"
                  dataPointsColor2="#64748b"
                  thickness1={3}
                  thickness2={3}
                  hideRules
                  yAxisTextStyle={{ color: '#64748b' }}
                  xAxisLabelTextStyle={{ color: '#64748b', fontSize: 12 }}
                  spacing={Math.max(45, 280 / Math.max(bpHistory.length, 1))}
                  initialSpacing={10}
                />
                <View className="flex-row justify-center mt-3 space-x-6">
                  <View className="flex-row items-center space-x-2">
                    <View className="w-3 h-3 rounded-full bg-teal-600" />
                    <Text className="text-xs text-slate-500 font-medium">Systolic</Text>
                  </View>
                  <View className="flex-row items-center space-x-2 ml-4">
                    <View className="w-3 h-3 rounded-full bg-slate-400" />
                    <Text className="text-xs text-slate-500 font-medium">Diastolic</Text>
                  </View>
                </View>
              </View>
            ) : (
              <View className="items-center justify-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Text className="text-slate-400 font-medium">No readings yet. Log one below!</Text>
              </View>
            )}
          </View>

          {/* Quick Entry Section */}
          <View className="bg-white p-5 rounded-2xl shadow-sm">
            <Text className="text-slate-800 text-lg font-semibold mb-4">Log Today&apos;s Reading</Text>
            <View className="flex-row items-center justify-between">
              <View className="flex-1 mr-3">
                <Text className="text-xs text-slate-500 mb-1 ml-1">SYS (mmHg)</Text>
                <TextInput
                  className="bg-slate-100 p-4 rounded-xl text-slate-800 font-medium text-center"
                  keyboardType="numeric"
                  placeholder="120"
                  value={sysInput}
                  onChangeText={setSysInput}
                  maxLength={3}
                  editable={!savingBp}
                />
              </View>
              <Text className="text-slate-300 text-2xl font-light">/</Text>
              <View className="flex-1 ml-3 mr-4">
                <Text className="text-xs text-slate-500 mb-1 ml-1">DIA (mmHg)</Text>
                <TextInput
                  className="bg-slate-100 p-4 rounded-xl text-slate-800 font-medium text-center"
                  keyboardType="numeric"
                  placeholder="80"
                  value={diaInput}
                  onChangeText={setDiaInput}
                  maxLength={3}
                  editable={!savingBp}
                />
              </View>
              <TouchableOpacity 
                className={`p-4 rounded-xl justify-center items-center mt-5 ${savingBp || !sysInput || !diaInput ? 'bg-teal-300' : 'bg-teal-600'}`}
                onPress={handleLogBP}
                disabled={savingBp || !sysInput || !diaInput}
                activeOpacity={0.8}
              >
                {savingBp ? <ActivityIndicator color="white" size="small" /> : <Text className="text-white font-bold">Save</Text>}
              </TouchableOpacity>
            </View>
          </View>

          {/* Daily Medications Checklist */}
          <View className="bg-white p-5 rounded-2xl shadow-sm">
            <Text className="text-slate-800 text-lg font-semibold mb-4">Daily Schedule</Text>
            
            {medications.length > 0 ? (
              medications.map((med) => (
                <TouchableOpacity
                  key={med.id}
                  activeOpacity={0.7}
                  onPress={() => handleToggleMedication(med.id, med.taken)}
                  className={`flex-row items-center justify-between p-4 mb-3 rounded-xl border ${
                    med.taken ? 'bg-teal-50 border-teal-200' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <View className="flex-col">
                    <Text className={`font-semibold text-base ${med.taken ? 'text-teal-800 line-through' : 'text-slate-800'}`}>
                      {med.name}
                    </Text>
                    <Text className={`text-sm mt-0.5 ${med.taken ? 'text-teal-600' : 'text-slate-500'}`}>
                      {med.dosage} • {med.time}
                    </Text>
                  </View>
                  
                  <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                    med.taken ? 'bg-teal-500 border-teal-500' : 'border-slate-300 bg-white'
                  }`}>
                    {med.taken && (
                      <Text className="text-white text-xs font-bold">✓</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View className="py-4 items-center">
                <Text className="text-slate-400 text-center">No medications scheduled for today.</Text>
              </View>
            )}
          </View>

          {/* AI Insights Module */}
          <View className="bg-teal-900 p-5 rounded-2xl shadow-sm mt-2">
            <View className="flex-row items-center mb-3 space-x-2">
              <Sparkles size={24} color="#5eead4" />
              <Text className="text-teal-50 text-lg font-bold ml-2">PulseSync AI</Text>
            </View>

            {aiInsight ? (
              <View>
                <Text className="text-teal-100 text-base leading-relaxed">{aiInsight}</Text>
                <TouchableOpacity 
                  className="mt-4 py-2 border border-teal-600 rounded-lg items-center"
                  onPress={handleGenerateInsight}
                  disabled={analyzing}
                >
                  {analyzing ? (
                    <ActivityIndicator color="#5eead4" size="small" />
                  ) : (
                    <Text className="text-teal-300 font-medium">Refresh Analysis</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text className="text-teal-200/80 mb-4">
                  Tap below to have Gemini analyze your recent blood pressure trends, symptoms, and medication adherence.
                </Text>
                <TouchableOpacity 
                  className="bg-teal-500 p-3 rounded-xl items-center flex-row justify-center"
                  onPress={handleGenerateInsight}
                  disabled={analyzing}
                  activeOpacity={0.8}
                >
                  {analyzing ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <>
                      <Sparkles size={18} color="white" />
                      <Text className="text-white font-bold ml-2">Analyze My Health</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}