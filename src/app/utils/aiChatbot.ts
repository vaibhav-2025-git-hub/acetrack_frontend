import { UserProfile, StudyPlan } from '../types';

// OpenAI API configuration
// To use this, you need to sign up at https://platform.openai.com/
// and create an API key
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || 'YOUR_API_KEY_HERE';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Generate context from user's study plan
export const generateStudyContext = (
  userProfile: UserProfile | null,
  studyPlan: StudyPlan | null,
  currentDate: string
): string => {
  if (!userProfile || !studyPlan) {
    return 'You are a helpful study assistant for high school students.';
  }

  const dailyPlan = studyPlan.dailyPlans[currentDate];
  const todaysSessions = dailyPlan?.sessions || [];
  
  const context = `You are an AI study assistant helping a Class ${userProfile.class} student (${userProfile.board.toUpperCase()} board, ${userProfile.stream} stream).

Current Study Details:
- Learning Speed: ${userProfile.learningSpeed}
- Study Hours per Day: ${userProfile.studyHoursPerDay}h
- Total Plan Duration: ${userProfile.totalDays} days
- Overall Progress: ${studyPlan.overallProgress}%
- Current Streak: ${studyPlan.currentStreak} days

Today's Schedule (${currentDate}):
${todaysSessions.map((s, idx) => `${idx + 1}. ${s.subjectName}: ${s.topicName} (${s.duration} min) - ${s.status}`).join('\n')}

Your role:
- Help with subject doubts and explanations
- Provide study tips and techniques
- Recommend learning resources (Khan Academy, YouTube, etc.)
- Offer motivation and support
- Suggest ways to improve study habits
- Be empathetic and encouraging

Keep responses concise (2-3 short paragraphs max). Use a friendly,supportive tone.`;

  return context;
};

// Call OpenAI API
export const sendMessageToAI = async (
  messages: ChatMessage[],
  userProfile: UserProfile | null,
  studyPlan: StudyPlan | null,
  currentDate: string
): Promise<string> => {
  // Check if API key is configured
  if (!OPENAI_API_KEY || OPENAI_API_KEY === 'YOUR_API_KEY_HERE') {
    return getMockResponse(messages[messages.length - 1].content, userProfile);
  }

  try {
    const systemContext = generateStudyContext(userProfile, studyPlan, currentDate);

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemContext },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('AI Chat Error:', error);
    return getMockResponse(messages[messages.length - 1].content, userProfile);
  }
};

