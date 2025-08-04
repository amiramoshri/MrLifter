import React, { useState } from 'react';
import { Clock, Target, Zap, Edit3, Save, X, Plus, Trash2, ArrowRight } from 'lucide-react';
import { Program } from '../types';

interface ProgramViewerProps {
  program: Program;
  isAdmin: boolean;
  onProgramUpdate: (programs: Program[]) => void;
  allPrograms: Program[];
  onExerciseSelect?: (exercise: { name: string; sets: number; reps: string; weight?: string }) => void;
}

export default function ProgramViewer({ program, isAdmin, onProgramUpdate, allPrograms, onExerciseSelect }: ProgramViewerProps) {
  const [editingDay, setEditingDay] = useState<number | null>(null);
  const [editingExercise, setEditingExercise] = useState<{ dayIndex: number; exerciseIndex: number } | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    sets: 0,
    reps: '',
    weight: '',
    restTime: '',
    notes: ''
  });

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

  const startEditingExercise = (dayIndex: number, exerciseIndex: number) => {
    const exercise = program.plan[dayIndex].exercises[exerciseIndex];
    setEditForm({
      name: exercise.name,
      sets: exercise.sets,
      reps: exercise.reps,
      weight: exercise.weight || '',
      restTime: exercise.restTime || '',
      notes: exercise.notes || ''
    });
    setEditingExercise({ dayIndex, exerciseIndex });
  };

  const saveExercise = () => {
    if (!editingExercise) return;

    const updatedPrograms = allPrograms.map(p => {
      if (p.month === program.month) {
        const updatedPlan = [...p.plan];
        updatedPlan[editingExercise.dayIndex].exercises[editingExercise.exerciseIndex] = {
          ...editForm,
          weight: editForm.weight || undefined,
          restTime: editForm.restTime || undefined,
          notes: editForm.notes || undefined
        };
        return { ...p, plan: updatedPlan };
      }
      return p;
    });

    onProgramUpdate(updatedPrograms);
    setEditingExercise(null);
  };

  const addExercise = (dayIndex: number) => {
    const newExercise = {
      name: 'New Exercise',
      sets: 3,
      reps: '10',
      weight: '',
      restTime: '90 sec',
      notes: ''
    };

    const updatedPrograms = allPrograms.map(p => {
      if (p.month === program.month) {
        const updatedPlan = [...p.plan];
        updatedPlan[dayIndex].exercises.push(newExercise);
        return { ...p, plan: updatedPlan };
      }
      return p;
    });

    onProgramUpdate(updatedPrograms);
  };

  const deleteExercise = (dayIndex: number, exerciseIndex: number) => {
    const updatedPrograms = allPrograms.map(p => {
      if (p.month === program.month) {
        const updatedPlan = [...p.plan];
        updatedPlan[dayIndex].exercises.splice(exerciseIndex, 1);
        return { ...p, plan: updatedPlan };
      }
      return p;
    });

    onProgramUpdate(updatedPrograms);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
          Training Program - {program.month}
          {isAdmin && <span className="ml-2 text-orange-400 text-xs sm:text-sm">(👑 Admin Mode)</span>}
        </h2>
        <p className="text-slate-300 text-sm sm:text-base">
          {isAdmin ? 'Edit your training program' : 'Your structured workout plan for maximum results'}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {program.plan.map((day, index) => {
          const Icon = getFocusIcon(day.focus);
          const gradientColor = getFocusColor(day.focus);

          return (
            <div
              key={index}
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
                {day.exercises.map((exercise, exerciseIndex) => (
                  <div
                    key={exerciseIndex}
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
                          onClick={() => startEditingExercise(index, exerciseIndex)}
                          className="p-0.5 sm:p-1 bg-blue-600 hover:bg-blue-700 rounded text-white"
                        >
                          <Edit3 className="w-2 h-2 sm:w-3 sm:h-3" />
                        </button>
                        <button
                          onClick={() => deleteExercise(index, exerciseIndex)}
                          className="p-0.5 sm:p-1 bg-red-600 hover:bg-red-700 rounded text-white"
                        >
                          <Trash2 className="w-2 h-2 sm:w-3 sm:h-3" />
                        </button>
                      </div>
                    )}

                    {isAdmin && (
                      <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEditingExercise(index, exerciseIndex)}
                          className="p-1 bg-blue-600 hover:bg-blue-700 rounded text-white"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => deleteExercise(index, exerciseIndex)}
                          className="p-1 bg-red-600 hover:bg-red-700 rounded text-white"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    {editingExercise?.dayIndex === index && editingExercise?.exerciseIndex === exerciseIndex ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full px-2 py-1 bg-slate-700 text-white rounded text-xs sm:text-sm"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="number"
                            value={editForm.sets}
                            onChange={(e) => setEditForm({ ...editForm, sets: parseInt(e.target.value) })}
                            className="px-2 py-1 bg-slate-700 text-white rounded text-xs sm:text-sm"
                            placeholder="Sets"
                          />
                          <input
                            type="text"
                            value={editForm.reps}
                            onChange={(e) => setEditForm({ ...editForm, reps: e.target.value })}
                            className="px-2 py-1 bg-slate-700 text-white rounded text-xs sm:text-sm"
                            placeholder="Reps"
                          />
                        </div>
                        <input
                          type="text"
                          value={editForm.weight}
                          onChange={(e) => setEditForm({ ...editForm, weight: e.target.value })}
                          className="w-full px-2 py-1 bg-slate-700 text-white rounded text-xs sm:text-sm"
                          placeholder="Weight"
                        />
                        <input
                          type="text"
                          value={editForm.restTime}
                          onChange={(e) => setEditForm({ ...editForm, restTime: e.target.value })}
                          className="w-full px-2 py-1 bg-slate-700 text-white rounded text-xs sm:text-sm"
                          placeholder="Rest Time"
                        />
                        <textarea
                          value={editForm.notes}
                          onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                          className="w-full px-2 py-1 bg-slate-700 text-white rounded text-xs sm:text-sm"
                          placeholder="Notes"
                          rows={2}
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={saveExercise}
                            className="flex items-center space-x-1 px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs sm:text-sm"
                          >
                            <Save className="w-2 h-2 sm:w-3 sm:h-3" />
                            <span>Save</span>
                          </button>
                          <button
                            onClick={() => setEditingExercise(null)}
                            className="flex items-center space-x-1 px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs sm:text-sm"
                          >
                            <X className="w-2 h-2 sm:w-3 sm:h-3" />
                            <span>Cancel</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                    <h4 className="font-semibold text-white text-xs sm:text-sm">{exercise.name}</h4>
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
                        Rest: {exercise.restTime}
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
                ))}

                {!isAdmin && onExerciseSelect && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-slate-400 text-xs text-center">
                      Click any exercise above to add it to your workout log
                    </p>
                  </div>
                )}

                {isAdmin && (
                  <button
                    onClick={() => addExercise(index)}
                    className="w-full flex items-center justify-center space-x-1 sm:space-x-2 p-2 sm:p-3 border-2 border-dashed border-white/30 rounded-lg text-white/70 hover:text-white hover:border-white/50 transition-all text-xs sm:text-sm"
                  >
                    <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Add Exercise</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}