import { supabase } from '../lib/supabase';
import { User, WorkoutLog, Video, Goal } from '../types';

// User operations
export const saveUserToSupabase = async (user: Omit<User, 'id' | 'createdAt'>): Promise<User | null> => {
  try {
    const { data: authUser, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error('Auth error:', authError);
      return null;
    }
    if (!authUser.user) return null;

    const userData = {
      id: authUser.user.id,
      name: user.name,
      weight: user.weight,
      height: user.height,
      age: user.age,
      bmi: user.bmi
    };

    const { data, error } = await supabase
      .from('users')
      .upsert(userData)
      .select()
      .single();

    if (error) {
      console.error('Error saving user:', error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      weight: data.weight,
      height: data.height,
      age: data.age,
      bmi: data.bmi,
      createdAt: data.created_at
    };
  } catch (err) {
    console.error('Unexpected error saving user:', err);
    return null;
  }
};

export const getUserFromSupabase = async (): Promise<User | null> => {
  try {
    const { data: authUser, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error('Auth error:', authError);
      return null;
    }
    if (!authUser.user) return null;

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.user.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      weight: data.weight,
      height: data.height,
      age: data.age,
      bmi: data.bmi,
      createdAt: data.created_at
    };
  } catch (err) {
    console.error('Unexpected error fetching user:', err);
    return null;
  }
};

// Workout logs operations
export const saveLogToSupabase = async (log: Omit<WorkoutLog, 'id' | 'userId'>): Promise<WorkoutLog | null> => {
  try {
    const { data: authUser, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error('Auth error:', authError);
      return null;
    }
    if (!authUser.user) return null;

    const logData = {
      user_id: authUser.user.id,
      date: log.date,
      exercise: log.exercise,
      weight: log.weight,
      sets: log.sets,
      reps: log.reps,
      notes: log.notes,
      duration: log.duration
    };

    const { data, error } = await supabase
      .from('workout_logs')
      .insert(logData)
      .select()
      .single();

    if (error) {
      console.error('Error saving workout log:', error);
      return null;
    }

    return {
      id: data.id,
      userId: data.user_id,
      date: data.date,
      exercise: data.exercise,
      weight: data.weight,
      sets: data.sets,
      reps: data.reps,
      notes: data.notes,
      duration: data.duration
    };
  } catch (err) {
    console.error('Unexpected error saving workout log:', err);
    return null;
  }
};

export const getLogsFromSupabase = async (): Promise<WorkoutLog[]> => {
  try {
    const { data: authUser, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error('Auth error:', authError);
      return [];
    }
    if (!authUser.user) return [];

    const { data, error } = await supabase
      .from('workout_logs')
      .select('*')
      .eq('user_id', authUser.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching workout logs:', error);
      return [];
    }

    return data.map(log => ({
      id: log.id,
      userId: log.user_id,
      date: log.date,
      exercise: log.exercise,
      weight: log.weight,
      sets: log.sets,
      reps: log.reps,
      notes: log.notes,
      duration: log.duration
    }));
  } catch (err) {
    console.error('Unexpected error fetching workout logs:', err);
    return [];
  }
};

// Videos operations
export const saveVideoToSupabase = async (video: Omit<Video, 'id' | 'createdAt'>): Promise<Video | null> => {
  try {
    const videoData = {
      title: video.title,
      description: video.description,
      url: video.url,
      thumbnail: video.thumbnail,
      category: video.category
    };

    const { data, error } = await supabase
      .from('videos')
      .insert(videoData)
      .select()
      .single();

    if (error) {
      console.error('Error saving video:', error);
      return null;
    }

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      url: data.url,
      thumbnail: data.thumbnail,
      category: data.category,
      createdAt: data.created_at
    };
  } catch (err) {
    console.error('Unexpected error saving video:', err);
    return null;
  }
};

