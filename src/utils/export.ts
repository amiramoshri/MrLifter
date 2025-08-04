import { WorkoutLog, User } from '../types';

export const exportToCSV = (logs: WorkoutLog[], user: User): void => {
  const headers = ['Date', 'Exercise', 'Weight (kg)', 'Sets', 'Reps', 'Notes'];
  const csvContent = [
    `# Mr. Lifter - Workout Log Export for ${user.name}`,
    `# Generated on: ${new Date().toLocaleDateString()}`,
    `# User Stats: Weight: ${user.weight}kg, Height: ${user.height}cm, BMI: ${user.bmi}`,
    '',
    headers.join(','),
    ...logs.map(log => [
      log.date,
      log.exercise,
      log.weight,
      log.sets,
      log.reps,
      log.notes || ''
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `mr-lifter-${user.name.replace(/\s+/g, '-')}-${new Date().toISOString().slice(0, 10)}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};