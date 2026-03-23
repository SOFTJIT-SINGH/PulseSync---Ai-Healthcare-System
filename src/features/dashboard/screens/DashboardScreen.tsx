import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useHealthStore } from '../store/useHealthStore';

export default function DashboardScreen() {
  const {
    userProfile,
    bloodPressureHistory,
    medications,
    logBloodPressure,
    toggleMedicationTaken,
  } = useHealthStore();

  // Local state for BP quick entry
  const [sysInput, setSysInput] = useState('');
  const [diaInput, setDiaInput] = useState('');

  // Transform store data for Gifted Charts (needs {value: number, label?: string})
  const chartData = useMemo(() => {
    const sysData = bloodPressureHistory.map((bp, index) => ({
      value: bp.systolic,
      label:
        index % 2 === 0 ? new Date(bp.date).toLocaleDateString('en-US', { weekday: 'short' }) : '',
    }));

    const diaData = bloodPressureHistory.map((bp) => ({
      value: bp.diastolic,
    }));

    return { sysData, diaData };
  }, [bloodPressureHistory]);

  const handleLogBP = () => {
    const sys = parseInt(sysInput, 10);
    const dia = parseInt(diaInput, 10);

    if (!isNaN(sys) && !isNaN(dia) && sys > 0 && dia > 0) {
      logBloodPressure(sys, dia);
      setSysInput('');
      setDiaInput('');
    }
  };

  const firstName = userProfile?.name ? userProfile.name.split(' ')[0] : 'User';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-slate-50">
      <SafeAreaView>
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Header Section */}
          <View className="rounded-b-3xl bg-teal-600 px-6 pb-6 pt-16 shadow-sm">
            <Text className="text-lg font-medium text-teal-100">Welcome,</Text>
            <Text className="mt-1 text-3xl font-bold text-white">{firstName}</Text>
            <Text className="mt-2 text-teal-100">Let&apos;s check in on your health today.</Text>
          </View>

          <View className="mt-6 space-y-6 px-5">
            {/* BP Chart Section */}
            <View className="rounded-2xl bg-white p-5 shadow-sm">
              <View className="mb-4 flex-row items-center justify-between">
                <Text className="text-lg font-semibold text-slate-800">Blood Pressure Trends</Text>
              </View>
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
                  spacing={45}
                  initialSpacing={10}
                />
              </View>
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

            {/* Quick Entry Section */}
            <View className="rounded-2xl bg-white p-5 shadow-sm">
              <Text className="mb-4 text-lg font-semibold text-slate-800">
                Log Today&aposs Reading
              </Text>
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
                  />
                </View>
                <TouchableOpacity
                  className="mt-5 items-center justify-center rounded-xl bg-teal-600 p-4"
                  onPress={handleLogBP}
                  activeOpacity={0.8}>
                  <Text className="font-bold text-white">Save</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Daily Medications Checklist */}
            <View className="rounded-2xl bg-white p-5 shadow-sm">
              <Text className="mb-4 text-lg font-semibold text-slate-800">Daily Schedule</Text>
              {medications.map((med) => (
                <TouchableOpacity
                  key={med.id}
                  activeOpacity={0.7}
                  onPress={() => toggleMedicationTaken(med.id)}
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
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
