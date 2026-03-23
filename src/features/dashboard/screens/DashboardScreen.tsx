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
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LineChart } from 'react-native-gifted-charts';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { HealthAPI, ProfileRow, BloodPressureRow } from '../../metrics/services/healthApi';
import { Sparkles } from 'lucide-react-native';
import { AIService } from '../../metrics/services/aiService';

export default function DashboardScreen() {
  const { user } = useAuthStore();

  // Dynamic State replacing Zustand
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [bpHistory, setBpHistory] = useState<BloodPressureRow[]>([]);
  const [medications, setMedications] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  // Local state for BP quick entry
  const [sysInput, setSysInput] = useState('');
  const [diaInput, setDiaInput] = useState('');
  const [savingBp, setSavingBp] = useState(false);

  // Fetch all dashboard data from Supabase
  const loadDashboardData = async () => {
    if (!user) return;

    try {
      // Run queries in parallel for maximum speed
      const [profileData, bpData, medsData] = await Promise.all([
        HealthAPI.getProfile(user.id),
        HealthAPI.getRecentBloodPressure(user.id),
        HealthAPI.getTodayMedications(user.id),
      ]);

      setProfile(profileData);
      setBpHistory(bpData);
      setMedications(medsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // useFocusEffect triggers every time the user navigates TO this tab
  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [user])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  // Transform database rows for Gifted Charts
  const chartData = useMemo(() => {
    if (bpHistory.length === 0) return { sysData: [], diaData: [] };

    const sysData = bpHistory.map((bp, index) => ({
      value: bp.systolic,
      label:
        index % 2 === 0
          ? new Date(bp.recorded_at).toLocaleDateString('en-US', { weekday: 'short' })
          : '',
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

    // Clear inputs and refresh data
    setSysInput('');
    setDiaInput('');
    await loadDashboardData();
    setSavingBp(false);
  };

  const handleToggleMedication = async (medId: string, currentTakenStatus: boolean) => {
    if (!user) return;

    // Optimistic UI update for instant feedback
    setMedications((prev) =>
      prev.map((med) => (med.id === medId ? { ...med, taken: !currentTakenStatus } : med))
    );

    // Persist to database
    await HealthAPI.toggleMedicationTaken(user.id, medId, currentTakenStatus);
  };

  const handleGenerateInsight = async () => {
    setAnalyzing(true);
    // Pass our current local state arrays into Gemini
    const insight = await AIService.generateHealthInsight(profile, bpHistory, medications);
    setAiInsight(insight);
    setAnalyzing(false);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator size="large" color="#0d9488" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-slate-50">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0d9488" />
        }>
        {/* Header Section */}
        <View className="rounded-b-3xl bg-teal-600 px-6 pb-6 pt-16 shadow-sm">
          <Text className="text-lg font-medium text-teal-100">Good Morning,</Text>
          <Text className="mt-1 text-3xl font-bold text-white">{profile?.name || 'Soft'}</Text>
          <Text className="mt-2 text-teal-100">Let&apos;s check in on your health today.</Text>
        </View>

        <View className="mt-6 space-y-6 px-5">
          {/* BP Chart Section */}
          <View className="rounded-2xl bg-white p-5 shadow-sm">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-slate-800">Blood Pressure Trends</Text>
            </View>

            {bpHistory.length > 0 ? (
              <View className="items-center overflow-hidden">
                <LineChart
                  data={chartData.sysData}
                  data2={chartData.diaData}
                  height={160}
                  width={280}
                  color1="#0d9488" // Teal 600
                  color2="#94a3b8" // Slate 400
                  dataPointsColor1="#0f766e"
                  dataPointsColor2="#64748b"
                  thickness1={3}
                  thickness2={3}
                  hideRules
                  yAxisTextStyle={{ color: '#64748b' }}
                  xAxisLabelTextStyle={{ color: '#64748b', fontSize: 12 }}
                  spacing={Math.max(45, 280 / Math.max(bpHistory.length, 1))} // Dynamic spacing based on data points
                  initialSpacing={10}
                />
                <View className="mt-3 flex-row justify-center space-x-6">
                  <View className="flex-row items-center space-x-2">
                    <View className="h-3 w-3 rounded-full bg-teal-600" />
                    <Text className="text-xs font-medium text-slate-500">Systolic</Text>
                  </View>
                  <View className="ml-4 flex-row items-center space-x-2">
                    <View className="h-3 w-3 rounded-full bg-slate-400" />
                    <Text className="text-xs font-medium text-slate-500">Diastolic</Text>
                  </View>
                </View>
              </View>
            ) : (
              <View className="items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 py-8">
                <Text className="font-medium text-slate-400">No readings yet. Log one below!</Text>
              </View>
            )}
          </View>

          {/* Quick Entry Section */}
          <View className="rounded-2xl bg-white p-5 shadow-sm">
            <Text className="mb-4 text-lg font-semibold text-slate-800">Log Today&apos;s Reading</Text>
            <View className="flex-row items-center justify-between">
              <View className="mr-3 flex-1">
                <Text className="mb-1 ml-1 text-xs text-slate-500">SYS (mmHg)</Text>
                <TextInput
                  className="rounded-xl bg-slate-100 p-4 text-center font-medium text-slate-800"
                  keyboardType="numeric"
                  placeholder="120"
                  value={sysInput}
                  onChangeText={setSysInput}
                  maxLength={3}
                  editable={!savingBp}
                />
              </View>
              <Text className="text-2xl font-light text-slate-300">/</Text>
              <View className="ml-3 mr-4 flex-1">
                <Text className="mb-1 ml-1 text-xs text-slate-500">DIA (mmHg)</Text>
                <TextInput
                  className="rounded-xl bg-slate-100 p-4 text-center font-medium text-slate-800"
                  keyboardType="numeric"
                  placeholder="80"
                  value={diaInput}
                  onChangeText={setDiaInput}
                  maxLength={3}
                  editable={!savingBp}
                />
              </View>
              <TouchableOpacity
                className={`mt-5 items-center justify-center rounded-xl p-4 ${savingBp || !sysInput || !diaInput ? 'bg-teal-300' : 'bg-teal-600'}`}
                onPress={handleLogBP}
                disabled={savingBp || !sysInput || !diaInput}
                activeOpacity={0.8}>
                {savingBp ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text className="font-bold text-white">Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Daily Medications Checklist */}
          <View className="rounded-2xl bg-white p-5 shadow-sm">
            <Text className="mb-4 text-lg font-semibold text-slate-800">Daily Schedule</Text>

            {medications.length > 0 ? (
              medications.map((med) => (
                <TouchableOpacity
                  key={med.id}
                  activeOpacity={0.7}
                  onPress={() => handleToggleMedication(med.id, med.taken)}
                  className={`mb-3 flex-row items-center justify-between rounded-xl border p-4 ${
                    med.taken ? 'border-teal-200 bg-teal-50' : 'border-slate-200 bg-slate-50'
                  }`}>
                  <View className="flex-col">
                    <Text
                      className={`text-base font-semibold ${med.taken ? 'text-teal-800 line-through' : 'text-slate-800'}`}>
                      {med.name}
                    </Text>
                    <Text
                      className={`mt-0.5 text-sm ${med.taken ? 'text-teal-600' : 'text-slate-500'}`}>
                      {med.dosage} • {med.time}
                    </Text>
                  </View>

                  {/* Custom Checkbox */}
                  <View
                    className={`h-6 w-6 items-center justify-center rounded-full border-2 ${
                      med.taken ? 'border-teal-500 bg-teal-500' : 'border-slate-300 bg-white'
                    }`}>
                    {med.taken && <Text className="text-xs font-bold text-white">✓</Text>}
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View className="items-center py-4">
                <Text className="text-center text-slate-400">
                  No medications scheduled for today.
                </Text>
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
                  Tap below to have Gemini analyze your recent blood pressure trends and medication adherence.
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
