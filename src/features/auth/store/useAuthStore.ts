import { create } from 'zustand';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../../../core/supabase';

interface AuthState {
  session: Session | null;
  user: User | null;
  isInitialized: boolean; // Helps us show a loading spinner while checking async storage
  setSession: (session: Session | null) => void;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  user: null,
  isInitialized: false,
  
  setSession: (session) => 
    set({ 
      session, 
      user: session?.user || null, 
      isInitialized: true 
    }),

  signOut: async () => {
    await supabase.auth.signOut();
    set({ session: null, user: null });
  },
}));

// Initialize the listener outside the hook so it only runs once
supabase.auth.onAuthStateChange((_event, session) => {
  useAuthStore.getState().setSession(session);
});