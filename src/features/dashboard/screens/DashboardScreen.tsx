import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform 
} from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { useHealthStore } from './src/features/dashboard/store/useHealthStore'; // Adjust path as needed

export default function DashboardScreen() {
  const { 
    userProfile, 
    bloodPressureHistory, 
    medications, 
    logBloodPressure, 
    toggleMedicationTaken 
  } = useHealthStore();

  // Local state for BP quick entry
  const [sysInput, setSysInput] = useState('');
  const [diaInput, setDiaInput] = useState('');

  // Transform store data for Gifted Charts (needs {value: number, label?: string})
  const chartData = useMemo(() => {
    const sysData = bloodPressureHistory.map((bp, index) => ({
      value: bp.systolic,
      label: index % 2 === 0 ? new Date(bp.date).toLocaleDateString('en-US', { weekday: 'short' }) : '',
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

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-slate-50"
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header Section */}
        <View className="px-6 pt-16 pb-6 bg-teal-600 rounded-b-3xl shadow-sm">
          <Text className="text-teal-100 text-lg font-medium">Good Morning,</Text>
          <Text className="text-white text-3xl font-bold mt-1">{userProfile.name}</Text>
          <Text className="text-teal-100 mt-2">Let's check in on your health today.</Text>
        </View>

        <View className="px-5 mt-6 space-y-6">
          
          {/* BP Chart Section */}
          <View className="bg-white p-5 rounded-2xl shadow-sm">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-slate-800 text-lg font-semibold">Blood Pressure Trends</Text>
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

          {/* Quick Entry Section */}
          <View className="bg-white p-5 rounded-2xl shadow-sm">
            <Text className="text-slate-800 text-lg font-semibold mb-4">Log Today's Reading</Text>
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
                />
              </View>
              <TouchableOpacity 
                className="bg-teal-600 p-4 rounded-xl justify-center items-center mt-5"
                onPress={handleLogBP}
                activeOpacity={0.8}
              >
                <Text className="text-white font-bold">Save</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Daily Medications Checklist */}
          <View className="bg-white p-5 rounded-2xl shadow-sm">
            <Text className="text-slate-800 text-lg font-semibold mb-4">Daily Schedule</Text>
            {medications.map((med) => (
              <TouchableOpacity
                key={med.id}
                activeOpacity={0.7}
                onPress={() => toggleMedicationTaken(med.id)}
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
                
                {/* Custom Checkbox */}
                <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                  med.taken ? 'bg-teal-500 border-teal-500' : 'border-slate-300 bg-white'
                }`}>
                  {med.taken && (
                    <Text className="text-white text-xs font-bold">✓</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}