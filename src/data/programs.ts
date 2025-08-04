import { Program } from '../types';

export const trainingPrograms: Program[] = [
  {
    month: 'August',
    plan: [
      {
        day: 'Monday',
        focus: 'Upper Body Push',
        exercises: [
          { name: 'Bench Press', sets: 4, reps: '8-10', weight: '70-80% 1RM', restTime: '2-3 min' },
          { name: 'Overhead Press', sets: 3, reps: '8-12', weight: '65-75% 1RM', restTime: '2 min' },
          { name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', restTime: '90 sec' },
          { name: 'Dips', sets: 3, reps: '8-15', restTime: '90 sec' },
          { name: 'Close-Grip Bench Press', sets: 3, reps: '8-12', restTime: '90 sec' }
        ]
      },
      {
        day: 'Tuesday',
        focus: 'Lower Body',
        exercises: [
          { name: 'Squats', sets: 4, reps: '6-8', weight: '75-85% 1RM', restTime: '3-4 min' },
          { name: 'Romanian Deadlift', sets: 3, reps: '8-10', weight: '70-80% 1RM', restTime: '2-3 min' },
          { name: 'Bulgarian Split Squats', sets: 3, reps: '10-12 each leg', restTime: '2 min' },
          { name: 'Leg Press', sets: 3, reps: '12-15', restTime: '90 sec' },
          { name: 'Walking Lunges', sets: 3, reps: '12-15 each leg', restTime: '90 sec' }
        ]
      },
      {
        day: 'Wednesday',
        focus: 'Rest or Light Cardio',
        exercises: [
          { name: 'Light Jogging', sets: 1, reps: '20-30 min', notes: 'Recovery pace' },
          { name: 'Stretching', sets: 1, reps: '15-20 min', notes: 'Focus on tight areas' }
        ]
      },
      {
        day: 'Thursday',
        focus: 'Upper Body Pull',
        exercises: [
          { name: 'Deadlift', sets: 4, reps: '5-6', weight: '80-90% 1RM', restTime: '3-4 min' },
          { name: 'Pull-ups/Lat Pulldown', sets: 4, reps: '6-10', restTime: '2-3 min' },
          { name: 'Barbell Rows', sets: 3, reps: '8-10', restTime: '2 min' },
          { name: 'Face Pulls', sets: 3, reps: '12-15', restTime: '90 sec' },
          { name: 'Barbell Curls', sets: 3, reps: '8-12', restTime: '90 sec' }
        ]
      },
      {
        day: 'Friday',
        focus: 'Lower Body Power',
        exercises: [
          { name: 'Front Squats', sets: 4, reps: '6-8', weight: '70-80% 1RM', restTime: '3 min' },
          { name: 'Sumo Deadlift', sets: 3, reps: '6-8', weight: '75-85% 1RM', restTime: '3 min' },
          { name: 'Box Jumps', sets: 4, reps: '5-8', restTime: '2 min' },
          { name: 'Leg Curls', sets: 3, reps: '10-12', restTime: '90 sec' },
          { name: 'Calf Raises', sets: 4, reps: '12-15', restTime: '60 sec' }
        ]
      },
      {
        day: 'Saturday',
        focus: 'Full Body Circuit',
        exercises: [
          { name: 'Burpees', sets: 3, reps: '8-12', restTime: '60 sec' },
          { name: 'Mountain Climbers', sets: 3, reps: '20-30', restTime: '60 sec' },
          { name: 'Push-ups', sets: 3, reps: '10-20', restTime: '60 sec' },
          { name: 'Jump Squats', sets: 3, reps: '10-15', restTime: '60 sec' }
        ]
      },
      {
        day: 'Sunday',
        focus: 'Rest Day',
        exercises: [
          { name: 'Complete Rest', sets: 1, reps: 'All day', notes: 'Recovery and meal prep' }
        ]
      }
    ]
  },
  {
    month: 'September',
    plan: [
      {
        day: 'Monday',
        focus: 'Strength Focus - Push',
        exercises: [
          { name: 'Bench Press', sets: 5, reps: '5-6', weight: '85-90% 1RM', restTime: '3-4 min' },
          { name: 'Overhead Press', sets: 4, reps: '6-8', weight: '75-85% 1RM', restTime: '3 min' },
          { name: 'Weighted Dips', sets: 3, reps: '6-10', restTime: '2 min' },
          { name: 'Tricep Close-Grip Press', sets: 3, reps: '8-10', restTime: '2 min' }
        ]
      },
      {
        day: 'Tuesday',
        focus: 'Strength Focus - Legs',
        exercises: [
          { name: 'Back Squats', sets: 5, reps: '5-6', weight: '85-90% 1RM', restTime: '4-5 min' },
          { name: 'Romanian Deadlift', sets: 4, reps: '6-8', weight: '80-85% 1RM', restTime: '3 min' },
          { name: 'Walking Lunges', sets: 3, reps: '8-10 each leg', restTime: '2 min' },
          { name: 'Leg Press', sets: 3, reps: '10-12', restTime: '2 min' }
        ]
      },
      {
        day: 'Wednesday',
        focus: 'Active Recovery',
        exercises: [
          { name: 'Swimming', sets: 1, reps: '30-45 min', notes: 'Low intensity' },
          { name: 'Yoga Flow', sets: 1, reps: '20-30 min', notes: 'Focus on flexibility' }
        ]
      },
      {
        day: 'Thursday',
        focus: 'Strength Focus - Pull',
        exercises: [
          { name: 'Deadlift', sets: 5, reps: '3-5', weight: '90-95% 1RM', restTime: '4-5 min' },
          { name: 'Weighted Pull-ups', sets: 4, reps: '5-8', restTime: '3 min' },
          { name: 'Barbell Rows', sets: 4, reps: '6-8', restTime: '2-3 min' },
          { name: 'Hammer Curls', sets: 3, reps: '8-12', restTime: '90 sec' }
        ]
      },
      {
        day: 'Friday',
        focus: 'Power & Conditioning',
        exercises: [
          { name: 'Power Cleans', sets: 5, reps: '3-5', weight: '70-80% 1RM', restTime: '3 min' },
          { name: 'Jump Squats', sets: 4, reps: '6-8', restTime: '2 min' },
          { name: 'Battle Ropes', sets: 4, reps: '30 sec', restTime: '90 sec' },
          { name: 'Kettlebell Swings', sets: 3, reps: '15-20', restTime: '90 sec' }
        ]
      },
      {
        day: 'Saturday',
        focus: 'Functional Movement',
        exercises: [
          { name: 'Turkish Get-ups', sets: 3, reps: '5 each side', restTime: '2 min' },
          { name: 'Farmer\'s Walk', sets: 3, reps: '40-60 steps', restTime: '90 sec' },
          { name: 'Plank Variations', sets: 3, reps: '60-90 sec', restTime: '60 sec' }
        ]
      },
      {
        day: 'Sunday',
        focus: 'Rest Day',
        exercises: [
          { name: 'Complete Rest', sets: 1, reps: 'All day', notes: 'Recovery and meal prep' }
        ]
      }
    ]
  },
  {
    month: 'October',
    plan: [
      {
        day: 'Monday',
        focus: 'Hypertrophy - Upper',
        exercises: [
          { name: 'Incline Barbell Press', sets: 4, reps: '10-12', weight: '70-75% 1RM', restTime: '2 min' },
          { name: 'Dumbbell Flyes', sets: 3, reps: '12-15', restTime: '90 sec' },
          { name: 'Seated Cable Row', sets: 4, reps: '10-12', restTime: '2 min' },
          { name: 'Lateral Raises', sets: 4, reps: '12-15', restTime: '60 sec' },
          { name: 'Preacher Curls', sets: 3, reps: '10-12', restTime: '90 sec' }
        ]
      },
      {
        day: 'Tuesday',
        focus: 'Hypertrophy - Lower',
        exercises: [
          { name: 'Leg Press', sets: 4, reps: '12-15', restTime: '2 min' },
          { name: 'Stiff Leg Deadlift', sets: 4, reps: '10-12', restTime: '2 min' },
          { name: 'Leg Extensions', sets: 3, reps: '12-15', restTime: '90 sec' },
          { name: 'Leg Curls', sets: 3, reps: '12-15', restTime: '90 sec' },
          { name: 'Calf Raises', sets: 4, reps: '15-20', restTime: '60 sec' }
        ]
      },
      {
        day: 'Wednesday',
        focus: 'Cardio & Core',
        exercises: [
          { name: 'Cycling', sets: 1, reps: '45-60 min', notes: 'Moderate intensity' },
          { name: 'Planks', sets: 4, reps: '60-90 sec', restTime: '60 sec' },
          { name: 'Russian Twists', sets: 3, reps: '20-30', restTime: '60 sec' }
        ]
      },
      {
        day: 'Thursday',
        focus: 'Hypertrophy - Push',
        exercises: [
          { name: 'Dumbbell Press', sets: 4, reps: '10-12', restTime: '2 min' },
          { name: 'Cable Crossovers', sets: 3, reps: '12-15', restTime: '90 sec' },
          { name: 'Arnold Press', sets: 3, reps: '10-12', restTime: '90 sec' },
          { name: 'Tricep Dips', sets: 3, reps: '10-15', restTime: '90 sec' },
          { name: 'Diamond Push-ups', sets: 3, reps: '8-12', restTime: '90 sec' }
        ]
      },
      {
        day: 'Friday',
        focus: 'Hypertrophy - Pull',
        exercises: [
          { name: 'T-Bar Rows', sets: 4, reps: '10-12', restTime: '2 min' },
          { name: 'Cable Pulldowns', sets: 4, reps: '10-12', restTime: '2 min' },
          { name: 'Cable Curls', sets: 3, reps: '12-15', restTime: '90 sec' },
          { name: 'Hammer Curls', sets: 3, reps: '10-12', restTime: '90 sec' },
          { name: 'Shrugs', sets: 3, reps: '12-15', restTime: '90 sec' }
        ]
      },
      {
        day: 'Saturday',
        focus: 'HIIT Training',
        exercises: [
          { name: 'Sprint Intervals', sets: 6, reps: '30 sec on / 90 sec off', notes: 'Maximum effort' },
          { name: 'Burpee Box Jumps', sets: 4, reps: '8-10', restTime: '2 min' },
          { name: 'Kettlebell Thrusters', sets: 3, reps: '10-12', restTime: '90 sec' }
        ]
      },
      {
        day: 'Sunday',
        focus: 'Rest Day',
        exercises: [
          { name: 'Complete Rest', sets: 1, reps: 'All day', notes: 'Recovery and meal prep' }
        ]
      }
    ]
  }
];