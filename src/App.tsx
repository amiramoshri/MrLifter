import React, { useState, useEffect } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { User, WorkoutLog } from './types';
import { signOut } from './lib/supabase';
import { saveUserToSupabase, getUserFromSupabase } from './utils/supabase-storage';
import AuthWrapper from './components/AuthWrapper';
import UserRegistration from './components/UserRegistration';
import Dashboard from './components/Dashboard';

function AppContent({ authUser }: { authUser: SupabaseUser }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing user profile in Supabase
    const loadUser = async () => {
      const existingUser = await getUserFromSupabase();
      if (existingUser) {
        setUser(existingUser);
      }
      setIsLoading(false);
    };
    
    loadUser();
  }, [authUser]);

  const handleUserSaved = async (newUser: Omit<User, 'id' | 'createdAt'>) => {
    const savedUser = await saveUserToSupabase(newUser);
    if (savedUser) {
      setUser(savedUser);
    }
  };

  const handleLogout = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to logout?'
    );
    
    if (confirmed) {
      await signOut();
      setUser(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="mb-6">
            <img 
              src="/WhatsApp Image 2025-08-03 at 18.39.13.jpeg" 
              alt="Mr. Lifter Logo" 
             className="w-32 h-32 mx-auto rounded-lg object-contain border-4 border-white shadow-lg animate-pulse"
            />
          </div>
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <UserRegistration onUserSaved={handleUserSaved} />;
  }

  return <Dashboard user={user} onLogout={handleLogout} />;
}

function App() {
  return (
    <AuthWrapper>
      {(authUser) => <AppContent authUser={authUser} />}
    </AuthWrapper>
  );
}

export default App;