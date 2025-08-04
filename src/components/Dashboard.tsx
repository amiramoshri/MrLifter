import React, { useState, useEffect } from 'react';
import { User, Calendar, TrendingUp, Download, LogOut, Dumbbell, ExternalLink, Instagram, Facebook, Video, BarChart3, Trophy } from 'lucide-react';
import { User as UserType, WorkoutLog, Video as VideoType, Program } from '../types';
import { trainingPrograms } from '../data/programs';
import { getLogsFromSupabase, saveLogToSupabase, getVideosFromSupabase, saveVideoToSupabase, updateVideoInSupabase, deleteVideoFromSupabase } from '../utils/supabase-storage';
import { exportToCSV } from '../utils/export';
import ProgramViewer from './ProgramViewer';
import LogEntry from './LogEntry';
import LogHistory from './LogHistory';
import StatsPanel from './StatsPanel';
import VideosSection from './VideosSection';
import ChartsPanel from './ChartsPanel';
import PersonalRecordsPanel from './PersonalRecordsPanel';
import { isAdminUser } from '../utils/admin-config';
import { supabase } from '../lib/supabase';

interface DashboardProps {
  user: UserType;
  onLogout: () => void;
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'program' | 'log' | 'history' | 'stats' | 'videos' | 'charts' | 'pr'>('program');
  const [selectedMonth, setSelectedMonth] = useState('August');
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [programs, setPrograms] = useState<Program[]>(trainingPrograms);
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<{ name: string; sets: number; reps: string; weight?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');

  // Check if current user is admin
  const isUserAdmin = isAdminUser(userEmail);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const [userLogs, allVideos] = await Promise.all([
          getLogsFromSupabase(),
          getVideosFromSupabase()
        ]);
        
        setLogs(userLogs);
        setVideos(allVideos);
        
        // Get user email for admin check
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
          setUserEmail(user.email);
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data. Please check your connection.');
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

  const handleProgramUpdate = (updatedPrograms: Program[]) => {
    setPrograms(updatedPrograms);
    // Save to localStorage
    localStorage.setItem('mr-lifter-programs', JSON.stringify(updatedPrograms));
    // Force re-render
    setPrograms([...updatedPrograms]);
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

  // Load custom programs from localStorage on mount
  useEffect(() => {
    const savedPrograms = localStorage.getItem('mr-lifter-programs');
    if (savedPrograms) {
      setPrograms(JSON.parse(savedPrograms));
    }
  }, []);

  const handleExport = () => {
    exportToCSV(logs, user);
  };

  const tabs = [
    { id: 'program', label: 'תוכנית', icon: Calendar },
    { id: 'log', label: 'רישום', icon: Dumbbell },
    { id: 'history', label: 'היסטוריה', icon: TrendingUp },
    { id: 'stats', label: 'סטטיסטיקות', icon: User },
    { id: 'videos', label: 'וידאו', icon: Video },
    { id: 'charts', label: 'תרשימים', icon: BarChart3 },
    { id: 'pr', label: 'שיאים', icon: Trophy }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="mb-6">
            <img 
              src="/WhatsApp Image 2025-08-03 at 18.39.13.jpeg" 
              alt="Mr. Lifter Logo" 
              className="w-20 h-20 sm:w-28 sm:h-28 mx-auto rounded-lg object-contain border-4 border-white shadow-lg animate-pulse"
            />
          </div>
          <div className="animate-spin w-8 h-8 sm:w-12 sm:h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white font-medium text-sm sm:text-base">Loading your data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Logo Header */}
      <div className="bg-black py-4 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 text-center">
          <img 
            src="/WhatsApp Image 2025-08-03 at 18.39.13.jpeg" 
            alt="Mr. Lifter Logo" 
           className="w-20 h-20 sm:w-28 sm:h-28 mx-auto rounded-lg object-contain border-4 border-white shadow-lg"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="fixed top-4 right-4 z-50 max-w-sm">
          <div className="bg-red-600 text-white p-4 rounded-lg shadow-lg border border-red-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-xs">⚠️</span>
                </div>
                <p className="text-sm font-medium">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-white/80 hover:text-white text-lg font-bold ml-2"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-4">
              <div>
                <p className="text-slate-300 text-xs sm:text-sm">ברוך הבא, {user.name}</p>
                <div className="flex items-center space-x-3 mt-1">
                  <a
                    href="https://mrlifter.co.il/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-slate-400 hover:text-white transition-colors text-xs"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>אתר</span>
                  </a>
                  <a
                    href="https://www.instagram.com/mr.lifter_savyon/?igshid=NTc4MTIwNjQ2YQ"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-slate-400 hover:text-pink-400 transition-colors text-xs"
                  >
                    <Instagram className="w-3 h-3" />
                    <span>Instagram</span>
                  </a>
                  <a
                    href="https://www.facebook.com/mrliftersavyon"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-slate-400 hover:text-blue-400 transition-colors text-xs"
                  >
                    <Facebook className="w-3 h-3" />
                    <span>Facebook</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4 flex-wrap">
              {logs.length > 0 && (
                <button
                  onClick={handleExport}
                  className="flex items-center space-x-1 sm:space-x-2 bg-green-600 hover:bg-green-700 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-lg transition-colors text-xs sm:text-sm"
                >
                  <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">יצוא</span>
                </button>
              )}
              
              {isUserAdmin && (
                <button
                  onClick={() => setIsAdmin(!isAdmin)}
                  className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-1 sm:py-2 rounded-lg transition-colors text-xs sm:text-sm ${
                    isAdmin 
                      ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                      : 'bg-gray-600 hover:bg-gray-700 text-white'
                  }`}
                >
                  <span>{isAdmin ? 'יציאה מאדמין' : 'מצב אדמין'}</span>
                </button>
              )}

              <button
                onClick={onLogout}
                className="flex items-center space-x-1 sm:space-x-2 bg-red-600 hover:bg-red-700 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-lg transition-colors text-xs sm:text-sm"
              >
                <LogOut className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">התנתק</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-2">
          <div className="flex space-x-1 sm:space-x-2 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 sm:py-3 rounded-lg font-medium transition-all whitespace-nowrap text-xs sm:text-sm ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white active:bg-white/20'
                  }`}
                >
                  <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Month Selector for Program Tab */}
        {activeTab === 'program' && (
          <div className="mt-4 sm:mt-6 bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
            <label className="flex items-center text-slate-300 font-medium mb-2 text-xs sm:text-sm">
              <Calendar className="w-4 h-4 mr-2" />
              בחר חודש אימונים:
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-slate-700 text-white border border-slate-600 rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base w-full sm:w-auto touch-manipulation"
            >
              <option value="August">אוגוסט</option>
              <option value="September">ספטמבר</option>
              <option value="October">אוקטובר</option>
            </select>
          </div>
        )}

        {/* Content */}
        <div className="mt-4 sm:mt-6">
          {activeTab === 'program' && (
            <ProgramViewer
              program={programs.find(p => p.month === selectedMonth)!}
              isAdmin={isAdmin}
              onProgramUpdate={handleProgramUpdate}
              allPrograms={programs}
              onExerciseSelect={!isAdmin ? handleExerciseSelect : undefined}
            />
          )}

          {activeTab === 'log' && (
            <LogEntry 
              onSubmit={handleLogSubmit} 
              selectedExercise={selectedExercise}
              onExerciseUsed={() => setSelectedExercise(null)}
            />
          )}

          {activeTab === 'history' && (
            <LogHistory logs={logs} />
          )}

          {activeTab === 'stats' && (
            <StatsPanel user={user} logs={logs} />
          )}

          {activeTab === 'videos' && (
            <VideosSection 
              videos={videos} 
              isAdmin={isAdmin} 
              onVideoUpdate={handleVideoUpdate}
            />
          )}

          {activeTab === 'charts' && (
            <ChartsPanel user={user} logs={logs} />
          )}

          {activeTab === 'pr' && (
            <PersonalRecordsPanel userId={user.id} logs={logs} />
          )}
        </div>
      </div>
    </div>
  );
}