// AI-powered content generation using Google Gemini API
// Students can get a free API key from: https://makersuite.google.com/app/apikey

const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// Get API key from localStorage
export const getGeminiAPIKey = (): string | null => {
  return localStorage.getItem('gemini_api_key');
};

// Save API key to localStorage
export const saveGeminiAPIKey = (apiKey: string): void => {
  localStorage.setItem('gemini_api_key', apiKey);
};

// Check if API key is configured
export const hasAPIKey = (): boolean => {
  return !!getGeminiAPIKey();
};

// Generate flashcards using AI
export const generateFlashcardsWithAI = async (
  topicName: string,
  subjectName: string,
  chapterName: string,
  boardName: string,
  className: string,
  count: number = 8
): Promise<Array<{ front: string; back: string; difficulty: 'easy' | 'medium' | 'hard' }>> => {
  const apiKey = getGeminiAPIKey();
  if (!apiKey) {
    throw new Error('No API key configured');
  }

  const prompt = `You are an expert educator creating flashcards for Indian ${boardName} board Class ${className} students.

Topic: ${topicName}
Subject: ${subjectName}
Chapter: ${chapterName}

Create ${count} high-quality flashcards covering this topic comprehensively. Include:
- Key concepts and definitions
- Important formulas (if applicable)
- Real-world applications
- Common exam questions
- Numerical examples (if applicable)

Return ONLY a valid JSON array with this exact format (no markdown, no code blocks):
[
  {
    "front": "Question or concept to remember",
    "back": "Detailed answer with explanation, formulas, examples",
    "difficulty": "easy"
  }
]

Difficulty levels:
- easy: Basic definitions and concepts
- medium: Application and understanding
- hard: Advanced concepts, derivations, problem-solving

Make answers detailed, educational, and exam-focused. Use proper formatting with \\n for new lines.`;

  try {
    const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'API request failed');
    }

    const data = await response.json();
    const generatedText = data.candidates[0].content.parts[0].text;
    
    // Clean up the response - remove markdown code blocks if present
    const cleanedText = generatedText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    const flashcards = JSON.parse(cleanedText);
    
    return flashcards;
  } catch (error) {
    console.error('AI generation error:', error);
    throw error;
  }
};

// Generate quiz questions using AI
export const generateQuizWithAI = async (
  topicName: string,
  subjectName: string,
  chapterName: string,
  boardName: string,
  className: string,
  difficulty: 'easy' | 'medium' | 'hard',
  count: number = 5
): Promise<Array<{
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
}>> => {
  const apiKey = getGeminiAPIKey();
  if (!apiKey) {
    throw new Error('No API key configured');
  }

  const difficultyGuide = {
    easy: 'Focus on basic recall, definitions, and simple concepts',
    medium: 'Include application-based questions and conceptual understanding',
    hard: 'Include advanced problem-solving, derivations, and analytical questions'
  };

  const prompt = `You are an expert educator creating multiple-choice questions for Indian ${boardName} board Class ${className} students.

Topic: ${topicName}
Subject: ${subjectName}
Chapter: ${chapterName}
Difficulty: ${difficulty}

${difficultyGuide[difficulty]}

Create ${count} high-quality MCQ questions that:
- Test understanding of the topic
- Are exam-relevant
- Have 4 options each
- Include clear explanations
- Match ${difficulty} difficulty level

Return ONLY a valid JSON array with this exact format (no markdown, no code blocks):
[
  {
    "question": "Clear, specific question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Detailed explanation of why this answer is correct and why others are wrong",
    "difficulty": "${difficulty}"
  }
]

Make questions exam-focused and educationally valuable. Use proper formatting with \\n for new lines in explanations.`;

  try {
    const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'API request failed');
    }

    const data = await response.json();
    const generatedText = data.candidates[0].content.parts[0].text;
    
    // Clean up the response - remove markdown code blocks if present
    const cleanedText = generatedText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    const questions = JSON.parse(cleanedText);
    
    return questions;
  } catch (error) {
    console.error('AI generation error:', error);
    throw error;
  }
};

// Test API key validity
export const testAPIKey = async (apiKey: string): Promise<boolean> => {
  try {
    const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: 'Hello'
          }]
        }],
      }),
    });

    return response.ok;
  } catch (error) {
    return false;
  }
};
