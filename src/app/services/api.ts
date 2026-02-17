/**
 * API Service for AceTrack Backend
 * Handles all HTTP requests to the Node.js backend
 */

// Get API base URL from environment variable or use default
// @ts-ignore
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

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
    (headers as any)['Authorization'] = `Bearer ${token}`;
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
    const response = await apiRequest('auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.success && response.data.token) {
      setToken(response.data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(response.data));
    }

    return response;
  },

  login: async (credentials: { email: string; password: string; user_type?: string }) => {
    const response = await apiRequest('auth/login', {
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
    return await apiRequest('auth/verify', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  },
};

// Profile API
export const profileAPI = {
  get: async () => {
    return await apiRequest('profile', {
      method: 'GET',
    });
  },

  create: async (profileData: any) => {
    return await apiRequest('profile', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  },

  update: async (profileData: any) => {
    return await apiRequest('profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },
};

// Study Plan API
export const studyPlanAPI = {
  get: async () => {
    return await apiRequest('study-plan', {
      method: 'GET',
    });
  },

  create: async (planData: any) => {
    return await apiRequest('study-plan', {
      method: 'POST',
      body: JSON.stringify(planData),
    });
  },

  update: async (planData: any) => {
    // Note: Update endpoint might need adjustment on backend if not implemented yet
    return await apiRequest('study-plan', {
      method: 'PUT',
      body: JSON.stringify(planData),
    });
  },

  completeSession: async (sessionId: number) => {
    // Backend doesn't have this specific endpoint yet, might need to use progress update or create one
    //  return await apiRequest(`study-plan/session/${sessionId}/complete`, {
    //   method: 'POST',
    // });
    console.warn('completeSession not fully implemented in backend');
    return { success: true };
  },

  updateSession: async (sessionId: number | string, updates: { completed?: boolean; duration?: number }) => {
    return await apiRequest(`study-plan/session/${sessionId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },
};

// Progress API
export const progressAPI = {
  get: async () => {
    return await apiRequest('progress', {
      method: 'GET',
    });
  },

  update: async (progressData: any) => {
    return await apiRequest('progress', {
      method: 'POST',
      body: JSON.stringify(progressData),
    });
  },

  getStats: async () => {
    // return await apiRequest('progress/stats', {
    //   method: 'GET',
    // });
    console.warn('getStats not fully implemented in backend');
    return { success: true, data: {} };
  },

  getAnalytics: async () => {
    // return await apiRequest('progress/analytics', {
    //   method: 'GET',
    // });
    console.warn('getAnalytics not fully implemented in backend');
    return { success: true, data: {} };
  },
};

// Flashcards API
export const flashcardsAPI = {
  get: async (subjectId?: string, topicId?: string) => {

    // Backend implementation:
    // router.get('/subjects', getSubjects);
    // router.get('/subject/:subjectId', getFlashcardsBySubject);

    if (subjectId) {
      return await apiRequest(`flashcards/subject/${subjectId}`, { method: 'GET' });
    }

    return await apiRequest(`flashcards/subjects`, { method: 'GET' });
  },

  create: async (flashcardData: any) => {
    return await apiRequest('flashcards', {
      method: 'POST',
      body: JSON.stringify(flashcardData),
    });
  },

  review: async (flashcardId: number, correct: boolean) => {
    return await apiRequest(`flashcards/${flashcardId}/review`, {
      method: 'PUT',
      body: JSON.stringify({ correct }),
    });
  },

  getDue: async () => {
    // Not implemented in backend yet
    // return await apiRequest('flashcards/due', {
    //   method: 'GET',
    // });
    console.warn('getDue not fully implemented in backend');
    return { success: true, data: [] };
  },
};

// Curriculum API
export const curriculumAPI = {
  getAll: async () => apiRequest('curriculum', { method: 'GET' }),
  add: async (data: any) => apiRequest('curriculum', { method: 'POST', body: JSON.stringify(data) }),
  delete: async (id: string) => apiRequest(`curriculum/${id}`, { method: 'DELETE' }),
};

// Notification API
export const notificationAPI = {
  getAll: async (userId?: string) => {
    let url = 'notifications';
    if (userId) url += `?userId=${userId}`;
    return apiRequest(url, { method: 'GET' });
  },
  markRead: async (id: number) => apiRequest(`notifications/${id}/read`, { method: 'PUT' }),
};

// Quizzes API
export const quizzesAPI = {
  getAll: async () => apiRequest('quiz', { method: 'GET' }),
  create: async (data: any) => apiRequest('quiz', { method: 'POST', body: JSON.stringify(data) }),
  delete: async (id: string) => apiRequest(`quiz/${id}`, { method: 'DELETE' }),

  addQuestion: async (quizId: string, data: any) => apiRequest(`quiz/${quizId}/questions`, { method: 'POST', body: JSON.stringify(data) }),
  deleteQuestion: async (questionId: string) => apiRequest(`quiz/questions/${questionId}`, { method: 'DELETE' }),

  submit: async (quizData: any) => {
    return await apiRequest('quiz/attempt', {
      method: 'POST',
      body: JSON.stringify(quizData),
    });
  },

  getHistory: async (subjectId?: string, limit: number = 20) => {
    let url = `quiz/history?limit=${limit}`;
    if (subjectId) url += `&subject_id=${subjectId}`;

    return await apiRequest(url, {
      method: 'GET',
    });
  },

  getStats: async () => {
    return await apiRequest('quiz/stats', {
      method: 'GET',
    });
  },
};

// Parent API
export const parentAPI = {
  getChildData: async () => {
    return await apiRequest('parent/child-data', {
      method: 'GET',
    });
  },

  linkStudent: async (data: { studentCode: string; relationship?: string }) => {
    return await apiRequest('parent/link', {
      method: 'POST',
      body: JSON.stringify(data),
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