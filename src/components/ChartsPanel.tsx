import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, BarChart3, Target, Calendar, Dumbbell } from 'lucide-react';
import { WorkoutLog, User } from '../types';

interface ChartsPanelProps {
  user: User;
  logs: WorkoutLog[];
}

export default function ChartsPanel({ user, logs }: ChartsPanelProps) {
  const chartData = useMemo(() => {
    if (logs.length === 0) return null;

    // Progress over time (last 30 days)
    const last30Days = logs
      .filter(log => {
        const logDate = new Date(log.date);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return logDate >= thirtyDaysAgo;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Group by date and calculate total volume
    const dailyVolume = last30Days.reduce((acc, log) => {
      const date = log.date;
      const volume = log.weight * log.sets * log.reps;
      acc[date] = (acc[date] || 0) + volume;
      return acc;
    }, {} as Record<string, number>);

    const progressData = Object.entries(dailyVolume).map(([date, volume]) => ({
      date: new Date(date).toLocaleDateString('he-IL', { month: 'short', day: 'numeric' }),
      volume: Math.round(volume),
      workouts: last30Days.filter(log => log.date === date).length
    }));

    // Exercise frequency
    const exerciseFreq = logs.reduce((acc, log) => {
      acc[log.exercise] = (acc[log.exercise] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const exerciseData = Object.entries(exerciseFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8)
      .map(([exercise, count]) => ({
        exercise: exercise.length > 12 ? exercise.substring(0, 12) + '...' : exercise,
        count
      }));

    // Weight progression for top exercises
    const topExercises = Object.entries(exerciseFreq)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([exercise]) => exercise);

    const weightProgression = topExercises.map(exercise => {
      const exerciseLogs = logs
        .filter(log => log.exercise === exercise)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(-10); // Last 10 sessions

      return {
        exercise,
        data: exerciseLogs.map((log, index) => ({
          session: `${index + 1}`,
          weight: log.weight,
          date: new Date(log.date).toLocaleDateString('he-IL', { month: 'short', day: 'numeric' })
        }))
      };
    });

    // Monthly stats
    const monthlyStats = logs.reduce((acc, log) => {
      const month = new Date(log.date).toLocaleDateString('he-IL', { year: 'numeric', month: 'short' });
      if (!acc[month]) {
        acc[month] = { workouts: 0, volume: 0 };
      }
      acc[month].workouts += 1;
      acc[month].volume += log.weight * log.sets * log.reps;
      return acc;
    }, {} as Record<string, { workouts: number; volume: number }>);

    const monthlyData = Object.entries(monthlyStats)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .slice(-6)
      .map(([month, stats]) => ({
        month,
        workouts: stats.workouts,
        volume: Math.round(stats.volume)
      }));

    return {
      progressData,
      exerciseData,
      weightProgression,
      monthlyData
    };
  }, [logs]);

  if (!chartData) {
    return (
      <div className="max-w-4xl mx-auto text-center px-2 sm:px-0">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-12 border border-white/20">
          <BarChart3 className="w-12 h-12 sm:w-16 sm:h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">No data for charts</h3>
          <p className="text-slate-300 text-sm sm:text-base">Start logging workouts to see your progress!</p>
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

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316'];

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 px-2 sm:px-0">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Progress Charts</h2>
        <p className="text-slate-300 text-sm sm:text-base">Visual tracking of your performance</p>
      </div>

      {/* Progress Over Time */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20">
        <h3 className="flex items-center text-white font-semibold text-base sm:text-lg mb-4">
          <TrendingUp className="w-5 h-5 mr-2" />
          Daily Workout Volume (Last 30 Days)
        </h3>
        <div className="h-64 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData.progressData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9CA3AF" 
                fontSize={12}
                tick={{ fill: '#9CA3AF' }}
              />
              <YAxis 
                stroke="#9CA3AF" 
                fontSize={12}
                tick={{ fill: '#9CA3AF' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
                labelStyle={{ color: '#F9FAFB' }}
              />
              <Line 
                type="monotone" 
                dataKey="volume" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Exercise Frequency & Monthly Stats */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Exercise Frequency */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20">
          <h3 className="flex items-center text-white font-semibold text-base sm:text-lg mb-4">
            <Dumbbell className="w-5 h-5 mr-2" />
            Exercise Frequency
          </h3>
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.exerciseData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  type="number" 
                  stroke="#9CA3AF" 
                  fontSize={12}
                  tick={{ fill: '#9CA3AF' }}
                />
                <YAxis 
                  type="category" 
                  dataKey="exercise" 
                  stroke="#9CA3AF" 
                  fontSize={10}
                  tick={{ fill: '#9CA3AF' }}
                  width={80}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                />
                <Bar dataKey="count" fill="#10B981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Stats */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20">
          <h3 className="flex items-center text-white font-semibold text-base sm:text-lg mb-4">
            <Calendar className="w-5 h-5 mr-2" />
            Monthly Statistics
          </h3>
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="month" 
                  stroke="#9CA3AF" 
                  fontSize={12}
                  tick={{ fill: '#9CA3AF' }}
                />
                <YAxis 
                  stroke="#9CA3AF" 
                  fontSize={12}
                  tick={{ fill: '#9CA3AF' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                />
                <Bar dataKey="workouts" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Weight Progression */}
      {chartData.weightProgression.length > 0 && (
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20">
          <h3 className="flex items-center text-white font-semibold text-base sm:text-lg mb-4">
            <Target className="w-5 h-5 mr-2" />
            Weight Progression - Top Exercises
          </h3>
          <div className="grid gap-6 lg:grid-cols-3">
            {chartData.weightProgression.map((exercise, index) => (
              <div key={exercise.exercise} className="bg-white/5 rounded-xl p-4 border border-white/10">
                <h4 className="text-white font-medium mb-3 text-center text-sm sm:text-base">
                  {exercise.exercise}
                </h4>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={exercise.data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="session" 
                        stroke="#9CA3AF" 
                        fontSize={10}
                        tick={{ fill: '#9CA3AF' }}
                      />
                      <YAxis 
                        stroke="#9CA3AF" 
                        fontSize={10}
                        tick={{ fill: '#9CA3AF' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }}
                        formatter={(value: any) => [`${value} kg`, 'Weight']}
                        labelFormatter={(label: any) => `Session ${label}`}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="weight" 
                        stroke={COLORS[index % COLORS.length]} 
                        strokeWidth={2}
                        dot={{ fill: COLORS[index % COLORS.length], strokeWidth: 2, r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}