export const getVideosFromSupabase = async (): Promise<Video[]> => {
  try {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching videos:', error);
      return [];
    }

    return data.map(video => ({
      id: video.id,
      title: video.title,
      description: video.description,
      url: video.url,
      thumbnail: video.thumbnail,
      category: video.category,
      createdAt: video.created_at
    }));
  } catch (err) {
    console.error('Unexpected error fetching videos:', err);
    return [];
  }
};

export const updateVideoInSupabase = async (id: string, updates: Partial<Omit<Video, 'id' | 'createdAt'>>): Promise<Video | null> => {
  try {
    const { data, error } = await supabase
      .from('videos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating video:', error);
      return null;
    }

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      url: data.url,
      thumbnail: data.thumbnail,
      category: data.category,
      createdAt: data.created_at
    };
  } catch (err) {
    console.error('Unexpected error updating video:', err);
    return null;
  }
};

export const deleteVideoFromSupabase = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('videos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting video:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Unexpected error deleting video:', err);
    return false;
  }
};

// Goals operations
export const saveGoalToSupabase = async (goal: Omit<Goal, 'id' | 'userId' | 'createdAt'>): Promise<Goal | null> => {
  try {
    const { data: authUser, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error('Auth error:', authError);
      return null;
    }
    if (!authUser.user) return null;

    const goalData = {
      user_id: authUser.user.id,
      title: goal.title,
      description: goal.description,
      target_value: goal.targetValue,
      current_value: goal.currentValue,
      unit: goal.unit,
      category: goal.category,
      target_date: goal.targetDate,
      is_completed: goal.isCompleted
    };

    const { data, error } = await supabase
      .from('goals')
      .insert(goalData)
      .select()
      .single();

    if (error) {
      console.error('Error saving goal:', error);
      return null;
    }

    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      description: data.description,
      targetValue: data.target_value,
      currentValue: data.current_value,
      unit: data.unit,
      category: data.category,
      targetDate: data.target_date,
      isCompleted: data.is_completed,
      createdAt: data.created_at
    };
  } catch (err) {
    console.error('Unexpected error saving goal:', err);
    return null;
  }
};

export const getGoalsFromSupabase = async (): Promise<Goal[]> => {
  try {
    const { data: authUser, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error('Auth error:', authError);
      return [];
    }
    if (!authUser.user) return [];

    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', authUser.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching goals:', error);
      return [];
    }

    return data.map(goal => ({
      id: goal.id,
      userId: goal.user_id,
      title: goal.title,
      description: goal.description,
      targetValue: goal.target_value,
      currentValue: goal.current_value,
      unit: goal.unit,
      category: goal.category,
      targetDate: goal.target_date,
      isCompleted: goal.is_completed,
      createdAt: goal.created_at
    }));
  } catch (err) {
    console.error('Unexpected error fetching goals:', err);
    return [];
  }
};

export const updateGoalInSupabase = async (id: string, updates: Partial<Omit<Goal, 'id' | 'userId' | 'createdAt'>>): Promise<Goal | null> => {
  try {
    const updateData: any = {};
    
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.targetValue !== undefined) updateData.target_value = updates.targetValue;
    if (updates.currentValue !== undefined) updateData.current_value = updates.currentValue;
    if (updates.unit !== undefined) updateData.unit = updates.unit;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.targetDate !== undefined) updateData.target_date = updates.targetDate;
    if (updates.isCompleted !== undefined) updateData.is_completed = updates.isCompleted;

    const { data, error } = await supabase
      .from('goals')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating goal:', error);
      return null;
    }

    return {
      id: data.id,
      userId: data.user_id,
      title: data.title,
      description: data.description,
      targetValue: data.target_value,
      currentValue: data.current_value,
      unit: data.unit,
      category: data.category,
      targetDate: data.target_date,
      isCompleted: data.is_completed,
      createdAt: data.created_at
    };
  } catch (err) {
    console.error('Unexpected error updating goal:', err);
    return null;
  }
};

export const deleteGoalFromSupabase = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting goal:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Unexpected error deleting goal:', err);
    return false;
  }
};