import React, { useState, useEffect, useRef } from 'react';
import { User, Calendar, TrendingUp, Download, LogOut, Dumbbell, ExternalLink, Instagram, Facebook, Video, BarChart3, Trophy, Menu, X, Upload, Activity } from 'lucide-react';
import { User as UserType, WorkoutLog, Video as VideoType, Program } from '../types';
import { trainingPrograms } from '../data/programs';
import { getLogsFromSupabase, saveLogToSupabase, getVideosFromSupabase, saveVideoToSupabase, updateVideoInSupabase, deleteVideoFromSupabase, updateUserInSupabase, getProgramsFromSupabase, saveProgramToSupabase, deleteLogFromSupabase, updateLogInSupabase } from '../utils/supabase-storage';
import { exportToCSV } from '../utils/export';
import ProgramViewer from './ProgramViewer';
import HomePanel from './HomePanel';
import LogEntry from './LogEntry';
import LogHistory from './LogHistory';
import StatsPanel from './StatsPanel';
import VideosSection from './VideosSection';
import ChartsPanel from './ChartsPanel';
import PersonalRecordsPanel from './PersonalRecordsPanel';
import ProfilePanel from './ProfilePanel';
import ProfileEditor from './ProfileEditor';
import { isAdminUser } from '../utils/admin-config';
import { supabase } from '../lib/supabase';

interface DashboardProps {
  user: UserType;
  onLogout: () => void;
  onUserUpdate: (updatedUser: UserType) => void;
}

