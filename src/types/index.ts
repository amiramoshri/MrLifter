export interface User {
  id: string;
  name: string;
  weight: number;
  height: number;
  age?: number;
  bmi: number;
  createdAt: string;
}

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  weight?: string;
  restTime?: string;
  notes?: string;
}

export interface DayPlan {
  day: string;
  focus: string;
  exercises: Exercise[];
}

export interface Program {
  month: string;
  plan: DayPlan[];
}

export interface WorkoutLog {
  id: string;
  userId: string;
  date: string;
  exercise: string;
  weight: number;
  sets: number;
  reps: number;
  notes?: string;
  duration?: number;
}

export interface LogEntry {
  exercise: string;
  weight: string;
  sets: string;
  reps: string;
  notes: string;
}

export interface Video {
  id: string;
  title: string;
  description?: string;
  url: string;
  thumbnail?: string;
  category: 'exercise' | 'tutorial' | 'motivation' | 'nutrition';
  createdAt: string;
}

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  category: 'weight' | 'strength' | 'endurance' | 'body' | 'custom';
  targetDate: string;
  isCompleted: boolean;
  createdAt: string;
}

export interface PersonalRecord {
  id: string;
  userId: string;
  exercise: string;
  weight: number;
  sets: number;
  reps: number;
  date: string;
  notes?: string;
  createdAt: string;
}