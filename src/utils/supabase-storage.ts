import { User, WorkoutLog, Video, Goal, Program } from '../types';

const KEYS = {
  user: 'mrlifter.profile',
  logs: 'mrlifter.workoutLogs',
  videos: 'mrlifter.videos',
  goals: 'mrlifter.goals',
  programs: 'mrlifter.programs'
} as const;

const read = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const write = <T,>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

const id = (): string => typeof crypto !== 'undefined' && 'randomUUID' in crypto
  ? crypto.randomUUID()
  : `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

// Local-first storage. Data remains in this browser until a backend is connected.
export const saveUserToSupabase = async (profile: Omit<User, 'id' | 'createdAt'>): Promise<User> => {
  const previous = read<User | null>(KEYS.user, null);
  const user: User = { ...profile, id: previous?.id ?? id(), createdAt: previous?.createdAt ?? new Date().toISOString() };
  write(KEYS.user, user);
  return user;
};

export const getUserFromSupabase = async (): Promise<User | null> => read<User | null>(KEYS.user, null);

export const updateUserInSupabase = async (updates: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User | null> => {
  const current = read<User | null>(KEYS.user, null);
  if (!current) return null;
  const updated = { ...current, ...updates };
  write(KEYS.user, updated);
  return updated;
};

export const saveLogToSupabase = async (log: Omit<WorkoutLog, 'id' | 'userId'>): Promise<WorkoutLog | null> => {
  const profile = read<User | null>(KEYS.user, null);
  if (!profile) return null;
  const saved: WorkoutLog = { ...log, id: id(), userId: profile.id };
  write(KEYS.logs, [saved, ...read<WorkoutLog[]>(KEYS.logs, [])]);
  return saved;
};

export const getLogsFromSupabase = async (): Promise<WorkoutLog[]> => read<WorkoutLog[]>(KEYS.logs, []);

export const updateLogInSupabase = async (logId: string, updates: Partial<Omit<WorkoutLog, 'id' | 'userId'>>): Promise<WorkoutLog | null> => {
  const logs = read<WorkoutLog[]>(KEYS.logs, []);
  const updated = logs.find(item => item.id === logId);
  if (!updated) return null;
  const next = { ...updated, ...updates };
  write(KEYS.logs, logs.map(item => item.id === logId ? next : item));
  return next;
};

export const deleteLogFromSupabase = async (logId: string): Promise<boolean> => {
  const logs = read<WorkoutLog[]>(KEYS.logs, []);
  write(KEYS.logs, logs.filter(item => item.id !== logId));
  return true;
};

export const saveVideoToSupabase = async (video: Omit<Video, 'id' | 'createdAt'>): Promise<Video | null> => {
  const saved: Video = { ...video, id: id(), createdAt: new Date().toISOString() };
  write(KEYS.videos, [saved, ...read<Video[]>(KEYS.videos, [])]);
  return saved;
};

export const getVideosFromSupabase = async (): Promise<Video[]> => read<Video[]>(KEYS.videos, []);

export const updateVideoInSupabase = async (videoId: string, updates: Partial<Omit<Video, 'id' | 'createdAt'>>): Promise<Video | null> => {
  const videos = read<Video[]>(KEYS.videos, []);
  const current = videos.find(item => item.id === videoId);
  if (!current) return null;
  const updated = { ...current, ...updates };
  write(KEYS.videos, videos.map(item => item.id === videoId ? updated : item));
  return updated;
};

export const deleteVideoFromSupabase = async (videoId: string): Promise<boolean> => {
  write(KEYS.videos, read<Video[]>(KEYS.videos, []).filter(item => item.id !== videoId));
  return true;
};

export const saveGoalToSupabase = async (goal: Omit<Goal, 'id' | 'userId' | 'createdAt'>): Promise<Goal | null> => {
  const profile = read<User | null>(KEYS.user, null);
  if (!profile) return null;
  const saved: Goal = { ...goal, id: id(), userId: profile.id, createdAt: new Date().toISOString() };
  write(KEYS.goals, [saved, ...read<Goal[]>(KEYS.goals, [])]);
  return saved;
};

export const getGoalsFromSupabase = async (): Promise<Goal[]> => read<Goal[]>(KEYS.goals, []);

export const updateGoalInSupabase = async (goalId: string, updates: Partial<Omit<Goal, 'id' | 'userId' | 'createdAt'>>): Promise<Goal | null> => {
  const goals = read<Goal[]>(KEYS.goals, []);
  const current = goals.find(item => item.id === goalId);
  if (!current) return null;
  const updated = { ...current, ...updates };
  write(KEYS.goals, goals.map(item => item.id === goalId ? updated : item));
  return updated;
};

export const deleteGoalFromSupabase = async (goalId: string): Promise<boolean> => {
  write(KEYS.goals, read<Goal[]>(KEYS.goals, []).filter(item => item.id !== goalId));
  return true;
};

export const saveProgramToSupabase = async (program: Program): Promise<Program | null> => {
  const programs = read<Program[]>(KEYS.programs, []);
  write(KEYS.programs, [...programs.filter(item => item.month !== program.month), program]);
  return program;
};

export const getProgramsFromSupabase = async (): Promise<Program[]> => read<Program[]>(KEYS.programs, []);

export const deleteProgramFromSupabase = async (month: string): Promise<boolean> => {
  write(KEYS.programs, read<Program[]>(KEYS.programs, []).filter(item => item.month !== month));
  return true;
};
