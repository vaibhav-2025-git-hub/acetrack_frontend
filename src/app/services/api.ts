/**
 * API Service for AceTrack Backend
 * Handles all HTTP requests to the PHP backend
 */

// Get API base URL from environment variable or use default
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost/backend/api';

// Storage keys
const TOKEN_KEY = 'acetrack_token';
const USER_KEY = 'acetrack_user';

// Get stored token
const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

// Store token
const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

// Remove token
const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

// API request wrapper
const apiRequest = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const config: RequestInit = {
    ...options,
    headers,
  };
  
  try {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }
    
    return data;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
};

// Authentication API
export const authAPI = {
  register: async (userData: { email: string; password: string; name: string; user_type?: string }) => {
    const response = await apiRequest('auth.php?action=register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.success && response.data.token) {
      setToken(response.data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.data));
    }
    
    return response;
  },
  
  login: async (credentials: { email: string; password: string }) => {
    const response = await apiRequest('auth.php?action=login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.success && response.data.token) {
      setToken(response.data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.data));
    }
    
    return response;
  },
  
  logout: () => {
    removeToken();
  },
  
  verifyToken: async (token: string) => {
    return await apiRequest('auth.php?action=verify', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  },
};

// Profile API
export const profileAPI = {
  get: async () => {
    return await apiRequest('profile.php', {
      method: 'GET',
    });
  },
  
  create: async (profileData: any) => {
    return await apiRequest('profile.php', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  },
  
  update: async (profileData: any) => {
    return await apiRequest('profile.php', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },
};

// Study Plan API
export const studyPlanAPI = {
  get: async () => {
    return await apiRequest('study_plan.php?action=get', {
      method: 'GET',
    });
  },
  
  create: async (planData: any) => {
    return await apiRequest('study_plan.php?action=create', {
      method: 'POST',
      body: JSON.stringify(planData),
    });
  },
  
  update: async (planData: any) => {
    return await apiRequest('study_plan.php?action=update', {
      method: 'PUT',
      body: JSON.stringify(planData),
    });
  },
  
  completeSession: async (sessionId: number) => {
    return await apiRequest('study_plan.php?action=complete_session', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId }),
    });
  },
  
  updateSession: async (sessionId: number, updates: any) => {
    return await apiRequest('study_plan.php?action=update_session', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId, ...updates }),
    });
  },
};

// Progress API
export const progressAPI = {
  get: async () => {
    return await apiRequest('progress.php?action=get', {
      method: 'GET',
    });
  },
  
  update: async (progressData: any) => {
    return await apiRequest('progress.php?action=update', {
      method: 'POST',
      body: JSON.stringify(progressData),
    });
  },
  
  getStats: async () => {
    return await apiRequest('progress.php?action=stats', {
      method: 'GET',
    });
  },
  
  getAnalytics: async () => {
    return await apiRequest('progress.php?action=analytics', {
      method: 'GET',
    });
  },
};

// Flashcards API
export const flashcardsAPI = {
  get: async (subjectId?: string, topicId?: string) => {
    let url = 'flashcards.php?action=get';
    if (subjectId) url += `&subject_id=${subjectId}`;
    if (topicId) url += `&topic_id=${topicId}`;
    
    return await apiRequest(url, {
      method: 'GET',
    });
  },
  
  create: async (flashcardData: any) => {
    return await apiRequest('flashcards.php?action=create', {
      method: 'POST',
      body: JSON.stringify(flashcardData),
    });
  },
  
  review: async (flashcardId: number, correct: boolean) => {
    return await apiRequest('flashcards.php?action=review', {
      method: 'POST',
      body: JSON.stringify({ flashcard_id: flashcardId, correct }),
    });
  },
  
  getDue: async () => {
    return await apiRequest('flashcards.php?action=due', {
      method: 'GET',
    });
  },
};

// Quizzes API
export const quizzesAPI = {
  submit: async (quizData: any) => {
    return await apiRequest('quizzes.php?action=submit', {
      method: 'POST',
      body: JSON.stringify(quizData),
    });
  },
  
  getHistory: async (subjectId?: string, limit: number = 20) => {
    let url = `quizzes.php?action=history&limit=${limit}`;
    if (subjectId) url += `&subject_id=${subjectId}`;
    
    return await apiRequest(url, {
      method: 'GET',
    });
  },
  
  getStats: async () => {
    return await apiRequest('quizzes.php?action=stats', {
      method: 'GET',
    });
  },
};

// Export utility functions
export const apiUtils = {
  getToken,
  setToken,
  removeToken,
  isAuthenticated: () => !!getToken(),
};