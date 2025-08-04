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
}

export default function ProgramViewer({ program, isAdmin, onProgramUpdate, allPrograms, onExerciseSelect }: ProgramViewerProps) {
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [selectedExerciseType, setSelectedExerciseType] = useState<string>('all');
  const [editingExercise, setEditingExercise] = useState<{ weekIndex: number; dayIndex: number; exerciseIndex: number } | null>(null);
  const [showCreateProgram, setShowCreateProgram] = useState(false);
  const [newProgramForm, setNewProgramForm] = useState({
    month: '',
    weekFocus: '',
    copyFrom: ''
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
  const [showAdvancedCreation, setShowAdvancedCreation] = useState(false);
  const [advancedProgramForm, setAdvancedProgramForm] = useState({
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
    { value: 'all', label: 'כל התרגילים', color: 'bg-gray-600', icon: '🏋️' },
    { value: 'chest', label: 'חזה', color: 'bg-red-600', icon: '💪' },
    { value: 'back', label: 'גב', color: 'bg-blue-600', icon: '🔙' },
    { value: 'legs', label: 'רגליים', color: 'bg-green-600', icon: '🦵' },
    { value: 'shoulders', label: 'כתפיים', color: 'bg-yellow-600', icon: '🤷' },
    { value: 'arms', label: 'זרועות', color: 'bg-purple-600', icon: '💪' },
    { value: 'functional', label: 'פונקציונלי', color: 'bg-orange-600', icon: '🤸' },
    { value: 'cardio', label: 'קרדיו', color: 'bg-cyan-600', icon: '🏃' },
    { value: 'recovery', label: 'התאוששות', color: 'bg-pink-600', icon: '🧘' }
  ];

  const commonExercises = [
    'Bench Press', 'Deadlift', 'Squats', 'Pull-ups', 'Overhead Press',
    'Barbell Rows', 'Incline Bench Press', 'Romanian Deadlift', 'Lat Pulldown',
    'Dips', 'Barbell Curls', 'Close-Grip Bench Press', 'Leg Press',
    'Walking Lunges', 'Face Pulls', 'Lateral Raises', 'Tricep Dips',
    'Hammer Curls', 'Calf Raises', 'Plank', 'Push-ups', 'Burpees'
  ];

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const createNewProgram = () => {
    if (!newProgramForm.month.trim()) {
      alert('אנא הזן שם חודש');
      return;
    }

    // Check if program already exists
    if (allPrograms.find(p => p.month === newProgramForm.month)) {
      alert('תוכנית עם השם הזה כבר קיימת');
      return;
    }

    let newProgram: Program;

    if (newProgramForm.copyFrom) {
      // Copy from existing program
      const sourceProgram = allPrograms.find(p => p.month === newProgramForm.copyFrom);
      if (sourceProgram) {
        newProgram = {
          ...sourceProgram,
          month: newProgramForm.month,
          weeks: sourceProgram.weeks.map(week => ({
            ...week,
            focus: newProgramForm.weekFocus || week.focus
          }))
        };
      } else {
        alert('לא נמצאה תוכנית להעתקה');
        return;
      }
    } else {
      // Create empty program with basic structure
      newProgram = {
        month: newProgramForm.month,
        weeks: [
          {
            week: 'Week 1',
            focus: newProgramForm.weekFocus || 'Foundation Building',
            days: [
              {
                day: 'Monday',
                focus: 'Upper Body Push',
                exercises: [
                  { name: 'Bench Press', sets: 4, reps: '8-10', weight: '70-80% 1RM', restTime: '2-3 min', type: 'chest' }
                ]
              },
              {
                day: 'Tuesday',
                focus: 'Lower Body',
                exercises: [
                  { name: 'Squats', sets: 4, reps: '6-8', weight: '75-85% 1RM', restTime: '3-4 min', type: 'legs' }
                ]
              },
              {
                day: 'Wednesday',
                focus: 'Rest or Light Cardio',
                exercises: [
                  { name: 'Light Jogging', sets: 1, reps: '20-30 min', notes: 'Recovery pace', type: 'cardio' }
                ]
              },
              {
                day: 'Thursday',
                focus: 'Upper Body Pull',
                exercises: [
                  { name: 'Deadlift', sets: 4, reps: '5-6', weight: '80-90% 1RM', restTime: '3-4 min', type: 'back' }
                ]
              },
              {
                day: 'Friday',
                focus: 'Lower Body Power',
                exercises: [
                  { name: 'Front Squats', sets: 4, reps: '6-8', weight: '70-80% 1RM', restTime: '3 min', type: 'legs' }
                ]
              },
              {
                day: 'Saturday',
                focus: 'Full Body Circuit',
                exercises: [
                  { name: 'Burpees', sets: 3, reps: '8-12', restTime: '60 sec', type: 'functional' }
                ]
              },
              {
                day: 'Sunday',
                focus: 'Rest Day',
                exercises: [
                  { name: 'Complete Rest', sets: 1, reps: 'All day', notes: 'Recovery and meal prep', type: 'recovery' }
                ]
              }
            ]
          }
        ]
      };
    }

    // Add new program to the list
    const updatedPrograms = [...allPrograms, newProgram];
    onProgramUpdate(updatedPrograms);

    // Reset form and close modal
    setNewProgramForm({ month: '', weekFocus: '', copyFrom: '' });
    setShowCreateProgram(false);

    alert(`תוכנית "${newProgramForm.month}" נוצרה בהצלחה!`);
  };

  const createAdvancedProgram = () => {
    if (!advancedProgramForm.month.trim()) {
      alert('אנא הזן שם חודש');
      return;
    }

    if (allPrograms.find(p => p.month === advancedProgramForm.month)) {
      alert('תוכנית עם השם הזה כבר קיימת');
      return;
    }

    if (advancedProgramForm.exercises.length === 0) {
      alert('אנא הוסף לפחות תרגיל אחד');
      return;
    }

    // Create program structure
    const weeks = [];
    for (let weekNum = 1; weekNum <= advancedProgramForm.weeks; weekNum++) {
      const days = [];
      
      for (let dayIndex = 0; dayIndex < advancedProgramForm.daysPerWeek; dayIndex++) {
        const dayName = daysOfWeek[dayIndex];
        const dayExercises = advancedProgramForm.exercises.filter(ex => 
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
          focus: dayExercises.length > 0 ? `${ex.type} Training` : 'Rest Day',
          exercises: dayExercises.length > 0 ? dayExercises : [
            { name: 'Complete Rest', sets: 1, reps: 'All day', notes: 'Recovery', type: 'recovery' as Exercise['type'] }
          ]
        });
      }

      weeks.push({
        week: `Week ${weekNum}`,
        focus: advancedProgramForm.weekFocus || `Week ${weekNum} Training`,
        days
      });
    }

    const newProgram: Program = {
      month: advancedProgramForm.month,
      weeks
    };

    const updatedPrograms = [...allPrograms, newProgram];
    onProgramUpdate(updatedPrograms);

    // Reset form
    setAdvancedProgramForm({
      month: '',
      weekFocus: '',
      weeks: 1,
      daysPerWeek: 7,
      exercises: []
    });
    setShowAdvancedCreation(false);

    alert(`תוכנית מתקדמת "${advancedProgramForm.month}" נוצרה בהצלחה!`);
  };

  const addExerciseToAdvanced = () => {
    setAdvancedProgramForm({
      ...advancedProgramForm,
      exercises: [...advancedProgramForm.exercises, {
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

  const updateAdvancedExercise = (index: number, field: string, value: any) => {
    const updatedExercises = [...advancedProgramForm.exercises];
    updatedExercises[index] = { ...updatedExercises[index], [field]: value };
    setAdvancedProgramForm({ ...advancedProgramForm, exercises: updatedExercises });
  };

  const removeAdvancedExercise = (index: number) => {
    const updatedExercises = advancedProgramForm.exercises.filter((_, i) => i !== index);
    setAdvancedProgramForm({ ...advancedProgramForm, exercises: updatedExercises });
  };

  const toggleDayForExercise = (exerciseIndex: number, day: string) => {
    const exercise = advancedProgramForm.exercises[exerciseIndex];
    const updatedDays = exercise.days.includes(day)
      ? exercise.days.filter(d => d !== day)
      : [...exercise.days, day];
    
    updateAdvancedExercise(exerciseIndex, 'days', updatedDays);
  };

  // Check if program exists and has valid structure
  if (!program || !program.weeks || program.weeks.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
            תוכנית אימונים
            {isAdmin && <span className="ml-2 text-orange-400 text-xs sm:text-sm">(👑 מצב אדמין)</span>}
          </h2>
          <p className="text-slate-300 text-sm sm:text-base">
            לא נמצאה תוכנית אימונים לחודש הנבחר
          </p>
        </div>

        {/* Admin Controls for No Program */}
        {isAdmin && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20">
            <div className="text-center space-y-4">
              <h3 className="text-white font-semibold text-base sm:text-lg mb-4">ניהול תוכניות</h3>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => setShowCreateProgram(true)}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-semibold transition-colors text-sm sm:text-base"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>צור תוכנית פשוטה</span>
                </button>
                <button
                  onClick={() => setShowAdvancedCreation(true)}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl font-semibold transition-colors text-sm sm:text-base"
                >
                  <Target className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>צור תוכנית מתקדמת</span>
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
          <div className="text-6xl mb-4">🏋️‍♂️</div>
          <h3 className="text-white font-semibold text-lg mb-2">אין תוכנית זמינה</h3>
          <p className="text-slate-400 text-sm">
            {isAdmin ? 'צור תוכנית חדשה או בחר חודש אחר' : 'בחר חודש אחר או פנה למאמן'}
          </p>
        </div>

        {/* Simple Create Program Modal */}
        {isAdmin && showCreateProgram && (
          <CreateProgramModal 
            newProgramForm={newProgramForm}
            setNewProgramForm={setNewProgramForm}
            allPrograms={allPrograms}
            onCreateProgram={createNewProgram}
            onClose={() => setShowCreateProgram(false)}
          />
        )}

        {/* Advanced Create Program Modal */}
        {isAdmin && showAdvancedCreation && (
          <AdvancedCreateProgramModal
            form={advancedProgramForm}
            setForm={setAdvancedProgramForm}
            exerciseTypes={exerciseTypes}
            commonExercises={commonExercises}
            daysOfWeek={daysOfWeek}
            onCreateProgram={createAdvancedProgram}
            onClose={() => setShowAdvancedCreation(false)}
            onAddExercise={addExerciseToAdvanced}
            onUpdateExercise={updateAdvancedExercise}
            onRemoveExercise={removeAdvancedExercise}
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
    if (window.confirm(`האם אתה בטוח שברצונך למחוק את תוכנית "${month}"?`)) {
      const updatedPrograms = allPrograms.filter(p => p.month !== month);
      onProgramUpdate(updatedPrograms);
      alert(`תוכנית "${month}" נמחקה בהצלחה`);
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
    if (window.confirm('האם אתה בטוח שברצונך למחוק את התרגיל?')) {
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

  const getFilteredExercises = (exercises: Exercise[]) => {
    if (selectedExerciseType === 'all') return exercises;
    return exercises.filter(exercise => exercise.type === selectedExerciseType);
  };

  // Additional safety check for selectedWeek
  if (selectedWeek >= program.weeks.length) {
    setSelectedWeek(0);
    return null;
  }

  const currentWeek = program.weeks[selectedWeek];
  
  // Safety check for currentWeek
  if (!currentWeek || !currentWeek.days) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
            תוכנית אימונים - {program.month}
          </h2>
          <p className="text-slate-300 text-sm sm:text-base">
            שגיאה בטעינת השבוע הנבחר
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
          תוכנית אימונים - {program.month}
          {isAdmin && <span className="ml-2 text-orange-400 text-xs sm:text-sm">(👑 מצב אדמין)</span>}
        </h2>
        <p className="text-slate-300 text-sm sm:text-base">
          {isAdmin ? 'ערוך את תוכנית האימונים שלך' : 'תוכנית האימונים המובנית שלך להשגת תוצאות מקסימליות'}
        </p>
      </div>

      {/* Admin Controls */}
      {isAdmin && (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-semibold text-base sm:text-lg">ניהול תוכניות</h3>
              <p className="text-slate-300 text-xs sm:text-sm">צור תוכניות אימון חדשות או ערוך קיימות</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowCreateProgram(true)}
                className="flex items-center space-x-1 sm:space-x-2 bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>צור פשוטה</span>
              </button>
              <button
                onClick={() => setShowAdvancedCreation(true)}
                className="flex items-center space-x-1 sm:space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base"
              >
                <Target className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>צור מתקדמת</span>
              </button>
              <button
                onClick={() => handleDeleteProgram(program.month)}
                className="flex items-center space-x-1 sm:space-x-2 bg-red-600 hover:bg-red-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base"
              >
                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>מחק</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Week Selector */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
        <div className="flex items-center justify-between mb-3">
          <label className="flex items-center text-slate-300 font-medium text-xs sm:text-sm">
            <Calendar className="w-4 h-4 mr-2" />
            בחר שבוע:
          </label>
          <div className="flex items-center space-x-2">
            {program.weeks.map((week, index) => (
              <button
                key={index}
                onClick={() => setSelectedWeek(index)}
                className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all text-xs sm:text-sm ${
                  selectedWeek === index
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
                }`}
              >
                {week.week}
              </button>
            ))}
          </div>
        </div>
        
        <div className="text-center">
          <h3 className="text-white font-semibold text-base sm:text-lg">{currentWeek.focus}</h3>
        </div>
      </div>

      {/* Exercise Type Filter (Admin Only) */}
      {isAdmin && (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
          <div className="flex items-center mb-3">
            <Filter className="w-4 h-4 text-slate-300 mr-2" />
            <span className="text-slate-300 font-medium text-xs sm:text-sm">סנן לפי סוג תרגיל:</span>
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

      {/* Days Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {currentWeek.days.map((day, dayIndex) => {
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
              className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:scale-[1.02]"
            >
              <div className={`bg-gradient-to-r ${gradientColor} rounded-lg p-2 sm:p-3 mb-3 sm:mb-4`}>
                <div className="flex items-center justify-between text-white">
                  <h3 className="font-bold text-base sm:text-lg">{day.day}</h3>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <p className="text-white/90 text-xs sm:text-sm mt-1">{day.focus}</p>
              </div>

              <div className="space-y-3">
                {(isAdmin ? filteredExercises : day.exercises).map((exercise, exerciseIndex) => {
                  const actualExerciseIndex = isAdmin ? day.exercises.findIndex(e => e === exercise) : exerciseIndex;
                  
                  return (
                    <div
                      key={actualExerciseIndex}
                      className={`bg-white/5 rounded-lg p-2 sm:p-3 border border-white/10 group relative ${
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
                        <div className="absolute top-1 right-1 sm:top-2 sm:right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => startEditingExercise(selectedWeek, dayIndex, actualExerciseIndex)}
                            className="p-0.5 sm:p-1 bg-blue-600 hover:bg-blue-700 rounded text-white"
                          >
                            <Edit3 className="w-2 h-2 sm:w-3 sm:h-3" />
                          </button>
                          <button
                            onClick={() => deleteExercise(selectedWeek, dayIndex, actualExerciseIndex)}
                            className="p-0.5 sm:p-1 bg-red-600 hover:bg-red-700 rounded text-white"
                          >
                            <Trash2 className="w-2 h-2 sm:w-3 sm:h-3" />
                          </button>
                        </div>
                      )}

                      {editingExercise?.weekIndex === selectedWeek && editingExercise?.dayIndex === dayIndex && editingExercise?.exerciseIndex === actualExerciseIndex ? (
                        <div className="space-y-2">
                          <select
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="w-full px-2 py-1 bg-slate-700 text-white rounded text-xs sm:text-sm"
                          >
                            {commonExercises.map(ex => (
                              <option key={ex} value={ex}>{ex}</option>
                            ))}
                          </select>
                          <select
                            value={editForm.type}
                            onChange={(e) => setEditForm({ ...editForm, type: e.target.value as Exercise['type'] })}
                            className="w-full px-2 py-1 bg-slate-700 text-white rounded text-xs sm:text-sm"
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
                              className="px-2 py-1 bg-slate-700 text-white rounded text-xs sm:text-sm"
                              placeholder="סטים"
                            />
                            <input
                              type="text"
                              value={editForm.reps}
                              onChange={(e) => setEditForm({ ...editForm, reps: e.target.value })}
                              className="px-2 py-1 bg-slate-700 text-white rounded text-xs sm:text-sm"
                              placeholder="חזרות"
                            />
                          </div>
                          <input
                            type="text"
                            value={editForm.weight}
                            onChange={(e) => setEditForm({ ...editForm, weight: e.target.value })}
                            className="w-full px-2 py-1 bg-slate-700 text-white rounded text-xs sm:text-sm"
                            placeholder="משקל/אחוז (למשל: 70% 1RM)"
                          />
                          <input
                            type="text"
                            value={editForm.restTime}
                            onChange={(e) => setEditForm({ ...editForm, restTime: e.target.value })}
                            className="w-full px-2 py-1 bg-slate-700 text-white rounded text-xs sm:text-sm"
                            placeholder="זמן מנוחה"
                          />
                          <textarea
                            value={editForm.notes}
                            onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                            className="w-full px-2 py-1 bg-slate-700 text-white rounded text-xs sm:text-sm"
                            placeholder="הערות"
                            rows={2}
                          />
                          <div className="flex space-x-2">
                            <button
                              onClick={saveExercise}
                              className="flex items-center space-x-1 px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs sm:text-sm"
                            >
                              <Save className="w-2 h-2 sm:w-3 sm:h-3" />
                              <span>שמור</span>
                            </button>
                            <button
                              onClick={() => setEditingExercise(null)}
                              className="flex items-center space-x-1 px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs sm:text-sm"
                            >
                              <X className="w-2 h-2 sm:w-3 sm:h-3" />
                              <span>בטל</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Exercise Header with Image and Type Badge */}
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-md overflow-hidden bg-white/20 flex items-center justify-center flex-shrink-0">
                              <img 
                                src={getExerciseImage(exercise.name)} 
                                alt={exercise.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.nextElementSibling!.classList.remove('hidden');
                                }}
                              />
                              <div className="text-xs sm:text-sm hidden">
                                {getExerciseIcon(exercise.name)}
                              </div>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-white text-xs sm:text-sm">
                                {exercise.name}
                              </h4>
                              {exercise.type && (
                                <span className={`inline-block px-1 py-0.5 rounded text-xs ${
                                  exerciseTypes.find(t => t.value === exercise.type)?.color || 'bg-gray-600'
                                } text-white mt-1`}>
                                  {exerciseTypes.find(t => t.value === exercise.type)?.icon} {exerciseTypes.find(t => t.value === exercise.type)?.label}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-blue-300 text-xs font-medium">
                              {exercise.sets} × {exercise.reps}
                            </span>
                            {exercise.weight && (
                              <span className="text-green-300 text-xs">
                                {exercise.weight}
                              </span>
                            )}
                          </div>
                          {exercise.restTime && (
                            <p className="text-slate-400 text-xs mt-1">
                              מנוחה: {exercise.restTime}
                            </p>
                          )}
                          {exercise.notes && (
                            <p className="text-slate-400 text-xs mt-1 italic">
                              {exercise.notes}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}

                {!isAdmin && onExerciseSelect && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-slate-400 text-xs text-center">
                      לחץ על כל תרגיל למעלה כדי להוסיף אותו לרישום האימון שלך
                    </p>
                  </div>
                )}

                {isAdmin && (
                  <button
                    onClick={() => addExercise(selectedWeek, dayIndex)}
                    className="w-full flex items-center justify-center space-x-1 sm:space-x-2 p-2 sm:p-3 border-2 border-dashed border-white/30 rounded-lg text-white/70 hover:text-white hover:border-white/50 transition-all text-xs sm:text-sm"
                  >
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>הוסף תרגיל</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Simple Create Program Modal */}
      {isAdmin && showCreateProgram && (
        <CreateProgramModal 
          newProgramForm={newProgramForm}
          setNewProgramForm={setNewProgramForm}
          allPrograms={allPrograms}
          onCreateProgram={createNewProgram}
          onClose={() => setShowCreateProgram(false)}
        />
      )}

      {/* Advanced Create Program Modal */}
      {isAdmin && showAdvancedCreation && (
        <AdvancedCreateProgramModal
          form={advancedProgramForm}
          setForm={setAdvancedProgramForm}
          exerciseTypes={exerciseTypes}
          commonExercises={commonExercises}
          daysOfWeek={daysOfWeek}
          onCreateProgram={createAdvancedProgram}
          onClose={() => setShowAdvancedCreation(false)}
          onAddExercise={addExerciseToAdvanced}
          onUpdateExercise={updateAdvancedExercise}
          onRemoveExercise={removeAdvancedExercise}
          onToggleDay={toggleDayForExercise}
        />
      )}
    </div>
  );
}

// Component for Simple Create Program Modal
function CreateProgramModal({ 
  newProgramForm, 
  setNewProgramForm, 
  allPrograms, 
  onCreateProgram, 
  onClose 
}: {
  newProgramForm: { month: string; weekFocus: string; copyFrom: string };
  setNewProgramForm: (form: { month: string; weekFocus: string; copyFrom: string }) => void;
  allPrograms: Program[];
  onCreateProgram: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md border border-white/20">
        <h3 className="text-white font-semibold text-lg mb-4">צור תוכנית פשוטה</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-slate-300 font-medium mb-2">שם החודש</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="למשל: November"
              value={newProgramForm.month}
              onChange={(e) => setNewProgramForm({ ...newProgramForm, month: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-2">מיקוד השבוע</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="למשל: Strength Building"
              value={newProgramForm.weekFocus}
              onChange={(e) => setNewProgramForm({ ...newProgramForm, weekFocus: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-2">העתק מתוכנית קיימת (אופציונלי)</label>
            <select
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={newProgramForm.copyFrom}
              onChange={(e) => setNewProgramForm({ ...newProgramForm, copyFrom: e.target.value })}
            >
              <option value="">צור תוכנית ריקה</option>
              {allPrograms.map(p => (
                <option key={p.month} value={p.month}>{p.month}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex space-x-4 mt-6">
          <button
            onClick={onCreateProgram}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex-1"
          >
            <Save className="w-4 h-4" />
            <span>צור תוכנית</span>
          </button>
          <button
            onClick={onClose}
            className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            <span>בטל</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Component for Advanced Create Program Modal
function AdvancedCreateProgramModal({
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
}: {
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
}) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-slate-800 rounded-xl p-6 w-full max-w-4xl border border-white/20 max-h-[90vh] overflow-y-auto">
        <h3 className="text-white font-semibold text-xl mb-6">צור תוכנית מתקדמת</h3>
        
        {/* Basic Program Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-slate-300 font-medium mb-2">שם החודש</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="למשל: November"
              value={form.month}
              onChange={(e) => setForm({ ...form, month: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-2">מיקוד התוכנית</label>
            <input
              type="text"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="למשל: Strength Building"
              value={form.weekFocus}
              onChange={(e) => setForm({ ...form, weekFocus: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-2">מספר שבועות</label>
            <input
              type="number"
              min="1"
              max="8"
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={form.weeks}
              onChange={(e) => setForm({ ...form, weeks: parseInt(e.target.value) })}
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-2">ימים בשבוע</label>
            <select
              className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={form.daysPerWeek}
              onChange={(e) => setForm({ ...form, daysPerWeek: parseInt(e.target.value) })}
            >
              <option value={3}>3 ימים</option>
              <option value={4}>4 ימים</option>
              <option value={5}>5 ימים</option>
              <option value={6}>6 ימים</option>
              <option value={7}>7 ימים</option>
            </select>
          </div>
        </div>

        {/* Exercises Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-white font-semibold text-lg">תרגילים</h4>
            <button
              onClick={onAddExercise}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>הוסף תרגיל</span>
            </button>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {form.exercises.map((exercise: any, index: number) => (
              <div key={index} className="bg-slate-700 rounded-lg p-4 border border-slate-600">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="text-white font-medium">תרגיל #{index + 1}</h5>
                  <button
                    onClick={() => onRemoveExercise(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-slate-300 text-sm mb-1">תרגיל</label>
                    <select
                      className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm"
                      value={exercise.name}
                      onChange={(e) => onUpdateExercise(index, 'name', e.target.value)}
                    >
                      {commonExercises.map(ex => (
                        <option key={ex} value={ex}>{ex}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 text-sm mb-1">סוג</label>
                    <select
                      className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm"
                      value={exercise.type}
                      onChange={(e) => onUpdateExercise(index, 'type', e.target.value)}
                    >
                      {exerciseTypes.slice(1).map(type => (
                        <option key={type.value} value={type.value}>
                          {type.icon} {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 text-sm mb-1">סטים</label>
                    <input
                      type="number"
                      min="1"
                      className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm"
                      value={exercise.sets}
                      onChange={(e) => onUpdateExercise(index, 'sets', parseInt(e.target.value))}
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 text-sm mb-1">חזרות</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm"
                      placeholder="8-10"
                      value={exercise.reps}
                      onChange={(e) => onUpdateExercise(index, 'reps', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 text-sm mb-1">משקל/אחוז</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm"
                      placeholder="70% 1RM"
                      value={exercise.weight}
                      onChange={(e) => onUpdateExercise(index, 'weight', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 text-sm mb-1">זמן מנוחה</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm"
                      placeholder="2-3 min"
                      value={exercise.restTime}
                      onChange={(e) => onUpdateExercise(index, 'restTime', e.target.value)}
                    />
                  </div>
                </div>

                {/* Days Selection */}
                <div>
                  <label className="block text-slate-300 text-sm mb-2">ימים לביצוע</label>
                  <div className="flex flex-wrap gap-2">
                    {daysOfWeek.slice(0, form.daysPerWeek).map(day => (
                      <button
                        key={day}
                        onClick={() => onToggleDay(index, day)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
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
        <div className="flex space-x-4">
          <button
            onClick={onCreateProgram}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors flex-1"
          >
            <Target className="w-4 h-4" />
            <span>צור תוכנית מתקדמת</span>
          </button>
          <button
            onClick={onClose}
            className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            <span>בטל</span>
          </button>
        </div>
      </div>
    </div>
  );
}