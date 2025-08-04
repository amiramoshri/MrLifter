import React, { useState } from 'react';
import { User as UserIcon, Weight, Ruler, Calendar, Activity } from 'lucide-react';
import { User } from '../types';
import { calculateBMI, getBMICategory, generateUserId } from '../utils/calculations';

interface UserRegistrationProps {
  onUserSaved: (user: Omit<User, 'id' | 'createdAt'>) => void;
}

export default function UserRegistration({ onUserSaved }: UserRegistrationProps) {
  const [formData, setFormData] = useState({
    name: '',
    weight: '',
    height: '',
    age: ''
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simulate API delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800));

    const weight = parseFloat(formData.weight);
    const height = parseFloat(formData.height);
    const bmi = calculateBMI(weight, height);

    const user = {
      name: formData.name.trim(),
      weight,
      height,
      age: formData.age ? parseInt(formData.age) : undefined,
      bmi
    };

    onUserSaved(user);
    setIsSubmitting(false);
  };

  const previewBMI = formData.weight && formData.height 
    ? calculateBMI(parseFloat(formData.weight), parseFloat(formData.height))
    : null;

  const bmiInfo = previewBMI ? getBMICategory(previewBMI) : null;

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-sm sm:max-w-md">
        <div className="text-center mb-8">
          <div className="mb-6">
            <img 
              src="/WhatsApp Image 2025-08-03 at 18.39.13.jpeg" 
              alt="Mr. Lifter Logo" 
             className="w-24 h-24 sm:w-32 sm:h-32 mx-auto rounded-lg object-contain border-4 border-white shadow-lg"
            />
          </div>
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-blue-600 rounded-full mb-4">
            <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Mr. Lifter</h1>
          <p className="text-slate-300 text-sm sm:text-base">Strength House Training Log</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6 text-center">Create Your Profile</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="flex items-center text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  <UserIcon className="w-4 h-4 mr-2" />
                  Full Name
                </label>
                <input
                  type="text"
                  className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                {errors.name && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    <Weight className="w-4 h-4 mr-2" />
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base ${
                      errors.weight ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="70"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  />
                  {errors.weight && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.weight}</p>}
                </div>

                <div>
                  <label className="flex items-center text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    <Ruler className="w-4 h-4 mr-2" />
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    className={`w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base ${
                      errors.height ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="175"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  />
                  {errors.height && <p className="text-red-500 text-xs sm:text-sm mt-1">{errors.height}</p>}
                </div>
              </div>

              <div>
                <label className="flex items-center text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 mr-2" />
                  Age (optional)
                </label>
                <input
                  type="number"
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
                  placeholder="25"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                />
              </div>

              {bmiInfo && (
                <div className="bg-gray-50 rounded-xl p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-gray-600">BMI Preview:</p>
                  <p className="text-base sm:text-lg font-semibold">
                    {previewBMI} - <span className={bmiInfo.color}>{bmiInfo.category}</span>
                  </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Creating Profile...
                </div>
              ) : (
                'Create Profile'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}