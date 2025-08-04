import React, { useState } from 'react';
import { User, Weight, Ruler, Calendar, Save, X, Edit3 } from 'lucide-react';
import { User as UserType } from '../types';
import { calculateBMI, getBMICategory } from '../utils/calculations';

interface ProfileEditorProps {
  user: UserType;
  onProfileUpdate: (updatedUser: UserType) => void;
  onClose: () => void;
}

export default function ProfileEditor({ user, onProfileUpdate, onClose }: ProfileEditorProps) {
  const [formData, setFormData] = useState({
    name: user.name,
    weight: user.weight.toString(),
    height: user.height.toString(),
    age: user.age?.toString() || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 800));

    const weight = parseFloat(formData.weight);
    const height = parseFloat(formData.height);
    const bmi = calculateBMI(weight, height);

    const updatedUser: UserType = {
      ...user,
      name: formData.name.trim(),
      weight,
      height,
      age: formData.age ? parseInt(formData.age) : undefined,
      bmi
    };

    onProfileUpdate(updatedUser);
    setIsSubmitting(false);
  };

  const previewBMI = formData.weight && formData.height 
    ? calculateBMI(parseFloat(formData.weight), parseFloat(formData.height))
    : null;

  const bmiInfo = previewBMI ? getBMICategory(previewBMI) : null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl p-6 sm:p-8 w-full max-w-md border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full">
              <Edit3 className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-white">Edit Profile</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="flex items-center text-slate-300 font-medium mb-2 text-sm">
                <User className="w-4 h-4 mr-2" />
                Full Name
              </label>
              <input
                type="text"
                className={`w-full px-4 py-3 bg-slate-700 border rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.name ? 'border-red-500' : 'border-slate-600'
                }`}
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center text-slate-300 font-medium mb-2 text-sm">
                  <Weight className="w-4 h-4 mr-2" />
                  Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  className={`w-full px-4 py-3 bg-slate-700 border rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.weight ? 'border-red-500' : 'border-slate-600'
                  }`}
                  placeholder="70"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                />
                {errors.weight && <p className="text-red-400 text-sm mt-1">{errors.weight}</p>}
              </div>

              <div>
                <label className="flex items-center text-slate-300 font-medium mb-2 text-sm">
                  <Ruler className="w-4 h-4 mr-2" />
                  Height (cm)
                </label>
                <input
                  type="number"
                  className={`w-full px-4 py-3 bg-slate-700 border rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.height ? 'border-red-500' : 'border-slate-600'
                  }`}
                  placeholder="175"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                />
                {errors.height && <p className="text-red-400 text-sm mt-1">{errors.height}</p>}
              </div>
            </div>

            <div>
              <label className="flex items-center text-slate-300 font-medium mb-2 text-sm">
                <Calendar className="w-4 h-4 mr-2" />
                Age (optional)
              </label>
              <input
                type="number"
                className={`w-full px-4 py-3 bg-slate-700 border rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.age ? 'border-red-500' : 'border-slate-600'
                }`}
                placeholder="25"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              />
              {errors.age && <p className="text-red-400 text-sm mt-1">{errors.age}</p>}
            </div>

            {bmiInfo && (
              <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600">
                <p className="text-slate-300 text-sm mb-1">BMI Preview:</p>
                <p className="text-lg font-semibold text-white">
                  {previewBMI} - <span className={bmiInfo.color.replace('text-', 'text-')}>{bmiInfo.category}</span>
                </p>
              </div>
            )}
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Updating Profile...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Save className="w-5 h-5 mr-2" />
                  Update Profile
                </div>
              )}
            </button>
            
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-600 hover:bg-slate-700 text-white py-3 px-6 rounded-xl font-semibold transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}