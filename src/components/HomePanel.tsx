import React, { useMemo } from 'react';
import { Activity, CalendarDays, Dumbbell, Flame, ArrowLeft, Trophy } from 'lucide-react';
import { Program, User, WorkoutLog } from '../types';

interface HomePanelProps {
  user: User;
  logs: WorkoutLog[];
  program?: Program;
  onStartWorkout: () => void;
  onViewProgram: () => void;
}

function startOfWeek(date: Date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  const day = (result.getDay() + 6) % 7;
  result.setDate(result.getDate() - day);
  return result;
}

export default function HomePanel({ user, logs, program, onStartWorkout, onViewProgram }: HomePanelProps) {
  const summary = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const thisWeek = logs.filter(log => {
      const date = new Date(log.date);
      return !Number.isNaN(date.getTime()) && date >= weekStart && date < weekEnd;
    });
    const volume = logs.reduce((sum, log) => sum + (Number(log.weight) || 0) * (Number(log.sets) || 0) * (Number(log.reps) || 0), 0);
    const recent = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 4);
    const best = [...logs].sort((a, b) => b.weight - a.weight)[0];
    const exerciseCount = program?.weeks.reduce((total, week) => total + week.days.reduce((dayTotal, day) => dayTotal + day.exercises.length, 0), 0) ?? 0;
    return { thisWeek: thisWeek.length, volume, recent, best, exerciseCount };
  }, [logs, program]);

  const dateLabel = (value: string) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('he-IL', { day: 'numeric', month: 'short' }).format(date);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-2 sm:px-0" dir="rtl">
      <section className="rounded-3xl border border-white/10 bg-gradient-to-bl from-blue-950 via-slate-900 to-black p-5 sm:p-8">
        <p className="text-blue-300 text-sm mb-2">ברוך הבא ל־Mr. Lifter</p>
        <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">{user.name}, מתחילים להתחזק?</h2>
        <p className="text-slate-300 text-sm sm:text-base mb-6">כל אימון קטן מצטבר להתקדמות גדולה. זה הזמן לעדכן את האימון הבא שלך.</p>
        <div className="flex flex-wrap gap-3">
          <button onClick={onStartWorkout} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 px-5 py-3 text-white font-bold transition-colors">
            <Dumbbell className="w-5 h-5" /> רישום אימון
          </button>
          <button onClick={onViewProgram} className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 hover:bg-white/15 px-5 py-3 text-white font-semibold transition-colors">
            <CalendarDays className="w-5 h-5" /> צפייה בתוכנית
          </button>
        </div>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-3"><span>אימונים השבוע</span><CalendarDays className="w-4 h-4" /></div>
          <p className="text-2xl sm:text-3xl font-black text-white tabular-nums">{summary.thisWeek}</p>
          <p className="text-xs text-slate-500 mt-1">רישומים השבוע</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-3"><span>סה״כ אימונים</span><Activity className="w-4 h-4" /></div>
          <p className="text-2xl sm:text-3xl font-black text-white tabular-nums">{logs.length}</p>
          <p className="text-xs text-slate-500 mt-1">מאז תחילת המעקב</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-3"><span>נפח מצטבר</span><Flame className="w-4 h-4" /></div>
          <p className="text-2xl sm:text-3xl font-black text-white tabular-nums">{Math.round(summary.volume).toLocaleString('he-IL')}</p>
          <p className="text-xs text-slate-500 mt-1">ק״ג × חזרות</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-3"><span>תרגילים בתוכנית</span><Dumbbell className="w-4 h-4" /></div>
          <p className="text-2xl sm:text-3xl font-black text-white tabular-nums">{summary.exerciseCount}</p>
          <p className="text-xs text-slate-500 mt-1">בתוכנית שנבחרה</p>
        </div>
      </section>

      <section className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-lg">האימונים האחרונים</h3>
            <span className="text-xs text-slate-500">עד 4 רישומים אחרונים</span>
          </div>
          {summary.recent.length === 0 ? (
            <div className="py-8 text-center">
              <Dumbbell className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <p className="text-white font-semibold mb-1">עוד לא נרשמו אימונים</p>
              <p className="text-slate-400 text-sm mb-4">האימון הראשון שלך יופיע כאן.</p>
              <button onClick={onStartWorkout} className="text-blue-300 hover:text-blue-200 text-sm font-semibold">רישום אימון ראשון ←</button>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {summary.recent.map(log => (
                <div key={log.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="text-white font-semibold truncate">{log.exercise}</p>
                    <p className="text-slate-400 text-xs mt-1">{log.sets} סטים · {log.reps} חזרות · {dateLabel(log.date)}</p>
                  </div>
                  <span className="shrink-0 rounded-lg bg-blue-500/10 px-3 py-2 text-blue-200 text-sm font-bold tabular-nums">{log.weight} ק״ג</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-amber-300" />
            <h3 className="text-white font-bold text-lg">נקודת ציון</h3>
          </div>
          {summary.best ? (
            <>
              <p className="text-slate-400 text-sm mb-2">המשקל הגבוה ביותר שנרשם</p>
              <p className="text-3xl font-black text-amber-300 tabular-nums">{summary.best.weight} ק״ג</p>
              <p className="text-white font-semibold mt-2">{summary.best.exercise}</p>
              <p className="text-slate-500 text-xs mt-1">{dateLabel(summary.best.date)}</p>
            </>
          ) : (
            <p className="text-slate-400 text-sm leading-6">כשתתחיל לרשום אימונים, השיאים שלך יוצגו כאן ויעזרו לך לעקוב אחרי ההתקדמות.</p>
          )}
          <button onClick={onViewProgram} className="mt-6 flex items-center gap-2 text-blue-300 hover:text-blue-200 text-sm font-semibold">לצפייה בתוכנית <ArrowLeft className="w-4 h-4" /></button>
        </div>
      </section>
    </div>
  );
}
