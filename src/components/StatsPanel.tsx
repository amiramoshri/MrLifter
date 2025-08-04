import React, { useMemo } from 'react';
import { TrendingUp, Calendar, Target, Award, BarChart3, User, Dumbbell } from 'lucide-react';
import { User as UserType, WorkoutLog } from '../types';
import { getBMICategory } from '../utils/calculations';
import { getExerciseIcon } from '../utils/exercise-images';

interface StatsPanelProps {
  user: UserType;
  logs: WorkoutLog[];
}

export default function StatsPanel({ user, logs }: StatsPanelProps) {
  const stats = useMemo(() => {
    if (logs.length === 0) return null;

    const totalWorkouts = logs.length;
    const totalWeight = logs.reduce((sum, log) => sum + (log.weight * log.sets * log.reps), 0);
    const uniqueExercises = new Set(logs.map(log => log.exercise)).size;
    
    const exerciseFrequency = logs.reduce((acc, log) => {
      acc[log.exercise] = (acc[log.exercise] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const favoriteExercise = Object.entries(exerciseFrequency)
      .sort(([,a], [,b]) => b - a)[0];

    const recentWorkouts = logs
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 7);

    const personalBests = logs.reduce((acc, log) => {
      const key = log.exercise;
      if (!acc[key] || log.weight > acc[key].weight) {
        acc[key] = log;
      }
      return acc;
    }, {} as Record<string, WorkoutLog>);

    return {
      totalWorkouts,
      totalWeight: Math.round(totalWeight),
      uniqueExercises,
      favoriteExercise,
      recentWorkouts,
      personalBests: Object.values(personalBests).sort((a, b) => b.weight - a.weight).slice(0, 5)
    };
  }, [logs]);

  const bmiInfo = getBMICategory(user.bmi);

  if (!stats) {
    return (
      <div className="max-w-4xl mx-auto text-center px-2 sm:px-0">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-12 border border-white/20">
          <BarChart3 className="w-12 h-12 sm:w-16 sm:h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">No Stats Available Yet</h3>
          <p className="text-slate-300 text-sm sm:text-base">Start logging workouts to see your progress statistics!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 px-2 sm:px-0">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Your Fitness Journey</h2>
        <p className="text-slate-300 text-sm sm:text-base">Track your progress and celebrate achievements</p>
      </div>

      {/* User Profile Stats */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20">
        <h3 className="flex items-center text-white font-semibold text-base sm:text-lg mb-4">
          <User className="w-5 h-5 mr-2" />
          Profile Overview
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="text-center">
            <p className="text-lg sm:text-2xl font-bold text-blue-400">{user.weight} kg</p>
            <p className="text-slate-400 text-xs sm:text-sm">Weight</p>
          </div>
          <div className="text-center">
            <p className="text-lg sm:text-2xl font-bold text-green-400">{user.height} cm</p>
            <p className="text-slate-400 text-xs sm:text-sm">Height</p>
          </div>
          <div className="text-center">
            <p className={`text-lg sm:text-2xl font-bold ${bmiInfo.color.replace('text-', 'text-')}`}>{user.bmi}</p>
            <p className="text-slate-400 text-xs sm:text-sm">BMI</p>
          </div>
          <div className="text-center">
            <p className="text-lg sm:text-2xl font-bold text-purple-400">{user.age || 'N/A'}</p>
            <p className="text-slate-400 text-xs sm:text-sm">Age</p>
          </div>
        </div>
      </div>

      {/* Workout Stats */}
      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-xs sm:text-sm">Total Workouts</p>
              <p className="text-2xl sm:text-3xl font-bold">{stats.totalWorkouts}</p>
            </div>
            <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-xs sm:text-sm">Total Volume</p>
              <p className="text-2xl sm:text-3xl font-bold">{stats.totalWeight.toLocaleString()}</p>
              <p className="text-green-200 text-xs">kg lifted</p>
            </div>
            <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-xs sm:text-sm">Exercises</p>
              <p className="text-2xl sm:text-3xl font-bold">{stats.uniqueExercises}</p>
              <p className="text-purple-200 text-xs">different</p>
            </div>
            <Target className="w-6 h-6 sm:w-8 sm:h-8 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-xs sm:text-sm">Favorite</p>
              <p className="text-base sm:text-lg font-bold truncate">{stats.favoriteExercise[0]}</p>
              <p className="text-orange-200 text-xs">{stats.favoriteExercise[1]} times</p>
            </div>
            <Award className="w-6 h-6 sm:w-8 sm:h-8 text-orange-200" />
          </div>
        </div>
      </div>

      {/* Personal Bests */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20">
        <h3 className="flex items-center text-white font-semibold text-base sm:text-lg mb-4">
          <Award className="w-5 h-5 mr-2" />
          Personal Bests
        </h3>
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.personalBests.map((pb, index) => (
            <div
              key={pb.id}
              className="bg-gradient-to-r from-yellow-600 to-yellow-700 rounded-lg p-3 sm:p-4 text-white"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold truncate text-sm sm:text-base">{pb.exercise}</h4>
                <span className="text-yellow-200 font-bold text-xs sm:text-sm">#{index + 1}</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <p className="text-lg sm:text-2xl font-bold">{pb.weight}</p>
                  <p className="text-yellow-200 text-xs">kg</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-sm sm:text-base">{pb.sets}×{pb.reps}</p>
                  <p className="text-yellow-200 text-xs">sets×reps</p>
                </div>
              </div>
              <p className="text-yellow-200 text-xs mt-2">
                {new Date(pb.date).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20">
        <h3 className="flex items-center text-white font-semibold text-base sm:text-lg mb-4">
          <Calendar className="w-5 h-5 mr-2" />
          פעילות אחרונה
        </h3>
        <div className="space-y-3">
          {stats.recentWorkouts.map((log) => (
            <div
              key={log.id}
              className="flex items-center justify-between bg-white/5 rounded-lg p-3 sm:p-4 border border-white/10"
            >
              <div className="flex items-center space-x-3">
                <div className="text-sm sm:text-base">
                  {getExerciseIcon(log.exercise)}
                </div>
                <div>
                  <p className="text-white font-medium text-sm sm:text-base">{log.exercise}</p>
                  <p className="text-slate-400 text-xs sm:text-sm">
                    {new Date(log.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-semibold text-sm sm:text-base">{log.weight} kg</p>
                <p className="text-slate-400 text-xs sm:text-sm">{log.sets}×{log.reps}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}