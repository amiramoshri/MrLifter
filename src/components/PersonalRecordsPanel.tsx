import React, { useState, useEffect } from 'react';
import { Trophy, Award, TrendingUp, Calendar, Dumbbell, Plus, Edit3, Trash2 } from 'lucide-react';
import { PersonalRecord, WorkoutLog } from '../types';
import { getLogsFromSupabase } from '../utils/supabase-storage';
import { getExerciseImage, getExerciseIcon, getExerciseCategoryColor } from '../utils/exercise-images';

interface PersonalRecordsPanelProps {
  userId: string;
  logs: WorkoutLog[];
}

export default function PersonalRecordsPanel({ userId, logs }: PersonalRecordsPanelProps) {
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'recent' | 'top'>('all');

  useEffect(() => {
    calculatePersonalRecords();
  }, [logs]);

  const calculatePersonalRecords = () => {
    setIsLoading(true);
    
    // חישוב שיאים אישיים מתוך רישומי האימונים
    const recordsMap = new Map<string, PersonalRecord>();
    
    logs.forEach(log => {
      const key = log.exercise;
      const existingRecord = recordsMap.get(key);
      
      // בדיקה אם זה שיא חדש (משקל גבוה יותר או אותו משקל עם יותר חזרות)
      if (!existingRecord || 
          log.weight > existingRecord.weight || 
          (log.weight === existingRecord.weight && log.reps > existingRecord.reps)) {
        
        recordsMap.set(key, {
          id: log.id,
          userId: log.userId,
          exercise: log.exercise,
          weight: log.weight,
          sets: log.sets,
          reps: log.reps,
          date: log.date,
          notes: log.notes,
          createdAt: log.date
        });
      }
    });

    const records = Array.from(recordsMap.values())
      .sort((a, b) => b.weight - a.weight);
    
    setPersonalRecords(records);
    setIsLoading(false);
  };

  const getFilteredRecords = () => {
    switch (selectedCategory) {
      case 'recent':
        return personalRecords
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 10);
      case 'top':
        return personalRecords
          .sort((a, b) => b.weight - a.weight)
          .slice(0, 10);
      default:
        return personalRecords;
    }
  };

  const filteredRecords = getFilteredRecords();

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto text-center px-2 sm:px-0">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-12 border border-white/20">
          <div className="animate-spin w-8 h-8 sm:w-12 sm:h-12 border-4 border-yellow-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white font-medium text-sm sm:text-base">מחשב שיאים אישיים...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-2 sm:px-0">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">שיאים אישיים (PR)</h2>
        <p className="text-slate-300 text-sm sm:text-base">המשקלים הגבוהים ביותר שהשגת בכל תרגיל</p>
      </div>

      {/* Category Filter */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all text-xs sm:text-sm ${
              selectedCategory === 'all'
                ? 'bg-yellow-600 text-white shadow-lg'
                : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
            }`}
          >
            🏆 כל השיאים
          </button>
          <button
            onClick={() => setSelectedCategory('recent')}
            className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all text-xs sm:text-sm ${
              selectedCategory === 'recent'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
            }`}
          >
            📅 שיאים אחרונים
          </button>
          <button
            onClick={() => setSelectedCategory('top')}
            className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all text-xs sm:text-sm ${
              selectedCategory === 'top'
                ? 'bg-red-600 text-white shadow-lg'
                : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
            }`}
          >
            🥇 טופ 10
          </button>
        </div>
      </div>

      {/* Personal Records Grid */}
      {filteredRecords.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-12 border border-white/20">
            <Trophy className="w-12 h-12 sm:w-16 sm:h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">אין שיאים עדיין</h3>
            <p className="text-slate-300 text-sm sm:text-base">התחל לרשום אימונים כדי לראות את השיאים שלך!</p>
            <div className="mt-6">
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('switchToLogTab'))}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                רשום אימון ראשון
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRecords.map((record, index) => (
            <div
              key={record.id}
              className={`bg-gradient-to-br ${getExerciseCategoryColor(record.exercise)}/20 backdrop-blur-sm rounded-xl border border-yellow-500/30 overflow-hidden hover:${getExerciseCategoryColor(record.exercise)}/30 transition-all duration-300 transform hover:scale-[1.02]`}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    <span className="text-white font-medium text-xs sm:text-sm">
                      {selectedCategory === 'top' ? `#${index + 1}` : 'שיא אישי'}
                    </span>
                  </div>
                  <Award className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-200" />
                </div>
              </div>

              {/* Content */}
              <div className="p-3 sm:p-4">
                {/* Exercise Header with Image */}
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden bg-white/20 flex items-center justify-center flex-shrink-0">
                    <img 
                      src={getExerciseImage(record.exercise)} 
                      alt={record.exercise}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling!.classList.remove('hidden');
                      }}
                    />
                    <div className="text-lg sm:text-xl hidden">
                      {getExerciseIcon(record.exercise)}
                    </div>
                  </div>
                  <h3 className="font-bold text-white text-base sm:text-lg flex-1 line-clamp-2">
                    {record.exercise}
                  </h3>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="text-center">
                    <div className="bg-yellow-600/20 rounded-lg p-2 mb-1">
                      <span className="text-yellow-400 font-bold text-lg sm:text-xl">
                        {record.weight}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs">ק"ג</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-blue-600/20 rounded-lg p-2 mb-1">
                      <span className="text-blue-400 font-bold text-lg sm:text-xl">
                        {record.sets}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs">סטים</p>
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-green-600/20 rounded-lg p-2 mb-1">
                      <span className="text-green-400 font-bold text-lg sm:text-xl">
                        {record.reps}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs">חזרות</p>
                  </div>
                </div>

                {/* Total Volume */}
                <div className="bg-white/5 rounded-lg p-2 sm:p-3 border border-white/10 mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 text-xs sm:text-sm">נפח כולל:</span>
                    <span className="text-white font-semibold text-sm sm:text-base">
                      {(record.weight * record.sets * record.reps).toLocaleString()} ק"ג
                    </span>
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span className="text-slate-400">
                      {new Date(record.date).toLocaleDateString('he-IL')}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="w-3 h-3 text-yellow-400" />
                    <span className="text-yellow-400 font-medium">PR</span>
                  </div>
                </div>

                {/* Notes */}
                {record.notes && (
                  <div className="mt-3 bg-white/5 rounded-lg p-2 border border-white/10">
                    <p className="text-slate-300 text-xs italic line-clamp-2">
                      {record.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20">
        <h3 className="flex items-center text-white font-semibold text-base sm:text-lg mb-4">
          <Award className="w-5 h-5 mr-2" />
          סיכום שיאים
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl sm:text-3xl font-bold text-yellow-400">
              {personalRecords.length}
            </p>
            <p className="text-slate-400 text-xs sm:text-sm">תרגילים עם שיאים</p>
          </div>
          <div className="text-center">
            <p className="text-2xl sm:text-3xl font-bold text-green-400">
              {personalRecords.length > 0 ? Math.max(...personalRecords.map(r => r.weight)) : 0}
            </p>
            <p className="text-slate-400 text-xs sm:text-sm">שיא משקל (ק"ג)</p>
          </div>
          <div className="text-center">
            <p className="text-2xl sm:text-3xl font-bold text-blue-400">
              {personalRecords.reduce((sum, r) => sum + (r.weight * r.sets * r.reps), 0).toLocaleString()}
            </p>
            <p className="text-slate-400 text-xs sm:text-sm">נפח שיאים (ק"ג)</p>
          </div>
          <div className="text-center">
            <p className="text-2xl sm:text-3xl font-bold text-purple-400">
              {personalRecords.filter(r => {
                const recordDate = new Date(r.date);
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                return recordDate >= thirtyDaysAgo;
              }).length}
            </p>
            <p className="text-slate-400 text-xs sm:text-sm">שיאים ב-30 יום</p>
          </div>
        </div>
      </div>
    </div>
  );
}