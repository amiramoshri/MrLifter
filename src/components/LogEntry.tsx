import React, { useState } from 'react';
import { Plus, Dumbbell, Hash, RotateCcw, StickyNote, Activity, CheckCircle } from 'lucide-react';
import { WorkoutLog } from '../types';
import { getExerciseImage, getExerciseIcon, getExerciseCategoryColor } from '../utils/exercise-images';

interface LogEntryProps {
  onSubmit: (log: Omit<WorkoutLog, 'id' | 'userId'>) => void;
  selectedExercise?: { name: string; sets: number; reps: string; weight?: string } | null;
  onExerciseUsed?: () => void;
}

export default function LogEntry({ onSubmit, selectedExercise, onExerciseUsed }: LogEntryProps) {
  const [activeWorkout, setActiveWorkout] = useState<'A' | 'B'>('A');
  const [formData, setFormData] = useState({
    exercise: 'Bench Press',
    weight: '',
    sets: '',
    reps: '',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Auto-populate form when exercise is selected from program
  React.useEffect(() => {
    if (selectedExercise) {
      setFormData(prev => ({
        ...prev,
        exercise: selectedExercise.name,
        sets: selectedExercise.sets.toString(),
        reps: selectedExercise.reps,
        weight: selectedExercise.weight?.replace(/[^0-9.]/g, '') || prev.weight
      }));
    }
  }, [selectedExercise]);

  // Handle swipe gestures for workout type switching on mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && activeWorkout === 'A') {
      setActiveWorkout('B');
    }
    if (isRightSwipe && activeWorkout === 'B') {
      setActiveWorkout('A');
    }
  };

  const handleUseSelectedExercise = () => {
    if (selectedExercise && onExerciseUsed) {
      onExerciseUsed();
    }
  };

  const exerciseOptions = [
    'Bench Press',
    'Deadlift',
    'Squats',
    'Pull-up',
    'Push-up'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.exercise || !formData.weight || !formData.sets || !formData.reps) {
      return;
    }

    setIsSubmitting(true);

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 500));

    onSubmit({
      date: new Date().toISOString().slice(0, 10),
      exercise: formData.exercise,
      weight: parseFloat(formData.weight),
      sets: parseInt(formData.sets),
      reps: parseInt(formData.reps),
      notes: formData.notes ? `${activeWorkout}: ${formData.notes}` : `Workout ${activeWorkout}`
    });

    // Reset form
    setFormData({
      exercise: '',
      weight: '',
      sets: '',
      reps: '',
      notes: ''
    });

    setIsSubmitting(false);
  };

  const isFormValid = formData.exercise && formData.weight && formData.sets && formData.reps;

  return (
    <div className="max-w-2xl mx-auto px-2 sm:px-0">
      <div className="text-center mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Log Your Workout</h2>
        <p className="text-slate-300 text-sm sm:text-base">Track your progress and stay motivated</p>
      </div>

      {/* Selected Exercise Banner */}
      {selectedExercise && (
        <div className="mb-6">
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-3 sm:p-4 border border-green-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                <div>
                  <p className="text-white font-semibold text-sm sm:text-base">Exercise Selected from Program</p>
                  <p className="text-green-100 text-xs sm:text-sm">
                    {selectedExercise.name} - {selectedExercise.sets} sets × {selectedExercise.reps}
                    {selectedExercise.weight && ` @ ${selectedExercise.weight}`}
                  </p>
                </div>
              </div>
              <button
                onClick={handleUseSelectedExercise}
                className="bg-white/20 hover:bg-white/30 text-white px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Workout Type Tabs */}
      <div className="mb-6">
        <div 
          className="bg-white/10 backdrop-blur-sm rounded-xl p-1 sm:p-2 border border-white/20"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="flex space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveWorkout('A')}
              className={`flex items-center space-x-1 sm:space-x-2 px-3 sm:px-6 py-3 sm:py-4 rounded-lg font-medium transition-all flex-1 justify-center text-sm sm:text-base touch-manipulation ${
                activeWorkout === 'A'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white active:bg-white/20'
              }`}
            >
              <Activity className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Workout A</span>
            </button>
            <button
              onClick={() => setActiveWorkout('B')}
              className={`flex items-center space-x-1 sm:space-x-2 px-3 sm:px-6 py-3 sm:py-4 rounded-lg font-medium transition-all flex-1 justify-center text-sm sm:text-base touch-manipulation ${
                activeWorkout === 'B'
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white active:bg-white/20'
              }`}
            >
              <Activity className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Workout B</span>
            </button>
          </div>
        </div>
        
        {/* Swipe hint for mobile */}
        <div className="mt-2 text-center sm:hidden">
          <p className="text-slate-400 text-xs">👈 Swipe to switch workouts 👉</p>
        </div>
      </div>
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-8 border border-white/20">
        <div className="mb-6">
          <div className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
            activeWorkout === 'A' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
          }`}>
            Currently logging: Workout {activeWorkout}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
            <div className="md:col-span-2">
              <label className="flex items-center text-slate-300 font-medium mb-2 sm:mb-3 text-sm sm:text-base">
                <Dumbbell className="w-4 h-4 mr-2" />
                Exercise Name
              </label>
              <div className="space-y-3">
                <select
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
                  value={formData.exercise}
                  onChange={(e) => setFormData({ ...formData, exercise: e.target.value })}
                >
                  {exerciseOptions.map((exercise) => (
                    <option key={exercise} value={exercise} className="bg-slate-700 text-white">
                      {getExerciseIcon(exercise)} {exercise}
                    </option>
                  ))}
                </select>
                
                {/* Exercise Visual Preview */}
                {formData.exercise && (
                  <div className={`bg-gradient-to-r ${getExerciseCategoryColor(formData.exercise)} rounded-xl p-3 sm:p-4`}>
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-white/20 flex items-center justify-center">
                        <img 
                          src={getExerciseImage(formData.exercise)} 
                          alt={formData.exercise}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling!.classList.remove('hidden');
                          }}
                        />
                        <div className="text-2xl sm:text-3xl hidden">
                          {getExerciseIcon(formData.exercise)}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-semibold text-sm sm:text-base">
                          {getExerciseIcon(formData.exercise)} {formData.exercise}
                        </h4>
                        <p className="text-white/80 text-xs sm:text-sm">
                          תרגיל נבחר - מוכן לרישום
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="flex items-center text-slate-300 font-medium mb-2 sm:mb-3 text-sm sm:text-base">
                <span className="w-4 h-4 mr-2 text-center font-bold text-xs">kg</span>
                Weight (kg)
              </label>
              <input
                type="number"
                step="0.5"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base touch-manipulation"
                placeholder="80"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              />
            </div>

            <div>
              <label className="flex items-center text-slate-300 font-medium mb-2 sm:mb-3 text-sm sm:text-base">
                <Hash className="w-4 h-4 mr-2" />
                Sets
              </label>
              <input
                type="number"
                min="1"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base touch-manipulation"
                placeholder="3"
                value={formData.sets}
                onChange={(e) => setFormData({ ...formData, sets: e.target.value })}
              />
            </div>

            <div>
              <label className="flex items-center text-slate-300 font-medium mb-2 sm:mb-3 text-sm sm:text-base">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reps
              </label>
              <input
                type="number"
                min="1"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base touch-manipulation"
                placeholder="10"
                value={formData.reps}
                onChange={(e) => setFormData({ ...formData, reps: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center text-slate-300 font-medium mb-2 sm:mb-3 text-sm sm:text-base">
                <StickyNote className="w-4 h-4 mr-2" />
                Notes (optional)
              </label>
              <textarea
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-sm sm:text-base touch-manipulation"
                placeholder="How did it feel? Any observations..."
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className={`w-full text-white py-4 sm:py-5 px-4 sm:px-6 rounded-xl font-semibold focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base touch-manipulation ${
              activeWorkout === 'A' 
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:ring-blue-200'
                : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:ring-green-200'
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                רושם אימון {activeWorkout}...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                הוסף אימון {activeWorkout} ליומן
              </div>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}