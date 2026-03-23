import { supabase } from '../../../core/supabase';

// --- Database Types ---
export interface ProfileRow {
  id: string;
  name: string;
  age: number;
  blood_type: string;
}

export interface BloodPressureRow {
  id: string;
  user_id: string;
  systolic: number;
  diastolic: number;
  recorded_at: string;
}

export interface MedicationRow {
  id: string;
  name: string;
  dosage: string;
  scheduled_time: string;
  is_active: boolean;
}

export interface MedicationLogRow {
  id: string;
  medication_id: string;
  log_date: string;
  taken: boolean;
}

// --- API Service Methods ---
export const HealthAPI = {
  
  /**
   * Fetches the user's profile data
   */
  getProfile: async (userId: string): Promise<ProfileRow | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle(); // <-- CHANGED from .single() to .maybeSingle()

    if (error) {
      console.error('Error fetching profile:', error.message);
      return null;
    }
    return data;
  },

  /**
   * Fetches the last 7 days of blood pressure readings
   */
  getRecentBloodPressure: async (userId: string): Promise<BloodPressureRow[]> => {
    const { data, error } = await supabase
      .from('blood_pressure')
      .select('*')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false })
      .limit(14); // Grab up to 14 recent readings

    if (error) {
      console.error('Error fetching BP history:', error.message);
      return [];
    }
    return data.reverse(); // Reverse so oldest is first for the chart
  },

  /**
   * Logs a new blood pressure reading
   */
  logBloodPressure: async (userId: string, systolic: number, diastolic: number): Promise<BloodPressureRow | null> => {
    const { data, error } = await supabase
      .from('blood_pressure')
      .insert([{ user_id: userId, systolic, diastolic }])
      .select()
      .single();

    if (error) {
      console.error('Error logging BP:', error.message);
      return null;
    }
    return data;
  },

  /**
   * Fetches all active medications AND their taken status for TODAY
   */
  getTodayMedications: async (userId: string) => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    // 1. Get all active prescriptions
    const { data: meds, error: medsError } = await supabase
      .from('medications')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('scheduled_time', { ascending: true });

    if (medsError || !meds) {
      console.error('Error fetching medications:', medsError?.message);
      return [];
    }

    // 2. Get today's logs for these prescriptions
    const { data: logs, error: logsError } = await supabase
      .from('medication_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('log_date', today);

    if (logsError) {
      console.error('Error fetching medication logs:', logsError.message);
      return [];
    }

    // 3. Merge them together for the UI
    return meds.map((med) => {
      const logForMed = logs?.find((log) => log.medication_id === med.id);
      return {
        id: med.id, // We use the prescription ID as the main key
        name: med.name,
        dosage: med.dosage,
        time: med.scheduled_time,
        taken: logForMed ? logForMed.taken : false,
      };
    });
  },

  /**
   * Toggles a medication as taken/untaken for TODAY.
   * Uses an upsert to either create the log or update it if it exists.
   */
  toggleMedicationTaken: async (userId: string, medicationId: string, currentTakenStatus: boolean) => {
    const today = new Date().toISOString().split('T')[0];
    const newStatus = !currentTakenStatus;

    const { error } = await supabase
      .from('medication_logs')
      .upsert(
        { 
          user_id: userId, 
          medication_id: medicationId, 
          log_date: today, 
          taken: newStatus 
        },
        { onConflict: 'medication_id, log_date' } // Prevents duplicates for the same day
      );

    if (error) {
      console.error('Error toggling medication:', error.message);
      return false;
    }
    return true;
  },

  /**
   * Logs a new symptom for the AI to analyze later
   */
  logSymptom: async (userId: string, description: string, severity: 'Low' | 'Medium' | 'High') => {
    const { data, error } = await supabase
      .from('symptoms')
      .insert([{ user_id: userId, description, severity }])
      .select()
      .single();

    if (error) {
      console.error('Error logging symptom:', error.message);
      return null;
    }
    return data;
  }
};