export default function Dashboard({ user, onLogout, onUserUpdate }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'home' | 'program' | 'log' | 'history' | 'stats' | 'videos' | 'charts' | 'pr' | 'profile'>('home');
  const [selectedMonth, setSelectedMonth] = useState('August');
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<{ name: string; sets: number; reps: string; weight?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [showHamburgerMenu, setShowHamburgerMenu] = useState(false);
  const backupInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Load data with fallbacks if Supabase is not available
        let userLogs: WorkoutLog[] = [];
        let allVideos: VideoType[] = [];
        let allPrograms: Program[] = [];
        
        try {
          [userLogs, allVideos, allPrograms] = await Promise.all([
            getLogsFromSupabase(),
            getVideosFromSupabase(),
            getProgramsFromSupabase()
          ]);
        } catch (fetchError) {
          console.warn('Failed to fetch data from Supabase, using fallbacks:', fetchError);
          // Use empty arrays as fallbacks
          userLogs = [];
          allVideos = [];
          allPrograms = [];
        }
        
        setLogs(userLogs);
        setVideos(allVideos);
        
        // Merge database programs with default programs
        const mergedPrograms = [...trainingPrograms];
        allPrograms.forEach(dbProgram => {
          const existingIndex = mergedPrograms.findIndex(p => p.month === dbProgram.month);
          if (existingIndex >= 0) {
            mergedPrograms[existingIndex] = dbProgram;
          } else {
            mergedPrograms.push(dbProgram);
          }
        });
        setPrograms(mergedPrograms);
        
        // Local-only prototype: enable coach tools in this browser while backend auth is absent.
        if (!supabase) setIsAdmin(true);

        // Get user email for admin check
        try {
          const { data: { user } } = await supabase?.auth.getUser() ?? { data: { user: null } };
          if (user?.email) {
            setUserEmail(user.email);
            // Auto-enable admin mode for admin users
            if (isAdminUser(user.email)) {
              setIsAdmin(true);
            }
          }
        } catch (authError) {
          console.warn('Failed to get user email:', authError);
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Some features may not work properly. Please check your internet connection.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();

    // Listen for program creation events
    const handleProgramCreated = (event: CustomEvent) => {
      setSelectedMonth(event.detail.month);
    };

    window.addEventListener('programCreated', handleProgramCreated as EventListener);

    return () => {
      window.removeEventListener('programCreated', handleProgramCreated as EventListener);
    };
  }, [user.id]);

  const handleProfileUpdate = async (updatedUser: UserType) => {
    try {
      const savedUser = await updateUserInSupabase({
        name: updatedUser.name,
        weight: updatedUser.weight,
        height: updatedUser.height,
        age: updatedUser.age,
        bmi: updatedUser.bmi
      });

      if (savedUser) {
        onUserUpdate(savedUser);
        setShowProfileEditor(false);
        setSuccessMessage('Profile updated successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError('Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
    }
  };
  const handleLogSubmit = async (newLog: Omit<WorkoutLog, 'id' | 'userId'>) => {
    try {
      const savedLog = await saveLogToSupabase(newLog);
      if (savedLog) {
        setLogs(prevLogs => [savedLog, ...prevLogs]);
      } else {
        setError('Failed to save workout log');
      }
    } catch (err) {
      console.error('Error saving log:', err);
      setError('Failed to save workout log');
    }
  };

  const handleLogUpdate = async (id: string, updates: Partial<WorkoutLog>) => {
    try {
      const savedLog = await updateLogInSupabase(id, updates);
      
      if (savedLog) {
        setLogs(prevLogs => 
          prevLogs.map(log => log.id === id ? savedLog : log)
        );
        setSuccessMessage('Workout log updated successfully!');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        setError('Failed to update workout log');
      }
    } catch (err) {
      console.error('Error updating log:', err);
      setError('Failed to update workout log');
    }
  };

  const handleLogDelete = (logId: string) => {
    const deleteLog = async () => {
      try {
        const success = await deleteLogFromSupabase(logId);
        if (success) {
          setLogs(prevLogs => prevLogs.filter(log => log.id !== logId));
          setSuccessMessage('Workout log deleted successfully!');
          setTimeout(() => setSuccessMessage(null), 3000);
        } else {
          setError('Failed to delete workout log');
        }
      } catch (err) {
        console.error('Error deleting log:', err);
        setError('Failed to delete workout log');
      }
    };
    
    deleteLog();
  };

  const handleProgramUpdate = async (updatedPrograms: Program[]) => {
    setPrograms(updatedPrograms);
    
    // Save updated programs to database
    try {
      for (const program of updatedPrograms) {
        // Only save programs that are different from the default ones
        const defaultProgram = trainingPrograms.find(p => p.month === program.month);
        if (!defaultProgram || JSON.stringify(program) !== JSON.stringify(defaultProgram)) {
          await saveProgramToSupabase(program);
        }
      }
    } catch (err) {
      console.error('Error saving programs:', err);
      setError('Failed to save program changes');
    }
  };

  const handleVideoUpdate = async (action: 'add' | 'update' | 'delete', videoData: any) => {
    try {
      if (action === 'add') {
        const savedVideo = await saveVideoToSupabase(videoData);
        if (savedVideo) {
          setVideos(prevVideos => [savedVideo, ...prevVideos]);
        } else {
          setError('Failed to add video');
        }
      } else if (action === 'update') {
        const updatedVideo = await updateVideoInSupabase(videoData.id, videoData);
        if (updatedVideo) {
          setVideos(prevVideos => 
            prevVideos.map(v => v.id === videoData.id ? updatedVideo : v)
          );
        } else {
          setError('Failed to update video');
        }
      } else if (action === 'delete') {
        const success = await deleteVideoFromSupabase(videoData.id);
        if (success) {
          setVideos(prevVideos => prevVideos.filter(v => v.id !== videoData.id));
        } else {
          setError('Failed to delete video');
        }
      }
    } catch (err) {
      console.error('Error updating video:', err);
      setError('Failed to update video');
    }
  };

  const handleExerciseSelect = (exercise: { name: string; sets: number; reps: string; weight?: string }) => {
    setSelectedExercise(exercise);
    setActiveTab('log');
  };


  const handleExport = () => {
    exportToCSV(logs, user);
  };

  const handleBackupExport = () => {
    const keys = ['mrlifter.profile', 'mrlifter.workoutLogs', 'mrlifter.videos', 'mrlifter.goals', 'mrlifter.programs'];
    const data = Object.fromEntries(keys.map(key => [key, localStorage.getItem(key)]));
    const backup = { app: 'MrLifter', schemaVersion: 1, exportedAt: new Date().toISOString(), data };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mrlifter-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setSuccessMessage('גיבוי הנתונים הורד בהצלחה');
    setTimeout(() => setSuccessMessage(null), 3000);
    setShowHamburgerMenu(false);
  };

  const handleBackupImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const backup = JSON.parse(await file.text());
      const keys = ['mrlifter.profile', 'mrlifter.workoutLogs', 'mrlifter.videos', 'mrlifter.goals', 'mrlifter.programs'];
      if (backup?.app !== 'MrLifter' || backup?.schemaVersion !== 1 || !backup?.data || typeof backup.data !== 'object') {
        throw new Error('קובץ הגיבוי אינו תקין או אינו נתמך');
      }
      const profileRaw = backup.data['mrlifter.profile'];
      if (typeof profileRaw !== 'string') throw new Error('קובץ הגיבוי לא מכיל פרופיל מתאמן');
      const profile = JSON.parse(profileRaw);
      if (!profile || typeof profile.id !== 'string' || typeof profile.name !== 'string') {
        throw new Error('פרופיל המתאמן בקובץ הגיבוי אינו תקין');
      }
      for (const key of keys) {
        const value = backup.data[key];
        if (value !== null && value !== undefined && typeof value !== 'string') throw new Error('מבנה נתונים לא תקין בקובץ הגיבוי');
        if (typeof value === 'string') JSON.parse(value);
      }
      if (!window.confirm('ייבוא הגיבוי יחליף את הנתונים המקומיים בדפדפן. להמשיך?')) return;
      for (const key of keys) {
        const value = backup.data[key];
        if (typeof value === 'string') localStorage.setItem(key, value);
        else localStorage.removeItem(key);
      }
      window.location.reload();
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : 'לא ניתן לייבא את קובץ הגיבוי');
    } finally {
      event.target.value = '';
    }
  };

  const tabs = [
    { id: 'home', label: 'ראשי', icon: Activity },
    { id: 'program', label: 'תוכנית', icon: Calendar },
    { id: 'log', label: 'רישום אימון', icon: Dumbbell },
    { id: 'history', label: 'היסטוריה', icon: TrendingUp },
    { id: 'videos', label: 'סרטונים', icon: Video },
    { id: 'charts', label: 'גרפים', icon: BarChart3 },
    { id: 'pr', label: 'שיאים', icon: Trophy }
  ];

  if (isLoading) {
    return (
      <main dir="rtl" className="min-h-screen bg-[#080b0a] flex items-center justify-center text-white">
        <div className="text-center">
          <div className="mx-auto mb-5 h-14 w-14 rounded-2xl border border-lime-300/30 bg-lime-300/10 flex items-center justify-center">
            <Dumbbell className="h-7 w-7 text-lime-300 animate-pulse" />
          </div>
          <div className="mx-auto mb-4 h-7 w-7 animate-spin rounded-full border-2 border-lime-300 border-t-transparent" />
          <p className="text-sm text-slate-300">מכינים את האימון שלך...</p>
        </div>
      </main>
    );
  }

  const mobileTabs = tabs.filter(tab => ['home', 'program', 'log', 'history', 'charts'].includes(tab.id));
  const extraTabs = tabs.filter(tab => ['videos', 'pr'].includes(tab.id));

  return (
    <>
      <div dir="rtl" className="min-h-screen bg-[#080b0a] text-white pb-24 lg:pb-8">
        <input ref={backupInputRef} type="file" accept="application/json,.json" className="hidden" onChange={handleBackupImport} />
        <div className="border-b border-amber-300/15 bg-amber-300/[0.06] px-4 py-2 text-center text-[11px] font-medium text-amber-200/90">
          מצב מקומי · הנתונים נשמרים במכשיר הזה בלבד
        </div>

        <header className="sticky top-0 z-30 border-b border-white/[0.07] bg-[#080b0a]/90 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <img src="/WhatsApp Image 2025-08-03 at 18.39.13.jpeg" alt="Mr. Lifter" className="h-10 w-10 rounded-xl border border-white/10 bg-white object-contain p-0.5" />
              <div className="min-w-0">
                <p className="text-sm font-black tracking-wide text-white">MR<span className="text-lime-300">.</span>LIFTER</p>
                <p className="text-[10px] text-slate-500">TRAIN HARD. TRACK SMART.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden text-left sm:block">
                <p className="text-xs font-semibold text-white">{user.name}</p>
                <p className="text-[10px] text-slate-500">{isAdmin ? 'מצב מאמן' : 'אזור אישי'}</p>
              </div>
              <button onClick={() => setShowHamburgerMenu(!showHamburgerMenu)} aria-label="פתיחת תפריט" className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-slate-200 transition hover:bg-white/10">
                {showHamburgerMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              {showHamburgerMenu && (
                <div className="absolute left-4 top-[4.5rem] z-50 w-64 overflow-hidden rounded-2xl border border-white/10 bg-[#141a17] p-2 shadow-2xl">
                  <div className="border-b border-white/10 px-3 py-3">
                    <p className="text-sm font-bold text-white">{user.name}</p>
                    <p className="mt-1 text-xs text-slate-400">ניהול החשבון והנתונים</p>
                  </div>
                  <button onClick={() => { setActiveTab('profile'); setShowHamburgerMenu(false); }} className="menu-action"><User className="h-4 w-4" /> פרופיל אישי</button>
                  {extraTabs.map(tab => { const Icon = tab.icon; return <button key={tab.id} onClick={() => { setActiveTab(tab.id as any); setShowHamburgerMenu(false); }} className="menu-action"><Icon className="h-4 w-4" /> {tab.label}</button>; })}
                  {logs.length > 0 && <button onClick={() => { handleExport(); setShowHamburgerMenu(false); }} className="menu-action"><Download className="h-4 w-4" /> ייצוא נתונים ל־CSV</button>}
                  <button onClick={handleBackupExport} className="menu-action"><Download className="h-4 w-4" /> גיבוי מלא</button>
                  <button onClick={() => backupInputRef.current?.click()} className="menu-action"><Upload className="h-4 w-4" /> שחזור מגיבוי</button>
                  {isAdminUser(userEmail) && <button onClick={() => { setIsAdmin(!isAdmin); setShowHamburgerMenu(false); }} className="menu-action text-amber-300">👑 {isAdmin ? 'יציאה ממצב מאמן' : 'כניסה למצב מאמן'}</button>}
                  <div className="my-1 border-t border-white/10" />
                  <button onClick={() => { onLogout(); setShowHamburgerMenu(false); }} className="menu-action text-rose-300"><LogOut className="h-4 w-4" /> התנתקות</button>
                </div>
              )}
            </div>
          </div>
        </header>

        {showHamburgerMenu && <button aria-label="סגירת תפריט" className="fixed inset-0 z-20 cursor-default" onClick={() => setShowHamburgerMenu(false)} />}

        {(error || successMessage) && (
          <div className="fixed left-4 right-4 top-24 z-[60] mx-auto max-w-md">
            <div className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm shadow-2xl backdrop-blur-xl ${error ? 'border-rose-400/30 bg-rose-950/95 text-rose-100' : 'border-lime-300/30 bg-[#182414]/95 text-lime-100'}`}>
              <p>{error || successMessage}</p>
              <button onClick={() => { setError(null); setSuccessMessage(null); }} className="rounded-lg px-2 py-1 text-lg opacity-70 hover:opacity-100">×</button>
            </div>
          </div>
        )}

        <main className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 sm:pt-8">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="mb-1 text-xs font-bold tracking-[0.18em] text-lime-300/80">YOUR TRAINING SPACE</p>
              <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                {activeTab === 'home' ? `היי ${user.name}, מוכנים להתחזק?` : tabs.find(tab => tab.id === activeTab)?.label || 'פרופיל אישי'}
              </h1>
              <p className="mt-2 text-sm text-slate-400">{activeTab === 'home' ? 'ההתקדמות שלך מתחילה באימון הבא.' : 'כל הנתונים והכלים שלך במקום אחד.'}</p>
            </div>
            {isAdmin && <span className="shrink-0 rounded-full border border-lime-300/20 bg-lime-300/10 px-3 py-1.5 text-[11px] font-bold text-lime-200">מצב מאמן</span>}
          </div>

          <nav className="mb-6 hidden overflow-x-auto rounded-2xl border border-white/[0.07] bg-white/[0.025] p-1.5 lg:block">
            <div className="flex min-w-max gap-1">
              {tabs.map(tab => { const Icon = tab.icon; return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${activeTab === tab.id ? 'bg-lime-300 text-[#10150e] shadow-lg shadow-lime-300/10' : 'text-slate-400 hover:bg-white/[0.06] hover:text-white'}`}>
                  <Icon className="h-4 w-4" />{tab.label}
                </button>
              ); })}
            </div>
          </nav>

          <div className="min-h-[55vh]">
            {activeTab === 'home' && <HomePanel user={user} logs={logs} program={programs.find(p => p.month === selectedMonth)} onStartWorkout={() => setActiveTab('log')} onViewProgram={() => setActiveTab('program')} />}
            {activeTab === 'program' && <ProgramViewer program={programs.find(p => p.month === selectedMonth)!} isAdmin={isAdmin} onProgramUpdate={handleProgramUpdate} allPrograms={programs} onExerciseSelect={!isAdmin ? handleExerciseSelect : undefined} selectedMonth={selectedMonth} onMonthChange={setSelectedMonth} />}
            {activeTab === 'log' && <LogEntry onSubmit={handleLogSubmit} selectedExercise={selectedExercise} onExerciseUsed={() => setSelectedExercise(null)} />}
            {activeTab === 'history' && <LogHistory logs={logs} onEditProfile={() => setShowProfileEditor(true)} onLogUpdate={handleLogUpdate} onLogDelete={handleLogDelete} />}
            {activeTab === 'profile' && <ProfilePanel user={user} logs={logs} onUserUpdate={handleProfileUpdate} />}
            {activeTab === 'videos' && <VideosSection videos={videos} isAdmin={isAdmin} onVideoUpdate={handleVideoUpdate} />}
            {activeTab === 'charts' && <ChartsPanel user={user} logs={logs} />}
            {activeTab === 'pr' && <PersonalRecordsPanel userId={user.id} logs={logs} />}
          </div>
        </main>

        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0c110e]/95 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 backdrop-blur-2xl lg:hidden">
          <div className="mx-auto grid max-w-xl grid-cols-5 gap-1">
            {mobileTabs.map(tab => { const Icon = tab.icon; const active = activeTab === tab.id; return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-semibold transition ${active ? 'bg-lime-300/10 text-lime-300' : 'text-slate-500 hover:text-slate-200'}`}>
                <Icon className={`h-5 w-5 ${active ? 'stroke-[2.5]' : ''}`} />
                <span>{tab.id === 'log' ? 'אימון' : tab.label}</span>
                {active && <span className="h-1 w-1 rounded-full bg-lime-300" />}
              </button>
            ); })}
          </div>
        </nav>
      </div>

      {showProfileEditor && <ProfileEditor user={user} onProfileUpdate={handleProfileUpdate} onClose={() => setShowProfileEditor(false)} />}
    </>
  );
}
