import { GoogleGenerativeAI } from '@google/generative-ai';
import { ProfileRow, BloodPressureRow } from './healthApi';

// Initialize the Gemini SDK
const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY as string;
const genAI = new GoogleGenerativeAI(apiKey);

export const AIService = {
  /**
   * Generates a personalized health insight based on the user's current data.
   */
  generateHealthInsight: async (
    profile: ProfileRow | null, 
    bpHistory: BloodPressureRow[], 
    medications: any[],
    symptoms: any[] // <-- Added symptoms here
  ): Promise<string> => {
    try {
      if (!apiKey) throw new Error("Missing Gemini API Key in .env");

      // Calculate BMI
      let bmiStr = 'Unknown';
      if (profile?.weight_kg && profile?.height_cm) {
        const heightM = profile.height_cm / 100;
        bmiStr = (profile.weight_kg / (heightM * heightM)).toFixed(1);
      }

      // Format Arrays for the AI
      const recentBp = bpHistory.slice(0, 5).map(bp => 
        `${new Date(bp.recorded_at).toLocaleDateString()}: ${bp.systolic}/${bp.diastolic}`
      ).join('\n');

      const medsToday = medications.length > 0 
        ? medications.map(m => `- ${m.name} (${m.dosage}): ${m.taken ? 'Taken ✅' : 'Missed ❌'}`).join('\n')
        : 'No medications scheduled for today.';

      // Format Recent Symptoms
      const recentSymptoms = symptoms.length > 0
        ? symptoms.map(s => `- ${s.severity} severity: "${s.description}"`).join('\n')
        : 'No recent symptoms reported.';

      // The Upgraded Clinical Prompt
      const prompt = `
        You are a supportive, highly intelligent preventive healthcare AI assistant. 
        Analyze the following user data and provide a short, highly personalized health insight (max 3 sentences).
        
        USER PROFILE:
        - Age: ${profile?.age || 'Unknown'}
        - Gender: ${profile?.gender || 'Unknown'}
        - Blood Type: ${profile?.blood_type || 'Unknown'}
        - BMI: ${bmiStr}

        RECENT BLOOD PRESSURE:
        ${recentBp || 'No recent readings.'}

        RECENT SYMPTOMS:
        ${recentSymptoms}

        TODAY'S MEDICATIONS:
        ${medsToday}

        INSTRUCTIONS:
        1. Look for correlations (e.g., Did they miss blood pressure meds and report a headache?).
        2. Gently remind them of missed medications if applicable.
        3. Keep the tone warm, encouraging, and clinical.
        4. CRITICAL: Do not diagnose them. Use phrasing like "You might want to..." or "Consider monitoring...".
        5. Keep it to 3 short sentences maximum. Format as plain text.
      `;

      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const result = await model.generateContent(prompt);
      
      return result.response.text();
    } catch (error) {
      console.error("AI Generation Error:", error);
      return "I'm currently unable to analyze your health trends. Please ensure your data is up to date and check back later.";
    }
  }
};
