import React, { useState } from 'react';
import { Share2, MessageCircle, Instagram, Facebook, Download, Trophy, Calendar, Dumbbell, X } from 'lucide-react';
import { WorkoutLog, User } from '../types';

interface SocialShareProps {
  user: User;
  logs: WorkoutLog[];
  personalBests?: WorkoutLog[];
  onClose: () => void;
}

export default function SocialShare({ user, logs, personalBests = [], onClose }: SocialShareProps) {
  const [selectedAchievement, setSelectedAchievement] = useState<'recent' | 'pr' | 'stats'>('stats');

  // Calculate stats for sharing
  const totalWorkouts = logs.length;
  const totalVolume = logs.reduce((sum, log) => sum + (log.weight * log.sets * log.reps), 0);
  const uniqueExercises = new Set(logs.map(log => log.exercise)).size;
  
  const recentWorkout = logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
  const topPR = personalBests.sort((a, b) => b.weight - a.weight)[0];

  const generateShareText = () => {
    const baseText = `💪 My Fitness Journey with Mr. Lifter! 💪\n\n`;
    let achievementText = '';

    switch (selectedAchievement) {
      case 'recent':
        if (recentWorkout) {
          achievementText = `🔥 Latest Workout:\n${recentWorkout.exercise} - ${recentWorkout.weight}kg × ${recentWorkout.sets} sets × ${recentWorkout.reps} reps\nDate: ${new Date(recentWorkout.date).toLocaleDateString()}\n\n`;
        }
        break;
      case 'pr':
        if (topPR) {
          achievementText = `🏆 Personal Record:\n${topPR.exercise} - ${topPR.weight}kg × ${topPR.sets} sets × ${topPR.reps} reps\nAchieved: ${new Date(topPR.date).toLocaleDateString()}\n\n`;
        }
        break;
      case 'stats':
        achievementText = `📊 My Progress:\n✅ ${totalWorkouts} Total Workouts\n🏋️ ${Math.round(totalVolume).toLocaleString()}kg Total Volume\n💪 ${uniqueExercises} Different Exercises\n\n`;
        break;
    }

    const footerText = `🎯 Training at Mr. Lifter Strength House\n📍 Follow us: @mr.lifter_savyon\n🌐 mrlifter.co.il\n\n#MrLifter #StrengthHouse #FitnessJourney #GymLife #PersonalTraining`;

    return baseText + achievementText + footerText;
  };

  const shareToWhatsApp = () => {
    const text = encodeURIComponent(generateShareText());
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const shareToFacebook = () => {
    const text = encodeURIComponent(generateShareText());
    window.open(`https://www.facebook.com/sharer/sharer.php?u=https://mrlifter.co.il&quote=${text}`, '_blank');
  };

  const shareToInstagram = () => {
    // Instagram doesn't support direct text sharing, so we copy to clipboard
    navigator.clipboard.writeText(generateShareText()).then(() => {
      alert('Text copied to clipboard! You can now paste it in your Instagram post or story.');
      window.open('https://www.instagram.com/', '_blank');
    });
  };

  const downloadAsImage = () => {
    // Create a canvas to generate an image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 1000;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1e293b');
    gradient.addColorStop(1, '#0f172a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('💪 My Fitness Journey', canvas.width / 2, 100);

    // User name
    ctx.font = 'bold 32px Arial';
    ctx.fillStyle = '#3b82f6';
    ctx.fillText(user.name, canvas.width / 2, 160);

    // Achievement content
    ctx.fillStyle = '#ffffff';
    ctx.font = '28px Arial';
    ctx.textAlign = 'left';
    
    let yPosition = 240;
    const lines = generateShareText().split('\n');
    
    lines.forEach((line, index) => {
      if (line.trim() && index < 15) { // Limit lines to fit canvas
        ctx.fillText(line, 50, yPosition);
        yPosition += 40;
      }
    });

    // Mr. Lifter branding
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Mr. Lifter Strength House', canvas.width / 2, canvas.height - 100);
    
    ctx.fillStyle = '#94a3b8';
    ctx.font = '20px Arial';
    ctx.fillText('@mr.lifter_savyon | mrlifter.co.il', canvas.width / 2, canvas.height - 60);

    // Download the image
    const link = document.createElement('a');
    link.download = `mr-lifter-achievement-${user.name.replace(/\s+/g, '-')}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-white/20 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-white">Share Achievement</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Achievement Type Selection */}
        <div className="mb-6">
          <h3 className="text-white font-medium mb-3">What would you like to share?</h3>
          <div className="space-y-2">
            <button
              onClick={() => setSelectedAchievement('stats')}
              className={`w-full p-3 rounded-lg border transition-all text-left ${
                selectedAchievement === 'stats'
                  ? 'bg-blue-600 border-blue-500 text-white'
                  : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Trophy className="w-5 h-5" />
                <div>
                  <p className="font-medium">Overall Progress</p>
                  <p className="text-sm opacity-80">Total workouts, volume, and exercises</p>
                </div>
              </div>
            </button>

            {recentWorkout && (
              <button
                onClick={() => setSelectedAchievement('recent')}
                className={`w-full p-3 rounded-lg border transition-all text-left ${
                  selectedAchievement === 'recent'
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5" />
                  <div>
                    <p className="font-medium">Latest Workout</p>
                    <p className="text-sm opacity-80">{recentWorkout.exercise} - {recentWorkout.weight}kg</p>
                  </div>
                </div>
              </button>
            )}

            {topPR && (
              <button
                onClick={() => setSelectedAchievement('pr')}
                className={`w-full p-3 rounded-lg border transition-all text-left ${
                  selectedAchievement === 'pr'
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Dumbbell className="w-5 h-5" />
                  <div>
                    <p className="font-medium">Personal Record</p>
                    <p className="text-sm opacity-80">{topPR.exercise} - {topPR.weight}kg</p>
                  </div>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Preview */}
        <div className="mb-6">
          <h3 className="text-white font-medium mb-3">Preview:</h3>
          <div className="bg-slate-700 rounded-lg p-4 border border-slate-600">
            <pre className="text-slate-300 text-sm whitespace-pre-wrap font-sans">
              {generateShareText()}
            </pre>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="space-y-3">
          <button
            onClick={shareToWhatsApp}
            className="w-full flex items-center justify-center space-x-3 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl font-semibold transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Share on WhatsApp</span>
          </button>

          <button
            onClick={shareToInstagram}
            className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 px-4 rounded-xl font-semibold transition-colors"
          >
            <Instagram className="w-5 h-5" />
            <span>Share on Instagram</span>
          </button>

          <button
            onClick={shareToFacebook}
            className="w-full flex items-center justify-center space-x-3 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-semibold transition-colors"
          >
            <Facebook className="w-5 h-5" />
            <span>Share on Facebook</span>
          </button>

          <button
            onClick={downloadAsImage}
            className="w-full flex items-center justify-center space-x-3 bg-orange-600 hover:bg-orange-700 text-white py-3 px-4 rounded-xl font-semibold transition-colors"
          >
            <Download className="w-5 h-5" />
            <span>Download as Image</span>
          </button>
        </div>

        {/* Mr. Lifter Branding */}
        <div className="mt-6 pt-4 border-t border-slate-600 text-center">
          <div className="flex items-center justify-center space-x-3 mb-2">
            <img 
              src="/WhatsApp Image 2025-08-03 at 18.39.13.jpeg" 
              alt="Mr. Lifter Logo" 
              className="w-8 h-8 rounded-lg object-contain"
            />
            <span className="text-white font-semibold">Mr. Lifter Strength House</span>
          </div>
          <p className="text-slate-400 text-sm">@mr.lifter_savyon | mrlifter.co.il</p>
        </div>
      </div>
    </div>
  );
}