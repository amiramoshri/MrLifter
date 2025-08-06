import React, { useState, useEffect } from 'react';
import { User, Calendar, TrendingUp, Download, LogOut, Dumbbell, ExternalLink, Instagram, Facebook, Video, BarChart3, Trophy, Menu, X } from 'lucide-react';
import { User as UserType, WorkoutLog, Video as VideoType, Program } from '../types';
import { trainingPrograms } from '../data/programs';
import { getLogsFromSupabase, saveLogToSupabase, getVideosFromSupabase, saveVideoToSupabase, updateVideoInSupabase, deleteVideoFromSupabase, updateUserInSupabase, getProgramsFromSupabase, saveProgramToSupabase } from '../utils/supabase-storage';
import { exportToCSV } from '../utils/export';
import ProgramViewer from './ProgramViewer';
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
  const [activeTab, setActiveTab] = useState<'program' | 'log' | 'history' | 'stats' | 'videos' | 'charts' | 'pr' | 'profile'>('program');
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

  // Check if current user is admin
  const isUserAdmin = isAdminUser(userEmail);

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
        
        // Get user email for admin check
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user?.email) {
            setUserEmail(user.email);
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

  const handleLogUpdate = (updatedLog: WorkoutLog) => {
    setLogs(prevLogs => 
      prevLogs.map(log => log.id === updatedLog.id ? updatedLog : log)
    );
  };

  const handleLogDelete = (logId: string) => {
    setLogs(prevLogs => prevLogs.filter(log => log.id !== logId));
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

  const tabs = [
    { id: 'program', label: 'Program', icon: Calendar },
    { id: 'log', label: 'Log', icon: Dumbbell },
    { id: 'history', label: 'History', icon: TrendingUp },
    { id: 'videos', label: 'Videos', icon: Video },
    { id: 'charts', label: 'Charts', icon: BarChart3 },
    { id: 'pr', label: 'Records', icon: Trophy }
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
    <>
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

        {/* Click outside to close hamburger menu */}
        {showHamburgerMenu && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowHamburgerMenu(false)}
          />
        )}

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

        {/* Success Message */}
        {successMessage && (
          <div className="fixed top-4 right-4 z-50 max-w-sm">
            <div className="bg-green-600 text-white p-4 rounded-lg shadow-lg border border-green-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-xs">✅</span>
                  </div>
                  <p className="text-sm font-medium">{successMessage}</p>
                </div>
                <button
                  onClick={() => setSuccessMessage(null)}
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
                  <div className="flex items-center space-x-2">
                    <p className="text-slate-300 text-xs sm:text-sm">Welcome, {user.name}</p>
                    <button
                      onClick={() => setActiveTab('profile')}
                      className={`flex items-center space-x-1 px-2 py-1 rounded-lg transition-colors text-xs ${
                        activeTab === 'profile'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
                      }`}
                    >
                      <User className="w-3 h-3" />
                      <span>Profile</span>
                    </button>
                  </div>
                  <div className="flex items-center space-x-3 mt-1">
                    <a
                      href="https://mrlifter.co.il/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-slate-400 hover:text-white transition-colors text-xs"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Website</span>
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

              {/* Hamburger Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowHamburgerMenu(!showHamburgerMenu)}
                  className="flex items-center justify-center w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  {showHamburgerMenu ? (
                    <X className="w-5 h-5 text-white" />
                  ) : (
                    <Menu className="w-5 h-5 text-white" />
                  )}
                </button>

                {/* Hamburger Menu Dropdown */}
                {showHamburgerMenu && (
                  <div className="absolute right-0 top-12 w-48 bg-slate-800 rounded-xl border border-white/20 shadow-xl z-[9999]">
                    <div className="p-2 space-y-1">
                      <button
                        onClick={() => {
                          setActiveTab('profile');
                          setShowHamburgerMenu(false);
                        }}
                        className="w-full flex items-center space-x-3 px-3 py-2 text-left text-white hover:bg-white/10 rounded-lg transition-colors text-sm"
                      >
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                      </button>

                      {logs.length > 0 && (
                        <button
                          onClick={() => {
                            handleExport();
                            setShowHamburgerMenu(false);
                          }}
                          className="w-full flex items-center space-x-3 px-3 py-2 text-left text-white hover:bg-white/10 rounded-lg transition-colors text-sm"
                        >
                          <Download className="w-4 h-4" />
                          <span>Export Data</span>
                        </button>
                      )}

                      {isUserAdmin && (
                        <button
                          onClick={() => {
                            setIsAdmin(!isAdmin);
                            setShowHamburgerMenu(false);
                          }}
                          className="w-full flex items-center space-x-3 px-3 py-2 text-left text-white hover:bg-white/10 rounded-lg transition-colors text-sm"
                        >
                          <span className="w-4 h-4 text-center">👑</span>
                          <span>{isAdmin ? 'Exit Admin' : 'Admin Mode'}</span>
                        </button>
                      )}

                      <div className="border-t border-white/20 my-1"></div>

                      <button
                        onClick={() => {
                          onLogout();
                          setShowHamburgerMenu(false);
                        }}
                        className="w-full flex items-center space-x-3 px-3 py-2 text-left text-red-400 hover:bg-red-600/20 rounded-lg transition-colors text-sm"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
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

          {/* Content */}
          <div className="mt-4 sm:mt-6">
            {activeTab === 'program' && (
              <ProgramViewer
                program={programs.find(p => p.month === selectedMonth)!}
                isAdmin={isAdmin}
                onProgramUpdate={handleProgramUpdate}
                allPrograms={programs}
                onExerciseSelect={!isAdmin ? handleExerciseSelect : undefined}
                selectedMonth={selectedMonth}
                onMonthChange={setSelectedMonth}
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
              <LogHistory 
                logs={logs} 
                onEditProfile={() => setShowProfileEditor(true)}
                onLogUpdate={handleLogUpdate}
                onLogDelete={handleLogDelete}
              />
            )}


            {activeTab === 'profile' && (
              <ProfilePanel user={user} logs={logs} onUserUpdate={handleProfileUpdate} />
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

      {/* Profile Editor Modal */}
      {showProfileEditor && (
        <ProfileEditor
          user={user}
          onProfileUpdate={handleProfileUpdate}
          onClose={() => setShowProfileEditor(false)}
        />
      )}
    </>
  );
}