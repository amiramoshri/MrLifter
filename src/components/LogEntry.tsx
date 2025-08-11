import React, { useState } from 'react';
import { Plus, Dumbbell, Hash, RotateCcw, StickyNote, Activity, CheckCircle, Minus } from 'lucide-react';
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
    sets: [{ reps: '', completed: false }],
    notes: '',
    difficulty: 3
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
        sets: Array.from({ length: selectedExercise.sets }, () => ({ 
          reps: selectedExercise.reps, 
          completed: false 
        })),
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
    'Select exercise...',
    'Bench Press',
    'Incline Bench Press',
    'Dumbbell Press',
    'Push-ups',
    'Dips',
    'Deadlift',
    'Romanian Deadlift',
    'Barbell Rows',
    'Pull-ups',
    'Lat Pulldown',
    'Squats',
    'Front Squats',
    'Leg Press',
    'Lunges',
    'Bulgarian Split Squats',
    'Overhead Press',
    'Lateral Raises',
    'Face Pulls',
    'Barbell Curls',
    'Hammer Curls',
    'Close-Grip Bench Press',
    'Tricep Dips',
    'Plank',
    'Russian Twists',
    'Mountain Climbers',
    'Burpees',
    'Kettlebell Swings'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.exercise || formData.exercise === 'Select exercise...' || !formData.weight || formData.sets.length === 0 || formData.sets.some(set => !set.reps)) {
      return;
    }

    setIsSubmitting(true);

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 500));

    // Calculate total reps and average for display
    const totalReps = formData.sets.reduce((sum, set) => sum + parseInt(set.reps), 0);
    const avgReps = Math.round(totalReps / formData.sets.length);
    const repsDisplay = formData.sets.map(set => set.reps).join(', ');
    onSubmit({
      date: new Date().toISOString().slice(0, 10),
      exercise: formData.exercise,
      weight: parseFloat(formData.weight),
      sets: formData.sets.length,
      reps: avgReps,
      notes: formData.notes ? `${activeWorkout}: ${formData.notes} | Reps: ${repsDisplay} | Difficulty: ${getDifficultyText(formData.difficulty)}` : `Power ${activeWorkout} | Reps: ${repsDisplay} | Difficulty: ${getDifficultyText(formData.difficulty)}`
    });

    // Reset form
    setFormData({
      exercise: 'Select exercise...',
      weight: '',
      sets: [{ reps: '', completed: false }],
      notes: '',
      difficulty: 3
    });

    setIsSubmitting(false);
  };

  const isFormValid = formData.exercise && formData.exercise !== 'Select exercise...' && formData.weight && formData.sets.length > 0 && formData.sets.every(set => set.reps);

  const difficultyFaces = [
    { value: 1, emoji: '😊', label: 'Very Easy', color: 'text-green-500' },
    { value: 2, emoji: '🙂', label: 'Easy', color: 'text-green-400' },
    { value: 3, emoji: '😐', label: 'Moderate', color: 'text-yellow-500' },
    { value: 4, emoji: '😓', label: 'Hard', color: 'text-orange-500' },
    { value: 5, emoji: '😵', label: 'Very Hard', color: 'text-red-500' }
  ];

  const getDifficultyText = (difficulty: number) => {
    const face = difficultyFaces.find(f => f.value === difficulty);
    return face ? `${face.emoji} ${face.label}` : '';
  };

  const addSet = () => {
    setFormData(prev => ({
      ...prev,
      sets: [...prev.sets, { reps: '', completed: false }]
    }));
  };

  const removeSet = (index: number) => {
    if (formData.sets.length > 1) {
      setFormData(prev => ({
        ...prev,
        sets: prev.sets.filter((_, i) => i !== index)
      }));
    }
  };

  const updateSetReps = (index: number, reps: string) => {
    setFormData(prev => ({
      ...prev,
      sets: prev.sets.map((set, i) => 
        i === index ? { ...set, reps } : set
      )
    }));
  };

  const toggleSetCompleted = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sets: prev.sets.map((set, i) => 
        i === index ? { ...set, completed: !set.completed } : set
      )
    }));
  };
  return (
    <div className="max-w-2xl mx-auto px-2 sm:px-0">
      <div className="text-center mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Log Workout</h2>
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
                  <p className="text-white font-semibold text-sm sm:text-base">Exercise selected from program</p>
                  <p className="text-green-100 text-xs sm:text-sm">
                    {selectedExercise.name} - {selectedExercise.sets} sets × {selectedExercise.reps} reps
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
              <span>Power A</span>
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
              <span>Power B</span>
            </button>
          </div>
        </div>
        
        {/* Swipe hint for mobile */}
        <div className="mt-2 text-center sm:hidden">
          <p className="text-slate-400 text-xs">👈 Swipe to switch powers 👉</p>
        </div>
      </div>
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-8 border border-white/20">
        <div className="mb-6">
          <div className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
            activeWorkout === 'A' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
          }`}>
            Currently logging: Power {activeWorkout}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
            <div className="md:col-span-2">
              <label className="flex items-center text-slate-300 font-medium mb-2 sm:mb-3 text-sm sm:text-base">
                <Dumbbell className="w-4 h-4 mr-2" />
                Exercise Name <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="space-y-3">
                <select
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
                  value={formData.exercise}
                  onChange={(e) => setFormData({ ...formData, exercise: e.target.value })}
                >
                  {exerciseOptions.map((exercise) => (
                    <option key={exercise} value={exercise} className="bg-slate-700 text-white">
                      {exercise === 'Select exercise...' ? exercise : `${getExerciseIcon(exercise)} ${exercise}`}
                    </option>
                  ))}
                </select>
                
                {/* Exercise Visual Preview */}
                {formData.exercise && formData.exercise !== 'Select exercise...' && (
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
                          Exercise selected - ready to log
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
                Weight (kg) <span className="text-red-500 ml-1">*</span>
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

            {/* Sets and Reps Section */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center text-slate-300 font-medium text-sm sm:text-base">
                  <Hash className="w-4 h-4 mr-2" />
                  Sets & Reps <span className="text-red-500 ml-1">*</span>
                </label>
                <button
                  type="button"
                  onClick={addSet}
                  className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Set</span>
                </button>
              </div>
              
              <div className="space-y-3">
                {formData.sets.map((set, index) => (
                  <div key={index} className={`flex items-center space-x-3 p-3 rounded-lg border transition-all ${
                    set.completed 
                      ? 'bg-green-600/20 border-green-500/50' 
                      : 'bg-slate-700/50 border-slate-600'
                  }`}>
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-300 font-medium text-sm">
                        Set {index + 1}:
                      </span>
                      <input
                        type="number"
                        min="1"
                        className="w-16 sm:w-20 px-2 py-1 bg-slate-600 border border-slate-500 rounded text-white text-center text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="10"
                        value={set.reps}
                        onChange={(e) => updateSetReps(index, e.target.value)}
                      />
                      <span className="text-slate-400 text-sm">reps</span>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-auto">
                      <button
                        type="button"
                        onClick={() => toggleSetCompleted(index)}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                          set.completed
                            ? 'bg-green-600 text-white'
                            : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                        }`}
                      >
                        {set.completed ? '✓ Done' : 'Mark Done'}
                      </button>
                      
                      {formData.sets.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSet(index)}
                          className="p-1 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {formData.sets.length > 0 && (
                <div className="mt-3 p-2 bg-slate-700/30 rounded-lg">
                  <p className="text-slate-300 text-xs">
                    Total: {formData.sets.length} sets, {formData.sets.reduce((sum, set) => sum + (parseInt(set.reps) || 0), 0)} reps
                    {formData.sets.filter(set => set.completed).length > 0 && (
                      <span className="text-green-400 ml-2">
                        ({formData.sets.filter(set => set.completed).length} completed)
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center text-slate-300 font-medium mb-2 sm:mb-3 text-sm sm:text-base">
                <StickyNote className="w-4 h-4 mr-2" />
                Notes (optional)
              </label>
              <textarea
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-sm sm:text-base touch-manipulation"
                placeholder="How did you feel? Additional notes..."
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>
            {/* Difficulty Rating */}
            <div className="md:col-span-2">
              <label className="flex items-center text-slate-300 font-medium mb-3 text-sm sm:text-base">
                <Activity className="w-4 h-4 mr-2" />
                How difficult was this power session?
              </label>
              <div className="flex justify-center space-x-2 sm:space-x-4">
                {difficultyFaces.map((face) => (
                  <button
                    key={face.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, difficulty: face.value })}
                    className={`flex flex-col items-center p-2 sm:p-3 rounded-xl transition-all transform hover:scale-110 active:scale-95 touch-manipulation ${
                      formData.difficulty === face.value
                        ? 'bg-blue-600 shadow-lg scale-110'
                        : 'bg-slate-700 hover:bg-slate-600'
                    }`}
                  >
                    <span className="text-2xl sm:text-3xl mb-1">{face.emoji}</span>
                    <span className={`text-xs font-medium ${
                      formData.difficulty === face.value ? 'text-white' : face.color
                    }`}>
                      {face.label}
                    </span>
                  </button>
                ))}
              </div>
              <p className="text-center text-slate-400 text-xs mt-2">
                Selected: {getDifficultyText(formData.difficulty)}
              </p>
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
                Logging Power {activeWorkout}...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Add Power {activeWorkout} to Log
              </div>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}