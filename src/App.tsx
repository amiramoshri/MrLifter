import React, { useEffect, useState } from 'react';
import { User } from './types';
import { getUserFromSupabase, saveUserToSupabase } from './utils/supabase-storage';
import UserRegistration from './components/UserRegistration';
import Dashboard from './components/Dashboard';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getUserFromSupabase().then((savedUser) => {
      if (active) {
        setUser(savedUser);
        setLoading(false);
      }
    });
    return () => { active = false; };
  }, []);

  const handleUserSaved = async (profile: Omit<User, 'id' | 'createdAt'>) => {
    const saved = await saveUserToSupabase(profile);
    if (saved) setUser(saved);
  };

  if (loading) {
    return <main dir="rtl" className="min-h-screen bg-[#090b10] flex items-center justify-center text-white"><div className="text-center"><div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" /><p>טוען את MrLifter...</p></div></main>;
  }

  if (!user) return <UserRegistration onUserSaved={handleUserSaved} />;

  return <Dashboard user={user} onLogout={() => { localStorage.removeItem('mrlifter.profile'); setUser(null); }} onUserUpdate={setUser} />;
}

export default App;
