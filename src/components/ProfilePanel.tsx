import React, { useState } from 'react';
import { User, Weight, Ruler, Calendar, Activity, Edit3, Save, X, Mail, Phone, MapPin, Target, Award, TrendingUp } from 'lucide-react';
import { User as UserType, WorkoutLog } from '../types';
import { calculateBMI, getBMICategory } from '../utils/calculations';
import { updateUserInSupabase } from '../utils/supabase-storage';

interface ProfilePanelProps {
  user: UserType;
  logs: WorkoutLog[];
  onUserUpdate: (updatedUser: UserType) => void;
}

export default function ProfilePanel({ user, logs, onUserUpdate }: ProfilePanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: user.name,
    weight: user.weight.toString(),
    height: user.height.toString(),
    age: user.age?.toString() || '',
    email: '',
    phone: '',
    address: '',
    fitnessGoal: '',
    experience: '',
    medicalNotes: ''
  });

  const bmiInfo = getBMICategory(user.bmi);

  // Calculate user stats
  const totalWorkouts = logs.length;
  const totalVolume = logs.reduce((sum, log) => sum + (log.weight * log.sets * log.reps), 0);
  const uniqueExercises = new Set(logs.map(log => log.exercise)).size;
  const averageWorkoutsPerWeek = logs.length > 0 ? (logs.length / Math.max(1, Math.ceil((Date.now() - new Date(logs[logs.length - 1].date).getTime()) / (7 * 24 * 60 * 60 * 1000)))) : 0;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.weight || parseFloat(formData.weight) <= 0) {
      newErrors.weight = 'Valid weight is required';
    }

    if (!formData.height || parseFloat(formData.height) <= 0) {
      newErrors.height = 'Valid height is required';
    }

    if (formData.age && (parseInt(formData.age) <= 0 || parseInt(formData.age) > 120)) {
      newErrors.age = 'Valid age is required';
    }

    setError(Object.keys(newErrors).length > 0 ? Object.values(newErrors)[0] : null);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const weight = parseFloat(formData.weight);
      const height = parseFloat(formData.height);
      const bmi = calculateBMI(weight, height);

      const updatedUser = await updateUserInSupabase({
        name: formData.name.trim(),
        weight,
        height,
        age: formData.age ? parseInt(formData.age) : undefined,
        bmi
      });

      if (updatedUser) {
        onUserUpdate(updatedUser);
        setIsEditing(false);
      } else {
        setError('Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name,
      weight: user.weight.toString(),
      height: user.height.toString(),
      age: user.age?.toString() || '',
      email: '',
      phone: '',
      address: '',
      fitnessGoal: '',
      experience: '',
      medicalNotes: ''
    });
    setIsEditing(false);
    setError(null);
  };

  const previewBMI = formData.weight && formData.height 
    ? calculateBMI(parseFloat(formData.weight), parseFloat(formData.height))
    : null;

  const previewBmiInfo = previewBMI ? getBMICategory(previewBMI) : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-2 sm:px-0">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Personal Profile</h2>
        <p className="text-slate-300 text-sm sm:text-base">Manage your personal information and fitness details</p>
      </div>

      {/* Profile Header */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-white">{user.name}</h3>
              <p className="text-slate-300 text-sm sm:text-base">Mr. Lifter Member</p>
              <p className="text-slate-400 text-xs sm:text-sm">
                Member since {new Date(user.createdAt).toLocaleDateString('he-IL')}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-colors text-sm sm:text-base ${
              isEditing 
                ? 'bg-gray-600 hover:bg-gray-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isEditing ? (
              <>
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </>
            ) : (
              <>
                <Edit3 className="w-4 h-4" />
                <span>Edit Profile</span>
              </>
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-600/20 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Basic Information */}
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-4">
            <h4 className="text-white font-semibold text-lg flex items-center">
              <User className="w-5 h-5 mr-2" />
              Basic Information
            </h4>
            
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-2 text-sm">Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-2 text-sm">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="70"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-slate-300 font-medium mb-2 text-sm">Height (cm)</label>
                    <input
                      type="number"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="175"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-slate-300 font-medium mb-2 text-sm">Age</label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="25"
                  />
                </div>

                {previewBmiInfo && (
                  <div className="bg-slate-700/50 rounded-lg p-3 border border-slate-600">
                    <p className="text-slate-300 text-sm mb-1">BMI Preview:</p>
                    <p className="text-lg font-semibold text-white">
                      {previewBMI} - <span className={previewBmiInfo.color}>{previewBmiInfo.category}</span>
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                  <span className="text-slate-300 text-sm">Weight:</span>
                  <span className="text-white font-semibold">{user.weight} kg</span>
                </div>
                
                <div className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                  <span className="text-slate-300 text-sm">Height:</span>
                  <span className="text-white font-semibold">{user.height} cm</span>
                </div>
                
                <div className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                  <span className="text-slate-300 text-sm">Age:</span>
                  <span className="text-white font-semibold">{user.age || 'Not specified'}</span>
                </div>
                
                <div className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                  <span className="text-slate-300 text-sm">BMI:</span>
                  <span className={`font-semibold ${bmiInfo.color}`}>
                    {user.bmi} - {bmiInfo.category}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold text-lg flex items-center">
              <Mail className="w-5 h-5 mr-2" />
              Contact Information
            </h4>
            
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-2 text-sm">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="your.email@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-slate-300 font-medium mb-2 text-sm">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="050-123-4567"
                  />
                </div>
                
                <div>
                  <label className="block text-slate-300 font-medium mb-2 text-sm">Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="Your address"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                  <span className="text-slate-300 text-sm">Email:</span>
                  <span className="text-white font-semibold">{formData.email || 'Not specified'}</span>
                </div>
                
                <div className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                  <span className="text-slate-300 text-sm">Phone:</span>
                  <span className="text-white font-semibold">{formData.phone || 'Not specified'}</span>
                </div>
                
                <div className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                  <span className="text-slate-300 text-sm">Address:</span>
                  <span className="text-white font-semibold">{formData.address || 'Not specified'}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fitness Information */}
        <div className="mt-6 pt-6 border-t border-white/20">
          <h4 className="text-white font-semibold text-lg flex items-center mb-4">
            <Target className="w-5 h-5 mr-2" />
            Fitness Information
          </h4>
          
          {isEditing ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-slate-300 font-medium mb-2 text-sm">Fitness Goal</label>
                <select
                  value={formData.fitnessGoal}
                  onChange={(e) => setFormData({ ...formData, fitnessGoal: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="">Select goal</option>
                  <option value="weight-loss">Weight Loss</option>
                  <option value="muscle-gain">Muscle Gain</option>
                  <option value="strength">Strength Building</option>
                  <option value="endurance">Endurance</option>
                  <option value="general-fitness">General Fitness</option>
                  <option value="body-recomposition">Body Recomposition</option>
                </select>
              </div>
              
              <div>
                <label className="block text-slate-300 font-medium mb-2 text-sm">Experience Level</label>
                <select
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="">Select level</option>
                  <option value="beginner">Beginner (0-6 months)</option>
                  <option value="intermediate">Intermediate (6 months - 2 years)</option>
                  <option value="advanced">Advanced (2+ years)</option>
                  <option value="expert">Expert (5+ years)</option>
                </select>
              </div>
              
              <div className="sm:col-span-2">
                <label className="block text-slate-300 font-medium mb-2 text-sm">Medical Notes / Injuries</label>
                <textarea
                  value={formData.medicalNotes}
                  onChange={(e) => setFormData({ ...formData, medicalNotes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                  placeholder="Any medical conditions, injuries, or limitations..."
                  rows={3}
                />
              </div>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                <span className="text-slate-300 text-sm">Goal:</span>
                <span className="text-white font-semibold">{formData.fitnessGoal || 'Not specified'}</span>
              </div>
              
              <div className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                <span className="text-slate-300 text-sm">Experience:</span>
                <span className="text-white font-semibold">{formData.experience || 'Not specified'}</span>
              </div>
              
              {formData.medicalNotes && (
                <div className="sm:col-span-2 bg-white/5 rounded-lg p-3">
                  <span className="text-slate-300 text-sm block mb-1">Medical Notes:</span>
                  <span className="text-white text-sm">{formData.medicalNotes}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Save/Cancel Buttons */}
        {isEditing && (
          <div className="mt-6 pt-6 border-t border-white/20 flex space-x-4">
            <button
              onClick={handleSave}
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-green-800 focus:ring-4 focus:ring-green-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Saving...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Save className="w-5 h-5 mr-2" />
                  Save Changes
                </div>
              )}
            </button>
            
            <button
              onClick={handleCancel}
              className="flex-1 bg-slate-600 hover:bg-slate-700 text-white py-3 px-6 rounded-xl font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Fitness Statistics */}
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20">
        <h4 className="text-white font-semibold text-lg flex items-center mb-4">
          <TrendingUp className="w-5 h-5 mr-2" />
          Fitness Statistics
        </h4>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="bg-blue-600/20 rounded-lg p-3 mb-2">
              <Activity className="w-6 h-6 text-blue-400 mx-auto mb-1" />
              <p className="text-2xl font-bold text-blue-400">{totalWorkouts}</p>
            </div>
            <p className="text-slate-400 text-sm">Total Workouts</p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-600/20 rounded-lg p-3 mb-2">
              <Weight className="w-6 h-6 text-green-400 mx-auto mb-1" />
              <p className="text-2xl font-bold text-green-400">{Math.round(totalVolume).toLocaleString()}</p>
            </div>
            <p className="text-slate-400 text-sm">Total Volume (kg)</p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-600/20 rounded-lg p-3 mb-2">
              <Target className="w-6 h-6 text-purple-400 mx-auto mb-1" />
              <p className="text-2xl font-bold text-purple-400">{uniqueExercises}</p>
            </div>
            <p className="text-slate-400 text-sm">Exercises</p>
          </div>
          
          <div className="text-center">
            <div className="bg-orange-600/20 rounded-lg p-3 mb-2">
              <Calendar className="w-6 h-6 text-orange-400 mx-auto mb-1" />
              <p className="text-2xl font-bold text-orange-400">{Math.round(averageWorkoutsPerWeek * 10) / 10}</p>
            </div>
            <p className="text-slate-400 text-sm">Avg/Week</p>
          </div>
        </div>
      </div>
    </div>
  );
}