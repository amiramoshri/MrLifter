import React, { useState } from 'react';
import { Calendar, Dumbbell, Hash, RotateCcw, StickyNote, Filter, Weight } from 'lucide-react';
import { WorkoutLog } from '../types';
import { getExerciseImage, getExerciseIcon, getExerciseCategoryColor } from '../utils/exercise-images';

interface LogHistoryProps {
  logs: WorkoutLog[];
}

export default function LogHistory({ logs }: LogHistoryProps) {
  const [filterExercise, setFilterExercise] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'exercise' | 'weight'>('date');

  const uniqueExercises = [...new Set(logs.map(log => log.exercise))].sort();

  const filteredLogs = logs
    .filter(log => !filterExercise || log.exercise.toLowerCase().includes(filterExercise.toLowerCase()))
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'exercise':
          return a.exercise.localeCompare(b.exercise);
        case 'weight':
          return b.weight - a.weight;
        default:
          return 0;
      }
    });

  // חישוב נפח כולל לכל אימון
  const calculateWorkoutVolume = (log: WorkoutLog) => {
    return log.weight * log.sets * log.reps;
  };

  // קיבוץ אימונים לפי תאריך
  const groupedLogs = filteredLogs.reduce((acc, log) => {
    const date = log.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(log);
    return acc;
  }, {} as Record<string, WorkoutLog[]>);
  if (logs.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center px-2 sm:px-0">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-12 border border-white/20">
          <Dumbbell className="w-12 h-12 sm:w-16 sm:h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">No workouts logged yet</h3>
          <p className="text-slate-300 text-sm sm:text-base">Start logging workouts to track your progress!</p>
          <div className="mt-6">
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('switchToLogTab'))}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              Log First Workout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-2 sm:px-0">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Workout History</h2>
        <p className="text-slate-300 text-sm sm:text-base">{logs.length} workouts logged</p>
      </div>

      {/* Filters */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-300" />
            <input
              type="text"
              placeholder="Filter by exercise..."
              className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base w-full sm:w-auto"
              value={filterExercise}
              onChange={(e) => setFilterExercise(e.target.value)}
            />
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-300 text-xs sm:text-sm">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            >
              <option value="date">Date</option>
              <option value="exercise">Exercise</option>
              <option value="weight">Weight</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grouped Logs by Date */}
      <div className="space-y-6">
        {Object.entries(groupedLogs)
          .sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
          .map(([date, dayLogs]) => {
            const totalVolume = dayLogs.reduce((sum, log) => sum + calculateWorkoutVolume(log), 0);
            const totalExercises = dayLogs.length;
            
            return (
              <div key={date} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20">
                {/* Date Header */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/20">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    <h3 className="text-lg sm:text-xl font-bold text-white">
                      {new Date(date).toLocaleDateString('he-IL', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </h3>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <p className="text-xs text-slate-400">Exercises</p>
                      <p className="text-sm font-semibold text-blue-400">{totalExercises}</p>
                      <p className="text-slate-400 text-xs">sets</p>
                    <div className="text-center">
                      <p className="text-xs text-slate-400">Total Volume</p>
                      <p className="text-sm font-semibold text-green-400">
                        {totalVolume >= 1000 
                          ? `${(totalVolume / 1000).toFixed(1)} tons`
                          : `${totalVolume.toLocaleString()} kg`
                        }
                      <p className="text-slate-400 text-xs">reps</p>
                    </div>
                  </div>
                </div>

                {/* Exercises Grid */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {dayLogs.map((log) => (
                    <div
                      key={log.id}
                      className={`bg-gradient-to-br ${getExerciseCategoryColor(log.exercise)}/20 rounded-xl p-3 sm:p-4 border border-white/10 hover:bg-white/10 transition-all duration-300`}
                    >
                      {/* Exercise Header with Image */}
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg overflow-hidden bg-white/20 flex items-center justify-center flex-shrink-0">
                          <img 
                            src={getExerciseImage(log.exercise)} 
                            alt={log.exercise}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling!.classList.remove('hidden');
                            }}
                          />
                          <div className="text-sm sm:text-base hidden">
                            {getExerciseIcon(log.exercise)}
                          </div>
                        </div>
                        <h4 className="font-semibold text-white text-sm sm:text-base flex-1">
                          {log.exercise}
                        </h4>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            <Weight className="w-3 h-3 text-green-400" />
                          </div>
                          <p className="text-green-400 font-semibold text-sm sm:text-base">{log.weight}</p>
                          <p className="text-slate-400 text-xs">ק"ג</p>
                        </div>
                        
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            <Hash className="w-3 h-3 text-blue-400" />
                          </div>
                          <p className="text-blue-400 font-semibold text-sm sm:text-base">{log.sets}</p>
                          <p className="text-slate-400 text-xs">סטים</p>
                        </div>
                        
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            <RotateCcw className="w-3 h-3 text-purple-400" />
                          </div>
                          <p className="text-purple-400 font-semibold text-sm sm:text-base">{log.reps}</p>
                          <p className="text-slate-400 text-xs">חזרות</p>
                        </div>
                      </div>

                      {/* Exercise Volume */}
                      <div className="bg-white/5 rounded-lg p-2 border border-white/10 mb-2">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 text-xs">Volume:</span>
                          <span className="text-white font-medium text-xs">
                            {calculateWorkoutVolume(log).toLocaleString()} kg
                          </span>
                        </div>
                      </div>
                      {log.notes && (
                        <div className="bg-white/5 rounded-lg p-2 border border-white/10">
                          <div className="flex items-center space-x-2 mb-1">
                            <StickyNote className="w-2 h-2 sm:w-3 sm:h-3 text-yellow-400" />
                            <span className="text-yellow-400 text-xs font-medium">Notes</span>
                          </div>
                          <p className="text-slate-300 text-xs italic">{log.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
      </div>
      {filteredLogs.length === 0 && logs.length > 0 && (
        <div className="text-center py-12">
          <p className="text-slate-400 text-sm sm:text-base">No workouts match your filter criteria.</p>
        </div>
      )}
    </div>
  );
}