// Mock responses when API is not configured
const getMockResponse = (query: string, userProfile: UserProfile | null): string => {
  const lowerQuery = query.toLowerCase();

  // Subject-specific responses
  if (lowerQuery.includes('physics') || lowerQuery.includes('motion') || lowerQuery.includes('force')) {
    return "Physics can be challenging but rewarding! For motion and forces, I recommend:\n\n1. **Khan Academy Physics** - Excellent video explanations with practice problems\n2. **PhET Interactive Simulations** - Visualize concepts with interactive tools\n3. **Practice daily** - Solve at least 5-10 problems to build intuition\n\nRemember: Understanding the 'why' behind formulas is more important than memorization!";
  }

  if (lowerQuery.includes('chemistry') || lowerQuery.includes('atom') || lowerQuery.includes('reaction')) {
    return "Chemistry is all about patterns and practice! Here's how to excel:\n\n1. **Understand periodic trends** - They explain so much about chemical behavior\n2. **Practice balancing equations** daily - It becomes second nature\n3. **Use molecular models** - Visualize 3D structures for better understanding\n\nCheck out Khan Academy Chemistry and ChemCollective for virtual labs!";
  }

  if (lowerQuery.includes('math') || lowerQuery.includes('calculus') || lowerQuery.includes('algebra')) {
    return "Math is a skill that improves with consistent practice! Tips:\n\n1. **Master the basics first** - Don't skip foundational concepts\n2. **Practice different problem types** - Variety builds strong understanding\n3. **Explain concepts to others** - Teaching reinforces your knowledge\n\nTry Khan Academy Math and Desmos for interactive graphing!";
  }

  if (lowerQuery.includes('biology') || lowerQuery.includes('cell') || lowerQuery.includes('dna')) {
    return "Biology requires understanding systems and processes! Study tips:\n\n1. **Create visual diagrams** - Draw out cycles and processes\n2. **Make connections** - Relate concepts to real-life examples\n3. **Use mnemonics** - They help remember complex terms\n\nCrash Course Biology on YouTube is excellent for visual learners!";
  }

  // Stress and burnout
  if (lowerQuery.includes('stress') || lowerQuery.includes('burnout') || lowerQuery.includes('tired') || lowerQuery.includes('overwhelm')) {
    return "I notice you might be feeling overwhelmed. Remember:\n\n1. **Take regular breaks** - 5-10 min every hour prevents burnout\n2. **Sleep is crucial** - Your brain consolidates learning during sleep\n3. **Don't compare** - Focus on your own progress, not others'\n\nWould you like me to suggest some relaxation techniques or study schedule adjustments?";
  }

  // Study tips
  if (lowerQuery.includes('study') || lowerQuery.includes('tips') || lowerQuery.includes('how to learn')) {
    return "Effective study techniques:\n\n1. **Active Recall** - Test yourself instead of re-reading\n2. **Spaced Repetition** - Review material at increasing intervals\n3. **Pomodoro Technique** - 25 min focus + 5 min break\n4. **Teach others** - Explaining concepts solidifies understanding\n\nQuality > Quantity always!";
  }

  // Motivation
  if (lowerQuery.includes('motivat') || lowerQuery.includes('give up') || lowerQuery.includes("can't do")) {
    return "You've got this! 🌟 Remember:\n\n1. **Progress isn't linear** - Some days are harder, and that's okay\n2. **Small steps add up** - Every study session matters\n3. **You're capable** - You wouldn't be here if you weren't committed\n\nYour current streak of " + (userProfile ? `${Math.random() > 0.5 ? '3' : '5'} days` : "learning") + " shows your dedication. Keep going!";
  }

  // Time management
  if (lowerQuery.includes('time') || lowerQuery.includes('schedule') || lowerQuery.includes('manage')) {
    return "Time management is key to success! Try this:\n\n1. **Prioritize difficult subjects** during your peak energy hours\n2. **Block study time** - Treat it like an important appointment\n3. **Limit distractions** - Phone on silent, dedicated study space\n4. **Review your plan weekly** - Adjust based on what's working\n\nYour personalized study plan is already optimized for your learning speed!";
  }

  // Resource requests
  if (lowerQuery.includes('resource') || lowerQuery.includes('website') || lowerQuery.includes('video') || lowerQuery.includes('link')) {
    return "Great resources for your subjects:\n\n**Universal:**\n• Khan Academy - Comprehensive video lessons\n• YouTube Edu - Channels like CrashCourse, 3Blue1Brown\n• NCERT Solutions - Official textbook explanations\n\n**Interactive:**\n• PhET Simulations (Science)\n• Desmos (Math graphing)\n• GeoGebra (Geometry & Calculus)\n\nAll these are free and highly rated by students!";
  }

  // Default response
  return `I'm here to help you succeed! I can assist with:\n\n• **Subject explanations** - Physics, Chemistry, Math, Biology\n• **Study strategies** - Techniques that actually work\n• **Resource recommendations** - Best websites and videos\n• **Motivation & support** - When you need encouragement\n• **Schedule optimization** - Making the most of your time\n\nWhat would you like to focus on today?`;
};

// Alternative: Use free AI APIs (no API key needed)
export const sendMessageToFreeAI = async (
  query: string,
  context: string
): Promise<string> => {
  // This uses a free, no-auth-required API (like Hugging Face Inference API)
  // Note: These have rate limits and may be slower
  
  try {
    const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: query,
        parameters: {
          max_length: 150,
          temperature: 0.7,
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Free AI API error');
    }

    const data = await response.json();
    return data[0]?.generated_text || getMockResponse(query, null);
  } catch (error) {
    console.error('Free AI Error:', error);
    return getMockResponse(query, null);
  }
};