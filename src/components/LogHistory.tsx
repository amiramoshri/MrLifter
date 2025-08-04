import React, { useState } from 'react';
import { Edit2, Trash2, Save, X } from 'lucide-react';
import { WorkoutLog } from '../types';

interface LogHistoryProps {
  logs: WorkoutLog[];
  onLogUpdate: (id: string, updatedLog: Partial<WorkoutLog>) => void;
  onLogDelete: (id: string) => void;
}

const LogHistory: React.FC<LogHistoryProps> = ({ logs, onLogUpdate, onLogDelete }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<WorkoutLog>>({});

  const exercises = [
    'Bench Press', 'Squat', 'Deadlift', 'Overhead Press', 'Barbell Row',
    'Pull-ups', 'Dips', 'Bicep Curls', 'Tricep Extensions', 'Lateral Raises',
    'Leg Press', 'Leg Curls', 'Leg Extensions', 'Calf Raises', 'Lunges',
    'Push-ups', 'Plank', 'Burpees', 'Mountain Climbers', 'Jumping Jacks'
  ];

  const startEdit = (log: WorkoutLog) => {
    setEditingId(log.id);
    setEditForm({
      exercise: log.exercise,
      weight: log.weight,
      sets: log.sets,
      reps: log.reps,
      notes: log.notes || '',
      duration: log.duration || undefined
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = () => {
    if (editingId && editForm) {
      onLogUpdate(editingId, editForm);
      setEditingId(null);
      setEditForm({});
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this workout log?')) {
      onLogDelete(id);
    }
  };

  if (logs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No workout logs yet. Start logging your workouts!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Workout History</h3>
      {logs.map((log) => (
        <div
          key={log.id}
          className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow group"
        >
          {editingId === log.id ? (
            // Edit form
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Exercise
                  </label>
                  <select
                    value={editForm.exercise || ''}
                    onChange={(e) => setEditForm({ ...editForm, exercise: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select exercise</option>
                    {exercises.map((exercise) => (
                      <option key={exercise} value={exercise}>
                        {exercise}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={editForm.weight || ''}
                    onChange={(e) => setEditForm({ ...editForm, weight: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sets
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editForm.sets || ''}
                    onChange={(e) => setEditForm({ ...editForm, sets: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reps
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editForm.reps || ''}
                    onChange={(e) => setEditForm({ ...editForm, reps: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editForm.duration || ''}
                    onChange={(e) => setEditForm({ ...editForm, duration: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={editForm.notes || ''}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={saveEdit}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
                <button
                  onClick={cancelEdit}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            // Display mode
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-4 mb-2">
                  <h4 className="font-semibold text-gray-800">{log.exercise}</h4>
                  <span className="text-sm text-gray-500">
                    {new Date(log.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Weight:</span> {log.weight} kg
                  </div>
                  <div>
                    <span className="font-medium">Sets:</span> {log.sets}
                  </div>
                  <div>
                    <span className="font-medium">Reps:</span> {log.reps}
                  </div>
                  {log.duration && (
                    <div>
                      <span className="font-medium">Duration:</span> {log.duration} min
                    </div>
                  )}
                </div>
                {log.notes && (
                  <div className="mt-2 text-sm text-gray-600">
                    <span className="font-medium">Notes:</span> {log.notes}
                  </div>
                )}
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => startEdit(log)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  title="Edit workout"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(log.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  title="Delete workout"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default LogHistory;