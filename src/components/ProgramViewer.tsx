import React, { useState } from 'react';
import { Clock, Target, Zap, Edit3, Save, X, Plus, Trash2, ArrowRight, Filter, Calendar, Dumbbell, TreePine, ChevronDown, ChevronRight } from 'lucide-react';
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
  selectedMonth: string;
  onMonthChange: (month: string) => void;
}

export default function ProgramViewer({ program, isAdmin, onProgramUpdate, allPrograms, onExerciseSelect, error, setError, selectedMonth, onMonthChange }: ProgramViewerProps) {
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [selectedWorkout, setSelectedWorkout] = useState<'A' | 'B'>('A');
  const [selectedExerciseType, setSelectedExerciseType] = useState<string>('all');
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set([0])); // First week expanded by default
  const [showOverview, setShowOverview] = useState(false);
  const [expandedPrograms, setExpandedPrograms] = useState<Set<string>>(new Set());
  const [expandedProgramWeeks, setExpandedProgramWeeks] = useState<Set<string>>(new Set());
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

  // Filter exercises based on workout type (A or B)
  const getWorkoutExercises = (exercises: Exercise[]) => {
    if (selectedWorkout === 'A') {
      // Workout A: Focus on compound movements and strength
      return exercises.filter((_, index) => index % 2 === 0);
    } else {
      // Workout B: Focus on isolation and accessory movements
      return exercises.filter((_, index) => index % 2 === 1);
    }
  };

  const availableMonths = ['August', 'September', 'October', 'November', 'December'];

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

        {/* Month Selection */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
          <label className="flex items-center text-slate-300 font-medium mb-2 text-xs sm:text-sm">
            <Calendar className="w-4 h-4 mr-2" />
            Select Training Month:
          </label>
          <select
            value={selectedMonth}
            onChange={(e) => onMonthChange(e.target.value)}
            className="bg-slate-700 text-white border border-slate-600 rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base w-full sm:w-auto touch-manipulation"
          >
            {availableMonths.map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
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

  const toggleWeekExpansion = (weekIndex: number) => {
    const newExpandedWeeks = new Set(expandedWeeks);
    if (newExpandedWeeks.has(weekIndex)) {
      newExpandedWeeks.delete(weekIndex);
    } else {
      newExpandedWeeks.add(weekIndex);
    }
    setExpandedWeeks(newExpandedWeeks);
  };

  const toggleProgramExpansion = (programMonth: string) => {
    const newExpanded = new Set(expandedPrograms);
    if (newExpanded.has(programMonth)) {
      newExpanded.delete(programMonth);
    } else {
      newExpanded.add(programMonth);
    }
    setExpandedPrograms(newExpanded);
  };

  const toggleProgramWeekExpansion = (programMonth: string, weekIndex: number) => {
    const key = `${programMonth}-${weekIndex}`;
    const newExpanded = new Set(expandedProgramWeeks);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedProgramWeeks(newExpanded);
  };

  // Additional safety check for selectedWeek
  // Remove selectedWeek validation since we're showing all weeks

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
          Training Program - {program.month} (Power {selectedWorkout})
          {isAdmin && <span className="ml-2 text-orange-400 text-xs sm:text-sm">(👑 מצב אדמין)</span>}
        </h2>
        <p className="text-slate-300 text-sm sm:text-base">
          {isAdmin ? 'Edit your training program' : 'Your built-in training program for maximum results'}
        </p>
      </div>

      {/* Overview Toggle Button */}
      <div className="text-center">
        <button
          onClick={() => setShowOverview(!showOverview)}
          className={`flex items-center space-x-2 mx-auto px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-all text-sm sm:text-base ${
            showOverview
              ? 'bg-purple-600 hover:bg-purple-700 text-white'
              : 'bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white border border-white/20'
          }`}
        >
          <TreePine className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>{showOverview ? 'Hide Overview' : 'Show Programs Overview'}</span>
        </button>
      </div>

      {/* Programs Overview Tree */}
      {showOverview && (
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-semibold text-lg sm:text-xl flex items-center">
              <TreePine className="w-5 h-5 mr-2" />
              All Training Programs Overview
            </h3>
            <div className="text-slate-300 text-sm">
              {allPrograms.length} programs available
            </div>
          </div>

          <div className="space-y-4">
            {allPrograms.map((prog, progIndex) => (
              <div key={prog.month} className="border border-white/10 rounded-xl overflow-hidden">
                {/* Program Header */}
                <div 
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 cursor-pointer hover:from-blue-600/30 hover:to-purple-600/30 transition-all"
                  onClick={() => toggleProgramExpansion(prog.month)}
                >
                  <div className="flex items-center space-x-3">
                    {expandedPrograms.has(prog.month) ? (
                      <ChevronDown className="w-5 h-5 text-white" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-white" />
                    )}
                    <div>
                      <h4 className="text-white font-bold text-lg">{prog.month}</h4>
                      <p className="text-slate-300 text-sm">
                        {prog.weeks.length} weeks • {prog.weeks.reduce((total, week) => total + week.days.reduce((dayTotal, day) => dayTotal + day.exercises.length, 0), 0)} total exercises
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onMonthChange(prog.month);
                        setShowOverview(false);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                    >
                      Select
                    </button>
                    {prog.month === selectedMonth && (
                      <div className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                        Current
                      </div>
                    )}
                  </div>
                </div>

                {/* Program Content */}
                {expandedPrograms.has(prog.month) && (
                  <div className="p-4 bg-white/5">
                    <div className="space-y-3">
                      {prog.weeks.map((week, weekIndex) => (
                        <div key={weekIndex} className="border border-white/10 rounded-lg overflow-hidden">
                          {/* Week Header */}
                          <div 
                            className="flex items-center justify-between p-3 bg-white/5 cursor-pointer hover:bg-white/10 transition-all"
                            onClick={() => toggleProgramWeekExpansion(prog.month, weekIndex)}
                          >
                            <div className="flex items-center space-x-2">
                              {expandedProgramWeeks.has(`${prog.month}-${weekIndex}`) ? (
                                <ChevronDown className="w-4 h-4 text-slate-300" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-slate-300" />
                              )}
                              <div>
                                <h5 className="text-white font-medium">{week.week}</h5>
                                <p className="text-slate-400 text-xs">{week.focus}</p>
                              </div>
                            </div>
                            <div className="text-slate-400 text-xs">
                              {week.days.reduce((total, day) => total + day.exercises.length, 0)} exercises
                            </div>
                          </div>

                          {/* Week Content */}
                          {expandedProgramWeeks.has(`${prog.month}-${weekIndex}`) && (
                            <div className="p-3 bg-white/5 border-t border-white/10">
                              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                {week.days.map((day, dayIndex) => (
                                  <div key={dayIndex} className="bg-white/5 rounded-lg p-2">
                                    <h6 className="text-white font-medium text-sm mb-1">{day.day}</h6>
                                    <p className="text-slate-400 text-xs mb-2">{day.focus}</p>
                                    <div className="space-y-1">
                                      {day.exercises.slice(0, 3).map((exercise, exIndex) => (
                                        <div key={exIndex} className="flex items-center space-x-2">
                                          <span className="text-xs">{getExerciseIcon(exercise.name)}</span>
                                          <span className="text-slate-300 text-xs truncate flex-1">
                                            {exercise.name}
                                          </span>
                                          <span className="text-slate-400 text-xs">
                                            {exercise.sets}×{exercise.reps}
                                          </span>
                                        </div>
                                      ))}
                                      {day.exercises.length > 3 && (
                                        <div className="text-slate-400 text-xs">
                                          +{day.exercises.length - 3} more exercises
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Overview Statistics */}
          <div className="mt-6 pt-6 border-t border-white/20">
            <h4 className="text-white font-semibold mb-4">Programs Statistics</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-400">
                  {allPrograms.length}
                </p>
                <p className="text-slate-400 text-sm">Total Programs</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">
                  {allPrograms.reduce((total, prog) => total + prog.weeks.length, 0)}
                </p>
                <p className="text-slate-400 text-sm">Total Weeks</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-400">
                  {allPrograms.reduce((total, prog) => total + prog.weeks.reduce((weekTotal, week) => weekTotal + week.days.reduce((dayTotal, day) => dayTotal + day.exercises.length, 0), 0), 0)}
                </p>
                <p className="text-slate-400 text-sm">Total Exercises</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-400">
                  {new Set(allPrograms.flatMap(prog => prog.weeks.flatMap(week => week.days.flatMap(day => day.exercises.map(ex => ex.name))))).size}
                </p>
                <p className="text-slate-400 text-sm">Unique Exercises</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Month and Workout Selection */}
      {!showOverview && (
        <div className="grid gap-4 sm:grid-cols-2">
        {/* Month Selection */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
          <label className="flex items-center text-slate-300 font-medium mb-2 text-xs sm:text-sm">
            <Calendar className="w-4 h-4 mr-2" />
            Select Training Month:
          </label>
          <select
            value={selectedMonth}
            onChange={(e) => onMonthChange(e.target.value)}
            className="bg-slate-700 text-white border border-slate-600 rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base w-full touch-manipulation"
          >
            {availableMonths.map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
        </div>

        {/* Workout A/B Selection */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
          <label className="flex items-center text-slate-300 font-medium mb-2 text-xs sm:text-sm">
            <Dumbbell className="w-4 h-4 mr-2" />
            Select Power Type:
          </label>
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedWorkout('A')}
              className={`flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-medium transition-all text-xs sm:text-sm ${
                selectedWorkout === 'A'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
              }`}
            >
              Power A
            </button>
            <button
              onClick={() => setSelectedWorkout('B')}
              className={`flex-1 px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-medium transition-all text-xs sm:text-sm ${
                selectedWorkout === 'B'
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
              }`}
            >
              Power B
            </button>
          </div>
        </div>
        </div>
      )}

      {/* Admin Controls */}
      {isAdmin && !showOverview && (
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
      {isAdmin && !showOverview && (
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
      {!showOverview && (
        <div className="space-y-6">
        {program.weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden">
            {/* Week Header */}
            <div 
              className="flex items-center justify-between p-4 sm:p-6 cursor-pointer hover:bg-white/5 transition-colors"
              onClick={() => toggleWeekExpansion(weekIndex)}
            >
              <div className="flex items-center space-x-3">
                <div className={`transform transition-transform duration-200 ${expandedWeeks.has(weekIndex) ? 'rotate-90' : ''}`}>
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white">{week.week}</h3>
                  <p className="text-slate-300 text-sm sm:text-base">{week.focus}</p>
                </div>
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

            {/* Collapsible Week Content */}
            {expandedWeeks.has(weekIndex) && (
              <div className="p-4 sm:p-6 pt-0 border-t border-white/10">
                {/* Week Exercises - All exercises from all days combined */}
                <div className="space-y-3">
                  {week.days.flatMap(day => day.exercises).map((exercise, exerciseIndex) => {
                    const workoutExercises = getWorkoutExercises([exercise]);
                    const filteredExercises = getFilteredExercises(workoutExercises);

                    // Don't show exercise if no match with filter (admin mode)
                    if (isAdmin && selectedExerciseType !== 'all' && filteredExercises.length === 0) {
                      return null;
                    }

                    // Don't show exercise if no match for selected workout
                    if (!isAdmin && workoutExercises.length === 0) {
                      return null;
                    }

                    return (
                      <div
                        key={exerciseIndex}
                        className={`bg-white/5 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/10 group relative hover:bg-white/10 transition-all duration-300 ${
                          !isAdmin && onExerciseSelect 
                            ? 'cursor-pointer hover:border-white/20 hover:scale-[1.02]' 
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
                          <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => startEditingExercise(weekIndex, 0, exerciseIndex)}
                              className="p-1 bg-blue-600 hover:bg-blue-700 rounded text-white"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => deleteExercise(weekIndex, 0, exerciseIndex)}
                              className="p-1 bg-red-600 hover:bg-red-700 rounded text-white"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}

                        {editingExercise?.weekIndex === weekIndex && editingExercise?.exerciseIndex === exerciseIndex ? (
                          <div className="space-y-3">
                            <select
                              value={editForm.name}
                              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                              className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg text-sm"
                            >
                              {commonExercises.map(ex => (
                                <option key={ex} value={ex}>{ex}</option>
                              ))}
                            </select>
                            <select
                              value={editForm.type}
                              onChange={(e) => setEditForm({ ...editForm, type: e.target.value as Exercise['type'] })}
                              className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg text-sm"
                            >
                              {exerciseTypes.slice(1).map(type => (
                                <option key={type.value} value={type.value}>
                                  {type.icon} {type.label}
                                </option>
                              ))}
                            </select>
                            <div className="grid grid-cols-2 gap-3">
                              <input
                                type="number"
                                value={editForm.sets}
                                onChange={(e) => setEditForm({ ...editForm, sets: parseInt(e.target.value) })}
                                className="px-3 py-2 bg-slate-700 text-white rounded-lg text-sm"
                                placeholder="Sets"
                              />
                              <input
                                type="text"
                                value={editForm.reps}
                                onChange={(e) => setEditForm({ ...editForm, reps: e.target.value })}
                                className="px-3 py-2 bg-slate-700 text-white rounded-lg text-sm"
                                placeholder="Reps"
                              />
                            </div>
                            <input
                              type="text"
                              value={editForm.weight}
                              onChange={(e) => setEditForm({ ...editForm, weight: e.target.value })}
                              className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg text-sm"
                              placeholder="Weight/Percentage (e.g., 70% 1RM)"
                            />
                            <input
                              type="text"
                              value={editForm.restTime}
                              onChange={(e) => setEditForm({ ...editForm, restTime: e.target.value })}
                              className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg text-sm"
                              placeholder="Rest Time"
                            />
                            <textarea
                              value={editForm.notes}
                              onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                              className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg text-sm"
                              placeholder="Notes"
                              rows={2}
                            />
                            <div className="flex space-x-3">
                              <button
                                onClick={saveExercise}
                                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium"
                              >
                                <Save className="w-4 h-4" />
                                <span>Save</span>
                              </button>
                              <button
                                onClick={() => setEditingExercise(null)}
                                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg text-sm font-medium"
                              >
                                <X className="w-4 h-4" />
                                <span>Cancel</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <span className={`w-3 h-3 rounded-full ${getExerciseCategoryColor(exercise.type)}`}></span>
                                <h5 className="font-semibold text-white text-sm sm:text-base">{exercise.name}</h5>
                              </div>
                              <div className="text-slate-300 text-sm space-y-1">
                                <p className="font-medium">{exercise.sets} sets × {exercise.reps} reps</p>
                                {exercise.weight && <p>Weight: <span className="text-blue-400">{exercise.weight}</span></p>}
                                {exercise.restTime && <p>Rest: <span className="text-green-400">{exercise.restTime}</span></p>}
                                {exercise.notes && <p className="text-slate-400 italic text-xs">{exercise.notes}</p>}
                              </div>
                            </div>
                            {!isAdmin && onExerciseSelect && (
                              <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {isAdmin && (
                    <button
                      onClick={() => addExercise(weekIndex, 0)}
                      className="w-full p-4 border-2 border-dashed border-white/20 rounded-xl text-white/60 hover:text-white hover:border-white/40 transition-colors text-sm font-medium"
                    >
                      <Plus className="w-5 h-5 mx-auto mb-2" />
                      Add Exercise to Week
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Week Edit Modal */}
            {editingWeek === weekIndex && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md">
                  <h3 className="text-white font-bold text-lg mb-4">Edit Week</h3>
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={weekEditForm.week}
                      onChange={(e) => setWeekEditForm({ ...weekEditForm, week: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg"
                      placeholder="Week name"
                    />
                    <input
                      type="text"
                      value={weekEditForm.focus}
                      onChange={(e) => setWeekEditForm({ ...weekEditForm, focus: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg"
                      placeholder="Week focus"
                    />
                    <div className="flex space-x-3">
                      <button
                        onClick={saveWeek}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingWeek(null)}
                        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Add Week Button */}
        {isAdmin && (
          <div className="text-center">
            <button
              onClick={addWeek}
              className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors mx-auto"
            >
              <Plus className="w-5 h-5" />
              <span>Add Week</span>
            </button>
          </div>
        )}
        </div>
      )}

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

// CreateProgramModal component
interface CreateProgramModalProps {
  form: any;
  setForm: (form: any) => void;
  exerciseTypes: any[];
  commonExercises: string[];
  daysOfWeek: string[];
  onCreateProgram: () => void;
  onClose: () => void;
  onAddExercise: () => void;
  onUpdateExercise: (index: number, field: string, value: any) => void;
  onRemoveExercise: (index: number) => void;
  onToggleDay: (exerciseIndex: number, day: string) => void;
}

function CreateProgramModal({
  form,
  setForm,
  exerciseTypes,
  commonExercises,
  daysOfWeek,
  onCreateProgram,
  onClose,
  onAddExercise,
  onUpdateExercise,
  onRemoveExercise,
  onToggleDay
}: CreateProgramModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-bold text-xl">Create New Program</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Basic Program Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              value={form.month}
              onChange={(e) => setForm({ ...form, month: e.target.value })}
              className="px-3 py-2 bg-slate-700 text-white rounded-lg"
              placeholder="Program Name (e.g., January 2024)"
            />
            <input
              type="text"
              value={form.weekFocus}
              onChange={(e) => setForm({ ...form, weekFocus: e.target.value })}
              className="px-3 py-2 bg-slate-700 text-white rounded-lg"
              placeholder="Week Focus (e.g., Strength Building)"
            />
            <input
              type="number"
              value={form.weeks}
              onChange={(e) => setForm({ ...form, weeks: parseInt(e.target.value) || 1 })}
              className="px-3 py-2 bg-slate-700 text-white rounded-lg"
              placeholder="Number of Weeks"
              min="1"
              max="8"
            />
            <input
              type="number"
              value={form.daysPerWeek}
              onChange={(e) => setForm({ ...form, daysPerWeek: parseInt(e.target.value) || 7 })}
              className="px-3 py-2 bg-slate-700 text-white rounded-lg"
              placeholder="Days per Week"
              min="1"
              max="7"
            />
          </div>

          {/* Exercises */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-semibold">Exercises</h4>
              <button
                onClick={onAddExercise}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Exercise</span>
              </button>
            </div>

            <div className="space-y-4">
              {form.exercises.map((exercise: any, index: number) => (
                <div key={index} className="bg-slate-700 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
                    <select
                      value={exercise.name}
                      onChange={(e) => onUpdateExercise(index, 'name', e.target.value)}
                      className="px-2 py-1 bg-slate-600 text-white rounded text-sm"
                    >
                      {commonExercises.map(ex => (
                        <option key={ex} value={ex}>{ex}</option>
                      ))}
                    </select>
                    <select
                      value={exercise.type}
                      onChange={(e) => onUpdateExercise(index, 'type', e.target.value)}
                      className="px-2 py-1 bg-slate-600 text-white rounded text-sm"
                    >
                      {exerciseTypes.slice(1).map(type => (
                        <option key={type.value} value={type.value}>
                          {type.icon} {type.label}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => onRemoveExercise(index)}
                      className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                    >
                      <Trash2 className="w-3 h-3 mx-auto" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
                    <input
                      type="number"
                      value={exercise.sets}
                      onChange={(e) => onUpdateExercise(index, 'sets', parseInt(e.target.value) || 0)}
                      className="px-2 py-1 bg-slate-600 text-white rounded text-sm"
                      placeholder="Sets"
                    />
                    <input
                      type="text"
                      value={exercise.reps}
                      onChange={(e) => onUpdateExercise(index, 'reps', e.target.value)}
                      className="px-2 py-1 bg-slate-600 text-white rounded text-sm"
                      placeholder="Reps"
                    />
                    <input
                      type="text"
                      value={exercise.weight}
                      onChange={(e) => onUpdateExercise(index, 'weight', e.target.value)}
                      className="px-2 py-1 bg-slate-600 text-white rounded text-sm"
                      placeholder="Weight"
                    />
                    <input
                      type="text"
                      value={exercise.restTime}
                      onChange={(e) => onUpdateExercise(index, 'restTime', e.target.value)}
                      className="px-2 py-1 bg-slate-600 text-white rounded text-sm"
                      placeholder="Rest Time"
                    />
                  </div>

                  <div>
                    <p className="text-slate-300 text-xs mb-2">Select Days:</p>
                    <div className="flex flex-wrap gap-1">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                        <button
                          key={day}
                          onClick={() => onToggleDay(index, day)}
                          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                            exercise.days.includes(day)
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                          }`}
                        >
                          {day.slice(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4 border-t border-slate-600">
            <button
              onClick={onCreateProgram}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold"
            >
              Create Program
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}