import { create } from 'zustand';

// --- Types & Interfaces ---
export interface BloodPressure {
  id: string;
  systolic: number;
  diastolic: number;
  date: string; // ISO 8601 format
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  time: string;
  taken: boolean;
}

export interface Symptom {
  id: string;
  description: string;
  severity: 'Low' | 'Medium' | 'High';
  date: string;
}

interface UserProfile {
  name: string;
  age: number;
  bloodType: string;
}

interface HealthState {
  userProfile: UserProfile;
  bloodPressureHistory: BloodPressure[];
  medications: Medication[];
  symptoms: Symptom[];
  
  // Actions
  logBloodPressure: (systolic: number, diastolic: number) => void;
  toggleMedicationTaken: (id: string) => void;
  addSymptom: (description: string, severity: 'Low' | 'Medium' | 'High') => void;
}

// --- Store Implementation ---
export const useHealthStore = create<HealthState>((set) => ({
  userProfile: {
    name: 'Sarah',
    age: 42,
    bloodType: 'A+',
  },
  
  // Realistic mock data for the past week
  bloodPressureHistory: [
    { id: '1', systolic: 118, diastolic: 78, date: new Date(Date.now() - 6 * 86400000).toISOString() },
    { id: '2', systolic: 122, diastolic: 80, date: new Date(Date.now() - 5 * 86400000).toISOString() },
    { id: '3', systolic: 125, diastolic: 82, date: new Date(Date.now() - 4 * 86400000).toISOString() },
    { id: '4', systolic: 119, diastolic: 79, date: new Date(Date.now() - 3 * 86400000).toISOString() },
    { id: '5', systolic: 121, diastolic: 77, date: new Date(Date.now() - 2 * 86400000).toISOString() },
    { id: '6', systolic: 126, diastolic: 84, date: new Date(Date.now() - 1 * 86400000).toISOString() },
  ],
  
  medications: [
    { id: 'm1', name: 'Lisinopril', dosage: '10mg', time: '08:00 AM', taken: true },
    { id: 'm2', name: 'Atorvastatin', dosage: '20mg', time: '08:00 AM', taken: false },
    { id: 'm3', name: 'Metformin', dosage: '500mg', time: '08:00 PM', taken: false },
  ],
  
  symptoms: [],

  logBloodPressure: (systolic, diastolic) => 
    set((state) => ({
      bloodPressureHistory: [
        ...state.bloodPressureHistory, 
        { 
          id: Date.now().toString(), 
          systolic, 
          diastolic, 
          date: new Date().toISOString() 
        }
      ]
    })),

  toggleMedicationTaken: (id) => 
    set((state) => ({
      medications: state.medications.map((med) => 
        med.id === id ? { ...med, taken: !med.taken } : med
      )
    })),

  addSymptom: (description, severity) => 
    set((state) => ({
      symptoms: [
        ...state.symptoms, 
        { 
          id: Date.now().toString(), 
          description, 
          severity, 
          date: new Date().toISOString() 
        }
      ]
    })),
}));