import React, { useState } from 'react';
import { Calendar, Dumbbell, Hash, RotateCcw, StickyNote, Filter } from 'lucide-react';
import { WorkoutLog } from '../types';

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

  if (logs.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center px-2 sm:px-0">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-12 border border-white/20">
          <Dumbbell className="w-12 h-12 sm:w-16 sm:h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">No Workouts Logged Yet</h3>
          <p className="text-slate-300 text-sm sm:text-base">Start logging your workouts to track your progress!</p>
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

      {/* Logs Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredLogs.map((log) => (
          <div
            key={log.id}
            className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:scale-[1.02]"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                <span className="text-slate-300 text-xs sm:text-sm">
                  {new Date(log.date).toLocaleDateString()}
                </span>
              </div>
            </div>

            <h3 className="font-bold text-white text-base sm:text-lg mb-3">{log.exercise}</h3>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <span className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-center font-bold text-xs text-green-400">kg</span>
                </div>
                <p className="text-green-400 font-semibold text-base sm:text-lg">{log.weight}</p>
                <p className="text-slate-400 text-xs">Weight</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Hash className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                </div>
                <p className="text-blue-400 font-semibold text-base sm:text-lg">{log.sets}</p>
                <p className="text-slate-400 text-xs">Sets</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
                </div>
                <p className="text-purple-400 font-semibold text-base sm:text-lg">{log.reps}</p>
                <p className="text-slate-400 text-xs">Reps</p>
              </div>
            </div>

            {log.notes && (
              <div className="bg-white/5 rounded-lg p-2 sm:p-3 border border-white/10">
                <div className="flex items-center space-x-2 mb-2">
                  <StickyNote className="w-2 h-2 sm:w-3 sm:h-3 text-yellow-400" />
                  <span className="text-yellow-400 text-xs font-medium">Notes</span>
                </div>
                <p className="text-slate-300 text-xs sm:text-sm italic">{log.notes}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredLogs.length === 0 && logs.length > 0 && (
        <div className="text-center py-12">
          <p className="text-slate-400 text-sm sm:text-base">No workouts match your filter criteria.</p>
        </div>
      )}
    </div>
  );
}