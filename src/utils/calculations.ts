export const calculateBMI = (weight: number, height: number): number => {
  const heightInMeters = height / 100;
  return Math.round((weight / (heightInMeters * heightInMeters)) * 10) / 10;
};

export const getBMICategory = (bmi: number): { category: string; color: string } => {
  if (bmi < 18.5) return { category: 'Underweight', color: 'text-blue-600' };
  if (bmi < 25) return { category: 'Normal', color: 'text-green-600' };
  if (bmi < 30) return { category: 'Overweight', color: 'text-yellow-600' };
  return { category: 'Obese', color: 'text-red-600' };
};

export const generateUserId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};