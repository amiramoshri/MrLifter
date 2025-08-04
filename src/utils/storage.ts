import { User, WorkoutLog, Video } from '../types';

const USER_STORAGE_KEY = 'mr-lifter-user';
const LOGS_STORAGE_KEY = 'mr-lifter-logs';
const VIDEOS_STORAGE_KEY = 'mr-lifter-videos';

export const saveUser = (user: User): void => {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
};

export const getUser = (): User | null => {
  const stored = localStorage.getItem(USER_STORAGE_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const saveLogs = (logs: WorkoutLog[]): void => {
  localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(logs));
};

export const getLogs = (): WorkoutLog[] => {
  const stored = localStorage.getItem(LOGS_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const clearUserData = (): void => {
  localStorage.removeItem(USER_STORAGE_KEY);
  localStorage.removeItem(LOGS_STORAGE_KEY);
};

export const saveVideos = (videos: Video[]): void => {
  localStorage.setItem(VIDEOS_STORAGE_KEY, JSON.stringify(videos));
};

export const getVideos = (): Video[] => {
  const stored = localStorage.getItem(VIDEOS_STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};