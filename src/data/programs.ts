import { Program } from '../types';

export const trainingPrograms: Program[] = [
  {
    month: 'August',
    weeks: [
      {
        week: 'Week 1',
        focus: 'Foundation Building',
        days: [
          {
            day: 'Monday',
            focus: 'Upper Body Push',
            exercises: [
              { name: 'Bench Press', sets: 4, reps: '8-10', weight: '70-80% 1RM', restTime: '2-3 min', type: 'chest' },
              { name: 'Overhead Press', sets: 3, reps: '8-12', weight: '65-75% 1RM', restTime: '2 min', type: 'shoulders' },
              { name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', restTime: '90 sec', type: 'chest' },
              { name: 'Dips', sets: 3, reps: '8-15', restTime: '90 sec', type: 'chest' },
              { name: 'Close-Grip Bench Press', sets: 3, reps: '8-12', restTime: '90 sec', type: 'arms' }
            ]
          },
          {
            day: 'Tuesday',
            focus: 'Lower Body',
            exercises: [
              { name: 'Squats', sets: 4, reps: '6-8', weight: '75-85% 1RM', restTime: '3-4 min', type: 'legs' },
              { name: 'Romanian Deadlift', sets: 3, reps: '8-10', weight: '70-80% 1RM', restTime: '2-3 min', type: 'legs' },
              { name: 'Bulgarian Split Squats', sets: 3, reps: '10-12 each leg', restTime: '2 min', type: 'legs' },
              { name: 'Leg Press', sets: 3, reps: '12-15', restTime: '90 sec', type: 'legs' },
              { name: 'Walking Lunges', sets: 3, reps: '12-15 each leg', restTime: '90 sec', type: 'legs' }
            ]
          },
          {
            day: 'Wednesday',
            focus: 'Rest or Light Cardio',
            exercises: [
              { name: 'Light Jogging', sets: 1, reps: '20-30 min', notes: 'Recovery pace', type: 'cardio' },
              { name: 'Stretching', sets: 1, reps: '15-20 min', notes: 'Focus on tight areas', type: 'recovery' }
            ]
          },
          {
            day: 'Thursday',
            focus: 'Upper Body Pull',
            exercises: [
              { name: 'Deadlift', sets: 4, reps: '5-6', weight: '80-90% 1RM', restTime: '3-4 min', type: 'back' },
              { name: 'Pull-ups', sets: 4, reps: '6-10', restTime: '2-3 min', type: 'back' },
              { name: 'Barbell Rows', sets: 3, reps: '8-10', restTime: '2 min', type: 'back' },
              { name: 'Face Pulls', sets: 3, reps: '12-15', restTime: '90 sec', type: 'shoulders' },
              { name: 'Barbell Curls', sets: 3, reps: '8-12', restTime: '90 sec', type: 'arms' }
            ]
          },
          {
            day: 'Friday',
            focus: 'Lower Body Power',
            exercises: [
              { name: 'Front Squats', sets: 4, reps: '6-8', weight: '70-80% 1RM', restTime: '3 min', type: 'legs' },
              { name: 'Sumo Deadlift', sets: 3, reps: '6-8', weight: '75-85% 1RM', restTime: '3 min', type: 'legs' },
              { name: 'Box Jumps', sets: 4, reps: '5-8', restTime: '2 min', type: 'functional' },
              { name: 'Leg Curls', sets: 3, reps: '10-12', restTime: '90 sec', type: 'legs' },
              { name: 'Calf Raises', sets: 4, reps: '12-15', restTime: '60 sec', type: 'legs' }
            ]
          },
          {
            day: 'Saturday',
            focus: 'Full Body Circuit',
            exercises: [
              { name: 'Burpees', sets: 3, reps: '8-12', restTime: '60 sec', type: 'functional' },
              { name: 'Mountain Climbers', sets: 3, reps: '20-30', restTime: '60 sec', type: 'functional' },
              { name: 'Push-ups', sets: 3, reps: '10-20', restTime: '60 sec', type: 'chest' },
              { name: 'Jump Squats', sets: 3, reps: '10-15', restTime: '60 sec', type: 'legs' }
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
      },
      {
        week: 'Week 2',
        focus: 'Intensity Increase',
        days: [
          {
            day: 'Monday',
            focus: 'Upper Body Push',
            exercises: [
              { name: 'Bench Press', sets: 4, reps: '6-8', weight: '75-85% 1RM', restTime: '3 min', type: 'chest' },
              { name: 'Overhead Press', sets: 4, reps: '6-10', weight: '70-80% 1RM', restTime: '2-3 min', type: 'shoulders' },
              { name: 'Incline Dumbbell Press', sets: 3, reps: '8-10', restTime: '2 min', type: 'chest' },
              { name: 'Weighted Dips', sets: 3, reps: '6-12', restTime: '2 min', type: 'chest' },
              { name: 'Tricep Close-Grip Press', sets: 3, reps: '8-10', restTime: '90 sec', type: 'arms' }
            ]
          },
          {
            day: 'Tuesday',
            focus: 'Lower Body Strength',
            exercises: [
              { name: 'Back Squats', sets: 5, reps: '5-6', weight: '80-90% 1RM', restTime: '4 min', type: 'legs' },
              { name: 'Romanian Deadlift', sets: 4, reps: '6-8', weight: '75-85% 1RM', restTime: '3 min', type: 'legs' },
              { name: 'Walking Lunges', sets: 3, reps: '8-10 each leg', restTime: '2 min', type: 'legs' },
              { name: 'Leg Press', sets: 3, reps: '10-12', restTime: '2 min', type: 'legs' }
            ]
          },
          {
            day: 'Wednesday',
            focus: 'Active Recovery',
            exercises: [
              { name: 'Swimming', sets: 1, reps: '30-45 min', notes: 'Low intensity', type: 'cardio' },
              { name: 'Yoga Flow', sets: 1, reps: '20-30 min', notes: 'Focus on flexibility', type: 'recovery' }
            ]
          },
          {
            day: 'Thursday',
            focus: 'Upper Body Pull',
            exercises: [
              { name: 'Deadlift', sets: 5, reps: '3-5', weight: '85-95% 1RM', restTime: '4-5 min', type: 'back' },
              { name: 'Weighted Pull-ups', sets: 4, reps: '5-8', restTime: '3 min', type: 'back' },
              { name: 'Barbell Rows', sets: 4, reps: '6-8', restTime: '2-3 min', type: 'back' },
              { name: 'Hammer Curls', sets: 3, reps: '8-12', restTime: '90 sec', type: 'arms' }
            ]
          },
          {
            day: 'Friday',
            focus: 'Power & Conditioning',
            exercises: [
              { name: 'Power Cleans', sets: 5, reps: '3-5', weight: '70-80% 1RM', restTime: '3 min', type: 'functional' },
              { name: 'Jump Squats', sets: 4, reps: '6-8', restTime: '2 min', type: 'legs' },
              { name: 'Battle Ropes', sets: 4, reps: '30 sec', restTime: '90 sec', type: 'functional' },
              { name: 'Kettlebell Swings', sets: 3, reps: '15-20', restTime: '90 sec', type: 'functional' }
            ]
          },
          {
            day: 'Saturday',
            focus: 'Functional Movement',
            exercises: [
              { name: 'Turkish Get-ups', sets: 3, reps: '5 each side', restTime: '2 min', type: 'functional' },
              { name: 'Farmer\'s Walk', sets: 3, reps: '40-60 steps', restTime: '90 sec', type: 'functional' },
              { name: 'Plank Variations', sets: 3, reps: '60-90 sec', restTime: '60 sec', type: 'functional' }
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
  },
  {
    month: 'September',
    weeks: [
      {
        week: 'Week 1',
        focus: 'Strength Foundation',
        days: [
          {
            day: 'Monday',
            focus: 'Strength Focus - Push',
            exercises: [
              { name: 'Bench Press', sets: 5, reps: '5-6', weight: '85-90% 1RM', restTime: '3-4 min', type: 'chest' },
              { name: 'Overhead Press', sets: 4, reps: '6-8', weight: '75-85% 1RM', restTime: '3 min', type: 'shoulders' },
              { name: 'Weighted Dips', sets: 3, reps: '6-10', restTime: '2 min', type: 'chest' },
              { name: 'Tricep Close-Grip Press', sets: 3, reps: '8-10', restTime: '2 min', type: 'arms' }
            ]
          },
          {
            day: 'Tuesday',
            focus: 'Strength Focus - Legs',
            exercises: [
              { name: 'Back Squats', sets: 5, reps: '5-6', weight: '85-90% 1RM', restTime: '4-5 min', type: 'legs' },
              { name: 'Romanian Deadlift', sets: 4, reps: '6-8', weight: '80-85% 1RM', restTime: '3 min', type: 'legs' },
              { name: 'Walking Lunges', sets: 3, reps: '8-10 each leg', restTime: '2 min', type: 'legs' },
              { name: 'Leg Press', sets: 3, reps: '10-12', restTime: '2 min', type: 'legs' }
            ]
          },
          {
            day: 'Wednesday',
            focus: 'Active Recovery',
            exercises: [
              { name: 'Swimming', sets: 1, reps: '30-45 min', notes: 'Low intensity', type: 'cardio' },
              { name: 'Yoga Flow', sets: 1, reps: '20-30 min', notes: 'Focus on flexibility', type: 'recovery' }
            ]
          },
          {
            day: 'Thursday',
            focus: 'Strength Focus - Pull',
            exercises: [
              { name: 'Deadlift', sets: 5, reps: '3-5', weight: '90-95% 1RM', restTime: '4-5 min', type: 'back' },
              { name: 'Weighted Pull-ups', sets: 4, reps: '5-8', restTime: '3 min', type: 'back' },
              { name: 'Barbell Rows', sets: 4, reps: '6-8', restTime: '2-3 min', type: 'back' },
              { name: 'Hammer Curls', sets: 3, reps: '8-12', restTime: '90 sec', type: 'arms' }
            ]
          },
          {
            day: 'Friday',
            focus: 'Power & Conditioning',
            exercises: [
              { name: 'Power Cleans', sets: 5, reps: '3-5', weight: '70-80% 1RM', restTime: '3 min', type: 'functional' },
              { name: 'Jump Squats', sets: 4, reps: '6-8', restTime: '2 min', type: 'legs' },
              { name: 'Battle Ropes', sets: 4, reps: '30 sec', restTime: '90 sec', type: 'functional' },
              { name: 'Kettlebell Swings', sets: 3, reps: '15-20', restTime: '90 sec', type: 'functional' }
            ]
          },
          {
            day: 'Saturday',
            focus: 'Functional Movement',
            exercises: [
              { name: 'Turkish Get-ups', sets: 3, reps: '5 each side', restTime: '2 min', type: 'functional' },
              { name: 'Farmer\'s Walk', sets: 3, reps: '40-60 steps', restTime: '90 sec', type: 'functional' },
              { name: 'Plank Variations', sets: 3, reps: '60-90 sec', restTime: '60 sec', type: 'functional' }
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
  },
  {
    month: 'October',
    weeks: [
      {
        week: 'Week 1',
        focus: 'Hypertrophy Phase',
        days: [
          {
            day: 'Monday',
            focus: 'Hypertrophy - Upper',
            exercises: [
              { name: 'Incline Barbell Press', sets: 4, reps: '10-12', weight: '70-75% 1RM', restTime: '2 min', type: 'chest' },
              { name: 'Dumbbell Flyes', sets: 3, reps: '12-15', restTime: '90 sec', type: 'chest' },
              { name: 'Seated Cable Row', sets: 4, reps: '10-12', restTime: '2 min', type: 'back' },
              { name: 'Lateral Raises', sets: 4, reps: '12-15', restTime: '60 sec', type: 'shoulders' },
              { name: 'Preacher Curls', sets: 3, reps: '10-12', restTime: '90 sec', type: 'arms' }
            ]
          },
          {
            day: 'Tuesday',
            focus: 'Hypertrophy - Lower',
            exercises: [
              { name: 'Leg Press', sets: 4, reps: '12-15', restTime: '2 min', type: 'legs' },
              { name: 'Stiff Leg Deadlift', sets: 4, reps: '10-12', restTime: '2 min', type: 'legs' },
              { name: 'Leg Extensions', sets: 3, reps: '12-15', restTime: '90 sec', type: 'legs' },
              { name: 'Leg Curls', sets: 3, reps: '12-15', restTime: '90 sec', type: 'legs' },
              { name: 'Calf Raises', sets: 4, reps: '15-20', restTime: '60 sec', type: 'legs' }
            ]
          },
          {
            day: 'Wednesday',
            focus: 'Cardio & Core',
            exercises: [
              { name: 'Cycling', sets: 1, reps: '45-60 min', notes: 'Moderate intensity', type: 'cardio' },
              { name: 'Planks', sets: 4, reps: '60-90 sec', restTime: '60 sec', type: 'functional' },
              { name: 'Russian Twists', sets: 3, reps: '20-30', restTime: '60 sec', type: 'functional' }
            ]
          },
          {
            day: 'Thursday',
            focus: 'Hypertrophy - Push',
            exercises: [
              { name: 'Dumbbell Press', sets: 4, reps: '10-12', restTime: '2 min', type: 'chest' },
              { name: 'Cable Crossovers', sets: 3, reps: '12-15', restTime: '90 sec', type: 'chest' },
              { name: 'Arnold Press', sets: 3, reps: '10-12', restTime: '90 sec', type: 'shoulders' },
              { name: 'Tricep Dips', sets: 3, reps: '10-15', restTime: '90 sec', type: 'arms' },
              { name: 'Diamond Push-ups', sets: 3, reps: '8-12', restTime: '90 sec', type: 'chest' }
            ]
          },
          {
            day: 'Friday',
            focus: 'Hypertrophy - Pull',
            exercises: [
              { name: 'T-Bar Rows', sets: 4, reps: '10-12', restTime: '2 min', type: 'back' },
              { name: 'Cable Pulldowns', sets: 4, reps: '10-12', restTime: '2 min', type: 'back' },
              { name: 'Cable Curls', sets: 3, reps: '12-15', restTime: '90 sec', type: 'arms' },
              { name: 'Hammer Curls', sets: 3, reps: '10-12', restTime: '90 sec', type: 'arms' },
              { name: 'Shrugs', sets: 3, reps: '12-15', restTime: '90 sec', type: 'shoulders' }
            ]
          },
          {
            day: 'Saturday',
            focus: 'HIIT Training',
            exercises: [
              { name: 'Sprint Intervals', sets: 6, reps: '30 sec on / 90 sec off', notes: 'Maximum effort', type: 'cardio' },
              { name: 'Burpee Box Jumps', sets: 4, reps: '8-10', restTime: '2 min', type: 'functional' },
              { name: 'Kettlebell Thrusters', sets: 3, reps: '10-12', restTime: '90 sec', type: 'functional' }
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
  }
];