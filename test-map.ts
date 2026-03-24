import { mapBackendPlanToFrontend } from './src/app/utils/helpers';

// Dummy plan mirroring backend response Structure
const rawPlan = {
  id: 8,
  user_id: 18,
  start_date: '2026-03-12T18:30:00.000Z',
  end_date: '2026-04-11T18:30:00.000Z',
  total_days: 30,
  daily_plans: [
    {
      id: 21,
      date: '2026-03-12T18:30:00.000Z',
      day_number: 1,
      sessions: [
        {
          id: 50,
          subject_id: 'physics',
          subject_name: 'Physics',
          topic_id: 'kinematics',
          topic_name: 'Kinematics',
          duration: 60,
          completed: 0,
          status: 'not-started'
        }
      ]
    }
  ]
};

try {
  const mapped = mapBackendPlanToFrontend(rawPlan as any);
  console.log('Mapped Plan Days:', mapped.days.length);
  console.log('Sample Session Data:', Object.keys(mapped.days[0].sessions[0]));
} catch(e) {
  console.error('Mapping Error:', e);
}
