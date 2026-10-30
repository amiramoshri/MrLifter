import React, { useEffect, useState } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { Chrome, Dumbbell } from 'lucide-react';
import { supabase, signInWithGoogle, isSupabaseAvailable } from '../lib/supabase';

interface AuthWrapperProps {
  children: (user: SupabaseUser) => React.ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseAvailable() || !supabase) {
      setError('החיבור למערכת עדיין לא הוגדר. יש להגדיר פרטי Supabase בקובץ הסביבה.');
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session }, error: sessionError }) => {
      if (sessionError) setError('לא הצלחנו לטעון את ההתחברות. נסה שוב.');
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      const { error: authError } = await signInWithGoogle();
      if (authError) setError(authError.message || 'ההתחברות עם Google נכשלה. נסה שוב.');
    } catch {
      setError('אירעה שגיאה בהתחברות. נסה שוב בעוד רגע.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main dir="rtl" className="min-h-screen bg-[#090b10] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-900/40">
            <Dumbbell className="h-8 w-8" />
          </div>
          <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
          <p className="text-sm text-slate-300">טוען את MrLifter...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main dir="rtl" className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#090b10] px-4 py-10">
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-600/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <section className="relative w-full max-w-md rounded-3xl border border-white/10 bg-slate-900/90 p-7 text-center shadow-2xl shadow-black/40 sm:p-10">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-xl shadow-blue-900/40">
            <Dumbbell className="h-10 w-10" />
          </div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-blue-400">TRAIN SMARTER · GET STRONGER</p>
          <h1 className="mb-3 text-4xl font-black tracking-tight text-white">MrLifter</h1>
          <p className="mb-8 text-sm leading-7 text-slate-300">
            כל האימונים, התוכניות וההתקדמות שלך במקום אחד.
            <br />מתחברים ומתחילים לעבוד.
          </p>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting || !isSupabaseAvailable()}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-white px-5 py-4 font-bold text-slate-900 shadow-lg transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Chrome className="h-5 w-5" />
            {isSubmitting ? 'מעביר להתחברות...' : 'המשך עם Google'}
          </button>

          {error && (
            <div role="alert" className="mt-5 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-right text-sm leading-6 text-red-200">
              {error}
            </div>
          )}

          <p className="mt-7 text-xs leading-5 text-slate-500">
            בהתחברות אתה מאשר שימוש בחשבון Google לצורך זיהוי ושמירת נתוני האימונים שלך.
          </p>
        </section>
      </main>
    );
  }

  return <>{children(user)}</>;
}
