import React, { useState, useEffect } from 'react';
import { Target, Plus, Edit3, Trash2, Save, X, CheckCircle, Calendar, TrendingUp, Award } from 'lucide-react';
import { Goal } from '../types';
import { getGoalsFromSupabase, saveGoalToSupabase, updateGoalInSupabase, deleteGoalFromSupabase } from '../utils/supabase-storage';

interface GoalsPanelProps {
  userId: string;
}

export default function GoalsPanel({ userId }: GoalsPanelProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetValue: '',
    currentValue: '',
    unit: 'ק"ג',
    category: 'strength' as Goal['category'],
    targetDate: ''
  });

  const categories = [
    { value: 'weight', label: 'משקל גוף', icon: '⚖️', color: 'bg-blue-600' },
    { value: 'strength', label: 'כוח', icon: '💪', color: 'bg-red-600' },
    { value: 'endurance', label: 'סיבולת', icon: '🏃', color: 'bg-green-600' },
    { value: 'body', label: 'מבנה גוף', icon: '🎯', color: 'bg-purple-600' },
    { value: 'custom', label: 'אישי', icon: '⭐', color: 'bg-orange-600' }
  ];

  useEffect(() => {
    loadGoals();
  }, [userId]);

  const loadGoals = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const userGoals = await getGoalsFromSupabase();
      setGoals(userGoals);
    } catch (err) {
      console.error('Error loading goals:', err);
      setError('שגיאה בטעינת המטרות');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      targetValue: '',
      currentValue: '',
      unit: 'ק"ג',
      category: 'strength',
      targetDate: ''
    });
    setShowAddForm(false);
    setEditingGoal(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.targetValue || !formData.targetDate) return;

    try {
      const goalData = {
        title: formData.title,
        description: formData.description || undefined,
        targetValue: parseFloat(formData.targetValue),
        currentValue: parseFloat(formData.currentValue) || 0,
        unit: formData.unit,
        category: formData.category,
        targetDate: formData.targetDate,
        isCompleted: false
      };

      if (editingGoal) {
        const updatedGoal = await updateGoalInSupabase(editingGoal, goalData);
        if (updatedGoal) {
          setGoals(prevGoals => 
            prevGoals.map(g => g.id === editingGoal ? updatedGoal : g)
          );
        } else {
          setError('שגיאה בעדכון המטרה');
        }
      } else {
        const savedGoal = await saveGoalToSupabase(goalData);
        if (savedGoal) {
          setGoals(prevGoals => [savedGoal, ...prevGoals]);
        } else {
          setError('שגיאה בשמירת המטרה');
        }
      }

      resetForm();
    } catch (err) {
      console.error('Error saving goal:', err);
      setError('שגיאה בשמירת המטרה');
    }
  };

  const handleEdit = (goal: Goal) => {
    setFormData({
      title: goal.title,
      description: goal.description || '',
      targetValue: goal.targetValue.toString(),
      currentValue: goal.currentValue.toString(),
      unit: goal.unit,
      category: goal.category,
      targetDate: goal.targetDate
    });
    setEditingGoal(goal.id);
    setShowAddForm(true);
  };

  const handleDelete = async (goalId: string) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את המטרה?')) {
      try {
        const success = await deleteGoalFromSupabase(goalId);
        if (success) {
          setGoals(prevGoals => prevGoals.filter(g => g.id !== goalId));
        } else {
          setError('שגיאה במחיקת המטרה');
        }
      } catch (err) {
        console.error('Error deleting goal:', err);
        setError('שגיאה במחיקת המטרה');
      }
    }
  };

  const handleUpdateProgress = async (goalId: string, newValue: number) => {
    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;

      const isCompleted = newValue >= goal.targetValue;
      const updatedGoal = await updateGoalInSupabase(goalId, { 
        currentValue: newValue,
        isCompleted 
      });
      
      if (updatedGoal) {
        setGoals(prevGoals => 
          prevGoals.map(g => g.id === goalId ? updatedGoal : g)
        );
      } else {
        setError('שגיאה בעדכון ההתקדמות');
      }
    } catch (err) {
      console.error('Error updating progress:', err);
      setError('שגיאה בעדכון ההתקדמות');
    }
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getCategoryData = (category: Goal['category']) => {
    return categories.find(c => c.value === category) || categories[0];
  };

  const getDaysRemaining = (targetDate: string) => {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto text-center px-2 sm:px-0">
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-12 border border-white/20">
          <div className="animate-spin w-8 h-8 sm:w-12 sm:h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white font-medium text-sm sm:text-base">טוען מטרות...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-2 sm:px-0">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">מטרות אישיות</h2>
        <p className="text-slate-300 text-sm sm:text-base">הגדר יעדים ועקוב אחר ההתקדמות שלך</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-600/20 border border-red-600/50 rounded-lg p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <p className="text-red-200 text-xs sm:text-sm">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-200 hover:text-white text-xs sm:text-sm"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Add Goal Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center space-x-1 sm:space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base"
        >
          <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
          <span>הוסף מטרה</span>
        </button>
      </div>

      {/* Add/Edit Goal Form */}
      {showAddForm && (
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20">
          <h3 className="text-white font-semibold text-base sm:text-lg mb-4">
            {editingGoal ? 'ערוך מטרה' : 'הוסף מטרה חדשה'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-slate-300 font-medium mb-2 text-sm sm:text-base">כותרת</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="לדוגמה: הגעה ל-100 ק״ג בספסל"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-2 text-sm sm:text-base">קטגוריה</label>
                <select
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as Goal['category'] })}
                >
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.icon} {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-slate-300 font-medium mb-2 text-sm sm:text-base">ערך יעד</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="100"
                  value={formData.targetValue}
                  onChange={(e) => setFormData({ ...formData, targetValue: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-2 text-sm sm:text-base">ערך נוכחי</label>
                <input
                  type="number"
                  step="0.1"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="80"
                  value={formData.currentValue}
                  onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-2 text-sm sm:text-base">יחידה</label>
                <select
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                >
                  <option value="ק״ג">ק״ג</option>
                  <option value="פעמים">פעמים</option>
                  <option value="דקות">דקות</option>
                  <option value="ס״מ">ס״מ</option>
                  <option value="%">%</option>
                  <option value="ימים">ימים</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-2 text-sm sm:text-base">תאריך יעד</label>
              <input
                type="date"
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                value={formData.targetDate}
                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-2 text-sm sm:text-base">תיאור (אופציונלי)</label>
              <textarea
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm sm:text-base"
                placeholder="פרטים נוספים על המטרה..."
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <button
                type="submit"
                className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-colors text-sm sm:text-base"
              >
                <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{editingGoal ? 'עדכן מטרה' : 'הוסף מטרה'}</span>
              </button>
              
              <button
                type="button"
                onClick={resetForm}
                className="flex items-center justify-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-colors text-sm sm:text-base"
              >
                <X className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>ביטול</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-12 border border-white/20">
            <Target className="w-12 h-12 sm:w-16 sm:h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">אין מטרות עדיין</h3>
            <p className="text-slate-300 text-sm sm:text-base">הוסף מטרות כדי לעקוב אחר ההתקדמות שלך!</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map((goal) => {
            const categoryData = getCategoryData(goal.category);
            const progressPercentage = getProgressPercentage(goal.currentValue, goal.targetValue);
            const daysRemaining = getDaysRemaining(goal.targetDate);
            const isOverdue = daysRemaining < 0;
            const isCompleted = goal.isCompleted;

            return (
              <div
                key={goal.id}
                className={`bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden hover:bg-white/15 transition-all duration-300 transform hover:scale-[1.02] group ${
                  isCompleted ? 'ring-2 ring-green-500' : ''
                }`}
              >
                {/* Header */}
                <div className={`${categoryData.color} p-3 sm:p-4`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{categoryData.icon}</span>
                      <span className="text-white font-medium text-xs sm:text-sm">{categoryData.label}</span>
                    </div>
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(goal)}
                        className="p-1 bg-white/20 hover:bg-white/30 rounded text-white"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleDelete(goal.id)}
                        className="p-1 bg-white/20 hover:bg-white/30 rounded text-white"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-3 sm:p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-white text-sm sm:text-base line-clamp-2 flex-1">
                      {goal.title}
                    </h3>
                    {isCompleted && (
                      <CheckCircle className="w-5 h-5 text-green-500 ml-2 flex-shrink-0" />
                    )}
                  </div>

                  {goal.description && (
                    <p className="text-slate-300 text-xs sm:text-sm mb-3 line-clamp-2">
                      {goal.description}
                    </p>
                  )}

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-300 text-xs sm:text-sm">התקדמות</span>
                      <span className="text-white font-semibold text-xs sm:text-sm">
                        {goal.currentValue} / {goal.targetValue} {goal.unit}
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          isCompleted ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                    <div className="text-center mt-1">
                      <span className={`text-xs font-medium ${
                        isCompleted ? 'text-green-400' : 'text-blue-400'
                      }`}>
                        {Math.round(progressPercentage)}%
                      </span>
                    </div>
                  </div>

                  {/* Update Progress */}
                  {!isCompleted && (
                    <div className="mb-4">
                      <label className="block text-slate-300 text-xs mb-1">עדכן התקדמות:</label>
                      <div className="flex space-x-2">
                        <input
                          type="number"
                          step="0.1"
                          className="flex-1 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-xs"
                          placeholder={goal.currentValue.toString()}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              const value = parseFloat((e.target as HTMLInputElement).value);
                              if (!isNaN(value)) {
                                handleUpdateProgress(goal.id, value);
                                (e.target as HTMLInputElement).value = '';
                              }
                            }
                          }}
                        />
                        <span className="text-slate-400 text-xs self-center">{goal.unit}</span>
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span className="text-slate-400">
                        {new Date(goal.targetDate).toLocaleDateString('he-IL')}
                      </span>
                    </div>
                    <div className={`flex items-center space-x-1 ${
                      isOverdue ? 'text-red-400' : isCompleted ? 'text-green-400' : 'text-slate-400'
                    }`}>
                      {isCompleted ? (
                        <>
                          <Award className="w-3 h-3" />
                          <span>הושלם!</span>
                        </>
                      ) : isOverdue ? (
                        <>
                          <TrendingUp className="w-3 h-3" />
                          <span>פג תוקף</span>
                        </>
                      ) : (
                        <>
                          <TrendingUp className="w-3 h-3" />
                          <span>{daysRemaining} ימים</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}