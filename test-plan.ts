import { generateImprovedStudyPlan } from './src/app/utils/improvedPlanGenerator';

const profile = {
  name: 'Chris Joe',
  class: '12',
  board: 'cbse',
  stream: 'pcmb',
  selectedSubjects: ['physics', 'chemistry', 'biology'],
  learningSpeed: 'fast',
  learningStyle: 'Visual (Reading/Writing)',
  totalDays: 30,
  studyHoursPerDay: 4,
  startDate: new Date().toISOString().split('T')[0],
  subjectDifficulties: { physics: 'tough', chemistry: 'medium', biology: 'easy' },
  psychometricDetails: { accuracy: 80 }
};

try {
  const plan = generateImprovedStudyPlan(profile as any);
  console.log('Success! Plan length:', plan.days.length);
} catch (e) {
  console.error('Failed:', e);
}
