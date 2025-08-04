import React, { useState } from 'react';
import { Clock, Target, Zap, Edit3, Save, X, Plus, Trash2, ArrowRight, Filter, Calendar } from 'lucide-react';
import { Program, Exercise } from '../types';
import { getExerciseImage, getExerciseIcon, getExerciseCategoryColor } from '../utils/exercise-images';

interface ProgramViewerProps {
  program: Program;
  isAdmin: boolean;
  onProgramUpdate: (programs: Program[]) => void;
  allPrograms: Program[];
  onExerciseSelect?: (exercise: { name: string; sets: number; reps: string; weight?: string }) => void;
  error?: string | null;
  setError?: (error: string | null) => void;
}

export default function ProgramViewer({ program, isAdmin, onProgramUpdate, allPrograms, onExerciseSelect, error, setError }: ProgramViewerProps) {
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [selectedExerciseType, setSelectedExerciseType] = useState<string>('all');
  const [editingExercise, setEditingExercise] = useState<{ weekIndex: number; dayIndex: number; exerciseIndex: number } | null>(null);
  const [editingWeek, setEditingWeek] = useState<number | null>(null);
  const [weekEditForm, setWeekEditForm] = useState({
    week: '',
    focus: ''
  });
  const [editForm, setEditForm] = useState({
    name: '',
    sets: 0,
    reps: '',
    weight: '',
    restTime: '',
    notes: '',
    type: 'chest' as Exercise['type']
  });

  // Advanced program creation state
  const [showCreateProgram, setShowCreateProgram] = useState(false);
  const [programForm, setProgramForm] = useState({
    month: '',
    weekFocus: '',
    weeks: 1,
    daysPerWeek: 7,
    exercises: [] as Array<{
      name: string;
      sets: number;
      reps: string;
      weight: string;
      restTime: string;
      type: Exercise['type'];
      days: string[];
    }>
  });

  const exerciseTypes = [
    { value: 'all', label: 'All Exercises', color: 'bg-gray-600', icon: '🏋️' },
    { value: 'chest', label: 'Chest', color: 'bg-red-600', icon: '💪' },
    { value: 'back', label: 'Back', color: 'bg-blue-600', icon: '🔙' },
    { value: 'legs', label: 'Legs', color: 'bg-green-600', icon: '🦵' },
    { value: 'shoulders', label: 'Shoulders', color: 'bg-yellow-600', icon: '🤷' },
    { value: 'arms', label: 'Arms', color: 'bg-purple-600', icon: '💪' },
    { value: 'functional', label: 'Functional', color: 'bg-orange-600', icon: '🤸' },
    { value: 'cardio', label: 'Cardio', color: 'bg-cyan-600', icon: '🏃' },
    { value: 'recovery', label: 'Recovery', color: 'bg-pink-600', icon: '🧘' }
  ];

  const commonExercises = [
    'Bench Press', 'Deadlift', 'Squats', 'Pull-ups', 'Overhead Press',
    'Barbell Rows', 'Incline Bench Press', 'Romanian Deadlift', 'Lat Pulldown',
    'Dips', 'Barbell Curls', 'Close-Grip Bench Press', 'Leg Press',
    'Walking Lunges', 'Face Pulls', 'Lateral Raises', 'Tricep Dips',
    'Hammer Curls', 'Calf Raises', 'Plank', 'Push-ups', 'Burpees'
  ];

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const englishDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const createProgram = () => {
    if (!programForm.month.trim()) {
      setError && setError('Please enter month name');
      return;
    }

    if (allPrograms.find(p => p.month === programForm.month)) {
      setError && setError('Program with this name already exists');
      return;
    }

    if (programForm.exercises.length === 0) {
      setError && setError('Please add at least one exercise');
      return;
    }

    // Create program structure
    const weeks = [];
    for (let weekNum = 1; weekNum <= programForm.weeks; weekNum++) {
      const days = [];
      
      for (let dayIndex = 0; dayIndex < programForm.daysPerWeek; dayIndex++) {
        const dayName = englishDays[dayIndex];
        const dayExercises = programForm.exercises.filter(ex => 
          ex.days.includes(dayName)
        ).map(ex => ({
          name: ex.name,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight || undefined,
          restTime: ex.restTime || undefined,
          type: ex.type
        }));

        days.push({
          day: dayName,
          focus: dayExercises.length > 0 ? `${dayExercises[0].type} Training` : 'Rest Day',
          exercises: dayExercises.length > 0 ? dayExercises : [
            { name: 'Complete Rest', sets: 1, reps: 'All day', notes: 'Recovery', type: 'recovery' as Exercise['type'] }
          ]
        });
      }

      weeks.push({
        week: `Week ${weekNum}`,
        focus: programForm.weekFocus || `Week ${weekNum} Training`,
        days
      });
    }

    const newProgram: Program = {
      month: programForm.month,
      weeks
    };

    const updatedPrograms = [...allPrograms, newProgram];
    onProgramUpdate(updatedPrograms);

    // Switch to the newly created program
    const programIndex = updatedPrograms.findIndex(p => p.month === programForm.month);
    if (programIndex !== -1) {
      // Force re-render by updating the selected month in parent component
      window.dispatchEvent(new CustomEvent('programCreated', { 
        detail: { month: programForm.month } 
      }));
    }

    // Reset form
    setProgramForm({
      month: '',
      weekFocus: '',
      weeks: 1,
      daysPerWeek: 7,
      exercises: []
    });
    setShowCreateProgram(false);

    // Show success message
    const successEvent = new CustomEvent('showSuccess', { 
      detail: { message: `Program "${programForm.month}" created successfully!` } 
    });
    window.dispatchEvent(successEvent);
  };

  const addExerciseToForm = () => {
    setProgramForm({
      ...programForm,
      exercises: [...programForm.exercises, {
        name: 'Bench Press',
        sets: 3,
        reps: '10',
        weight: '70% 1RM',
        restTime: '2 min',
        type: 'chest',
        days: ['Monday']
      }]
    });
  };

  const updateExercise = (index: number, field: string, value: any) => {
    const updatedExercises = [...programForm.exercises];
    updatedExercises[index] = { ...updatedExercises[index], [field]: value };
    setProgramForm({ ...programForm, exercises: updatedExercises });
  };

  const removeExercise = (index: number) => {
    const updatedExercises = programForm.exercises.filter((_, i) => i !== index);
    setProgramForm({ ...programForm, exercises: updatedExercises });
  };

  const toggleDayForExercise = (exerciseIndex: number, day: string) => {
    const exercise = programForm.exercises[exerciseIndex];
    const updatedDays = exercise.days.includes(day)
      ? exercise.days.filter(d => d !== day)
      : [...exercise.days, day];
    
    updateExercise(exerciseIndex, 'days', updatedDays);
  };

  // Check if program exists and has valid structure
  if (!program || !program.weeks || program.weeks.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
            Training Program
            {isAdmin && <span className="ml-2 text-orange-400 text-xs sm:text-sm">(👑 מצב אדמין)</span>}
          </h2>
          <p className="text-slate-300 text-sm sm:text-base">
            No training program found for selected month
          </p>
        </div>

        {/* Admin Controls for No Program */}
        {isAdmin && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20">
            <div className="text-center space-y-4">
              <h3 className="text-white font-semibold text-base sm:text-lg mb-4">Program Management</h3>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => setShowCreateProgram(true)}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-semibold transition-colors text-sm sm:text-base"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Create Program</span>
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
          <div className="text-6xl mb-4">🏋️‍♂️</div>
          <h3 className="text-white font-semibold text-lg mb-2">No program available</h3>
          <p className="text-slate-400 text-sm">
            {isAdmin ? 'Create a new program or select another month' : 'Select another month or contact your trainer'}
          </p>
        </div>

        {/* Create Program Modal */}
        {isAdmin && showCreateProgram && (
          <CreateProgramModal
            form={programForm}
            setForm={setProgramForm}
            exerciseTypes={exerciseTypes}
            commonExercises={commonExercises}
            daysOfWeek={daysOfWeek}
            onCreateProgram={createProgram}
            onClose={() => setShowCreateProgram(false)}
            onAddExercise={addExerciseToForm}
            onUpdateExercise={updateExercise}
            onRemoveExercise={removeExercise}
            onToggleDay={toggleDayForExercise}
          />
        )}
      </div>
    );
  }

  const getFocusIcon = (focus: string) => {
    if (focus.toLowerCase().includes('rest')) return Clock;
    if (focus.toLowerCase().includes('power') || focus.toLowerCase().includes('strength')) return Zap;
    return Target;
  };

  const getFocusColor = (focus: string) => {
    if (focus.toLowerCase().includes('rest')) return 'from-gray-600 to-gray-700';
    if (focus.toLowerCase().includes('push')) return 'from-red-600 to-red-700';
    if (focus.toLowerCase().includes('pull')) return 'from-blue-600 to-blue-700';
    if (focus.toLowerCase().includes('legs') || focus.toLowerCase().includes('lower')) return 'from-green-600 to-green-700';
    if (focus.toLowerCase().includes('power') || focus.toLowerCase().includes('strength')) return 'from-purple-600 to-purple-700';
    return 'from-orange-600 to-orange-700';
  };

  const handleDeleteProgram = (month: string) => {
    if (window.confirm(`Are you sure you want to delete program "${month}"?`)) {
      const updatedPrograms = allPrograms.filter(p => p.month !== month);
      onProgramUpdate(updatedPrograms);
      const successEvent = new CustomEvent('showSuccess', { 
        detail: { message: `Program "${month}" deleted successfully` } 
      });
      window.dispatchEvent(successEvent);
    }
  };

  const deleteWeek = (weekIndex: number) => {
    if (program.weeks.length <= 1) {
      setError && setError('Cannot delete the last week');
      return;
    }

    if (window.confirm('Are you sure you want to delete this week?')) {
      const updatedPrograms = allPrograms.map(p => {
        if (p.month === program.month) {
          const updatedWeeks = [...p.weeks];
          updatedWeeks.splice(weekIndex, 1);
          return { ...p, weeks: updatedWeeks };
        }
        return p;
      });

      onProgramUpdate(updatedPrograms);
      const successEvent = new CustomEvent('showSuccess', { 
        detail: { message: 'Week deleted successfully' } 
      });
      window.dispatchEvent(successEvent);
    }
  };

  const startEditingExercise = (weekIndex: number, dayIndex: number, exerciseIndex: number) => {
    const exercise = program.weeks[weekIndex].days[dayIndex].exercises[exerciseIndex];
    setEditForm({
      name: exercise.name,
      sets: exercise.sets,
      reps: exercise.reps,
      weight: exercise.weight || '',
      restTime: exercise.restTime || '',
      notes: exercise.notes || '',
      type: exercise.type || 'chest'
    });
    setEditingExercise({ weekIndex, dayIndex, exerciseIndex });
  };

  const saveExercise = () => {
    if (!editingExercise) return;

    const updatedPrograms = allPrograms.map(p => {
      if (p.month === program.month) {
        const updatedWeeks = [...p.weeks];
        updatedWeeks[editingExercise.weekIndex].days[editingExercise.dayIndex].exercises[editingExercise.exerciseIndex] = {
          ...editForm,
          weight: editForm.weight || undefined,
          restTime: editForm.restTime || undefined,
          notes: editForm.notes || undefined
        };
        return { ...p, weeks: updatedWeeks };
      }
      return p;
    });

    onProgramUpdate(updatedPrograms);
    setEditingExercise(null);
  };

  const addExercise = (weekIndex: number, dayIndex: number) => {
    const newExercise = {
      name: 'תרגיל חדש',
      sets: 3,
      reps: '10',
      weight: '',
      restTime: '90 sec',
      notes: '',
      type: 'chest' as Exercise['type']
    };

    const updatedPrograms = allPrograms.map(p => {
      if (p.month === program.month) {
        const updatedWeeks = [...p.weeks];
        updatedWeeks[weekIndex].days[dayIndex].exercises.push(newExercise);
        return { ...p, weeks: updatedWeeks };
      }
      return p;
    });

    onProgramUpdate(updatedPrograms);
  };

  const deleteExercise = (weekIndex: number, dayIndex: number, exerciseIndex: number) => {
    if (window.confirm('Are you sure you want to delete this exercise?')) {
      const updatedPrograms = allPrograms.map(p => {
        if (p.month === program.month) {
          const updatedWeeks = [...p.weeks];
          updatedWeeks[weekIndex].days[dayIndex].exercises.splice(exerciseIndex, 1);
          return { ...p, weeks: updatedWeeks };
        }
        return p;
      });

      onProgramUpdate(updatedPrograms);
    }
  };

  const addWeek = () => {
    const newWeekNumber = program.weeks.length + 1;
    const newWeek = {
      week: `Week ${newWeekNumber}`,
      focus: `Week ${newWeekNumber} Training`,
      days: program.weeks[0].days.map(day => ({
        ...day,
        exercises: []
      }))
    };

    const updatedPrograms = allPrograms.map(p => {
      if (p.month === program.month) {
        return { ...p, weeks: [...p.weeks, newWeek] };
      }
      return p;
    });

    onProgramUpdate(updatedPrograms);
  };

  const startEditingWeek = (weekIndex: number) => {
    const week = program.weeks[weekIndex];
    setWeekEditForm({
      week: week.week,
      focus: week.focus
    });
    setEditingWeek(weekIndex);
  };

  const saveWeek = () => {
    if (editingWeek === null) return;

    const updatedPrograms = allPrograms.map(p => {
      if (p.month === program.month) {
        const updatedWeeks = [...p.weeks];
        updatedWeeks[editingWeek] = {
          ...updatedWeeks[editingWeek],
          week: weekEditForm.week,
          focus: weekEditForm.focus
        };
        return { ...p, weeks: updatedWeeks };
      }
      return p;
    });

    onProgramUpdate(updatedPrograms);
    setEditingWeek(null);
  };

  const getFilteredExercises = (exercises: Exercise[]) => {
    if (selectedExerciseType === 'all') return exercises;
    return exercises.filter(exercise => exercise.type === selectedExerciseType);
  };

  // Additional safety check for selectedWeek
  // Remove selectedWeek validation since we're showing all weeks

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
          Training Program - {program.month}
          {isAdmin && <span className="ml-2 text-orange-400 text-xs sm:text-sm">(👑 מצב אדמין)</span>}
        </h2>
        <p className="text-slate-300 text-sm sm:text-base">
          {isAdmin ? 'Edit your training program' : 'Your built-in training program for maximum results'}
        </p>
      </div>

      {/* Admin Controls */}
      {isAdmin && (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold text-base sm:text-lg">Program Management</h3>
              <p className="text-slate-300 text-xs sm:text-sm">Create new training programs or edit existing ones</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowCreateProgram(true)}
                className="flex items-center space-x-1 sm:space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Create Program</span>
              </button>
              <button
                onClick={() => handleDeleteProgram(program.month)}
                className="flex items-center space-x-1 sm:space-x-2 bg-red-600 hover:bg-red-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base"
              >
                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exercise Type Filter (Admin Only) */}
      {isAdmin && (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
          <div className="flex items-center mb-3">
            <Filter className="w-4 h-4 text-slate-300 mr-2" />
            <span className="text-slate-300 font-medium text-xs sm:text-sm">Filter by exercise type:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {exerciseTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setSelectedExerciseType(type.value)}
                className={`flex items-center space-x-1 px-2 sm:px-3 py-1 sm:py-2 rounded-lg font-medium transition-all text-xs sm:text-sm ${
                  selectedExerciseType === type.value
                    ? `${type.color} text-white shadow-lg`
                    : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
                }`}
              >
                <span>{type.icon}</span>
                <span>{type.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Weeks Display */}
      <div className="space-y-6">
        {program.weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20">
            {/* Week Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/20">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">{week.week}</h3>
                <p className="text-slate-300 text-sm sm:text-base">{week.focus}</p>
              </div>
              {isAdmin && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => startEditingWeek(weekIndex)}
                    className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
                    title="ערוך שבוע"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteWeek(weekIndex)}
                    className="p-2 bg-red-600 hover:bg-red-700 rounded-lg text-white transition-colors"
                    title="מחק שבוע"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Days Grid for this week */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {week.days.map((day, dayIndex) => {
                const Icon = getFocusIcon(day.focus);
                const gradientColor = getFocusColor(day.focus);
                const filteredExercises = getFilteredExercises(day.exercises);

                // Don't show day if no exercises match filter (admin mode)
                if (isAdmin && selectedExerciseType !== 'all' && filteredExercises.length === 0) {
                  return null;
                }

                return (
                  <div
                    key={dayIndex}
                    className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300"
                  >
                    <div className={`bg-gradient-to-r ${gradientColor} rounded-lg p-2 sm:p-3 mb-3 sm:mb-4`}>
                      <div className="flex items-center justify-between text-white">
                        <h4 className="font-bold text-sm sm:text-base">{day.day}</h4>
                        <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                      </div>
                      <p className="text-white/90 text-xs mt-1">{day.focus}</p>
                    </div>

                    <div className="space-y-2">
                      {(isAdmin ? filteredExercises : day.exercises).map((exercise, exerciseIndex) => {
                        const actualExerciseIndex = isAdmin ? day.exercises.findIndex(e => e === exercise) : exerciseIndex;
                        
                        return (
                          <div
                            key={actualExerciseIndex}
                            className={`bg-white/5 rounded-lg p-2 border border-white/10 group relative ${
                              !isAdmin && onExerciseSelect 
                                ? 'cursor-pointer hover:bg-white/10 hover:border-white/20 transition-all duration-200 hover:scale-[1.02]' 
                                : ''
                            }`}
                            onClick={() => {
                              if (!isAdmin && onExerciseSelect) {
                                onExerciseSelect({
                                  name: exercise.name,
                                  sets: exercise.sets,
                                  reps: exercise.reps,
                                  weight: exercise.weight
                                });
                              }
                            }}
                          >
                            {isAdmin && (
                              <div className="absolute top-1 right-1 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => startEditingExercise(weekIndex, dayIndex, actualExerciseIndex)}
                                  className="p-0.5 bg-blue-600 hover:bg-blue-700 rounded text-white"
                                >
                                  <Edit3 className="w-2 h-2" />
                                </button>
                                <button
                                  onClick={() => deleteExercise(weekIndex, dayIndex, actualExerciseIndex)}
                                  className="p-0.5 bg-red-600 hover:bg-red-700 rounded text-white"
                                >
                                  <Trash2 className="w-2 h-2" />
                                </button>
                              </div>
                            )}

                            {editingExercise?.weekIndex === weekIndex && editingExercise?.dayIndex === dayIndex && editingExercise?.exerciseIndex === actualExerciseIndex ? (
                              <div className="space-y-2">
                                <select
                                  value={editForm.name}
                                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                  className="w-full px-2 py-1 bg-slate-700 text-white rounded text-xs"
                                >
                                  {commonExercises.map(ex => (
                                    <option key={ex} value={ex}>{ex}</option>
                                  ))}
                                </select>
                                <select
                                  value={editForm.type}
                                  onChange={(e) => setEditForm({ ...editForm, type: e.target.value as Exercise['type'] })}
                                  className="w-full px-2 py-1 bg-slate-700 text-white rounded text-xs"
                                >
                                  {exerciseTypes.slice(1).map(type => (
                                    <option key={type.value} value={type.value}>
                                      {type.icon} {type.label}
                                    </option>
                                  ))}
                                </select>
                                <div className="grid grid-cols-2 gap-2">
                                  <input
                                    type="number"
                                    value={editForm.sets}
                                    onChange={(e) => setEditForm({ ...editForm, sets: parseInt(e.target.value) })}
                                    className="px-2 py-1 bg-slate-700 text-white rounded text-xs"
                                    placeholder="סטים"
                                  />
                                  <input
                                    type="text"
                                    value={editForm.reps}
                                    onChange={(e) => setEditForm({ ...editForm, reps: e.target.value })}
                                    className="px-2 py-1 bg-slate-700 text-white rounded text-xs"
                                    placeholder="חזרות"
                                  />
                                </div>
                                <input
                                  type="text"
                                  value={editForm.weight}
                                  onChange={(e) => setEditForm({ ...editForm, weight: e.target.value })}
                                  className="w-full px-2 py-1 bg-slate-700 text-white rounded text-xs"
                                  placeholder="משקל/אחוז (למשל: 70% 1RM)"
                                />
                                <input
                                  type="text"
                                  value={editForm.restTime}
                                  onChange={(e) => setEditForm({ ...editForm, restTime: e.target.value })}
                                  className="w-full px-2 py-1 bg-slate-700 text-white rounded text-xs"
                                  placeholder="זמן מנוחה"
                                />
                                <textarea
                                  value={editForm.notes}
                                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                                  className="w-full px-2 py-1 bg-slate-700 text-white rounded text-xs"
                                  placeholder="הערות"
                                  rows={2}
                                />
                                <div className="flex space-x-2">
                                  <button
                                    onClick={saveExercise}
                                    className="flex items-center space-x-1 px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs"
                                  >
                                    <Save className="w-2 h-2" />
                                    <span>שמור</span>
                                  </button>
                                  <button
                                    onClick={() => setEditingExercise(null)}
                                    className="flex items-center space-x-1 px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs"
                                  >
                                    <X className="w-2 h-2" />
                                    <span>בטל</span>
                                  </button>
                                </div>
                              </div>