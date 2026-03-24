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

    // Extract response as text first to handle non-JSON errors gracefully
    const text = await response.text();
    let data;

    try {
      data = text ? JSON.parse(text) : {};
    } catch (parseError) {
      console.error('Failed to parse JSON response:', text);
      throw new Error(`Server returned invalid response: ${text.substring(0, 50)}...`);
    }

    if (!response.ok) {
      const error = new Error(data.message || `Request failed with status ${response.status}`) as any;
      error.status = response.status;
      throw error;
    }

    return data;
  } catch (error: any) {
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
    return await studyPlanAPI.updateSession(sessionId, { completed: true, status: 'completed' });
  },

  updateSession: async (sessionId: string | number, data: any) => {
    return await apiRequest(`study-plan/session/${sessionId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  getRecommendations: async () => {
    return await apiRequest('study-plan/recommendations', {
      method: 'GET',
    });
  },

  applyRecommendation: async (id: number | string, date: string) => {
    return await apiRequest(`study-plan/recommendations/${id}/apply`, {
      method: 'POST',
      body: JSON.stringify({ date }),
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
    return await apiRequest('progress/stats', {
      method: 'GET',
    });
  },

  getAnalytics: async () => {
    return await apiRequest('progress/analytics', {
      method: 'GET',
    });
  },
};

// Flashcards API
export const flashcardsAPI = {
  get: async (subjectId?: string, topicId?: string) => {

    // Backend implementation:
    // router.get('/', getAllFlashcards);
    // router.get('/subjects', getSubjects);
    // router.get('/subject/:subjectId', getFlashcardsBySubject);

    if (subjectId) {
      return await apiRequest(`flashcards/subject/${subjectId}`, { method: 'GET' });
    }

    // Default to fetching all flashcards instead of just subject names
    return await apiRequest(`flashcards`, { method: 'GET' });
  },

  create: async (flashcardData: any) => {
    return await apiRequest('flashcards', {
      method: 'POST',
      body: JSON.stringify(flashcardData),
    });
  },

  update: async (id: string, flashcardData: any) => {
    return await apiRequest(`flashcards/${id}`, {
      method: 'PUT',
      body: JSON.stringify(flashcardData),
    });
  },

  delete: async (id: string) => {
    return await apiRequest(`flashcards/${id}`, {
      method: 'DELETE',
    });
  },

  review: async (flashcardId: number, correct: boolean) => {
    return await apiRequest(`flashcards/${flashcardId}/review`, {
      method: 'PUT',
      body: JSON.stringify({ correct }),
    });
  },

  getDue: async () => {
    return await apiRequest('flashcards/due', {
      method: 'GET',
    });
  },

  publish: async (subjectId: string) => {
    return await apiRequest('flashcards/publish', {
      method: 'PUT',
      body: JSON.stringify({ subjectId }),
    });
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

  publish: async (quizId: string) => {
    return await apiRequest(`quiz/${quizId}/publish`, {
      method: 'PUT',
    });
  },

  start: async (quizId: string) => {
    return await apiRequest(`quiz/${quizId}/start`, {
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

// Admin API
export const adminAPI = {
  getStats: async () => {
    return await apiRequest('admin/stats', {
      method: 'GET',
    });
  },

  getAnalytics: async () => {
    return await apiRequest('admin/analytics', {
      method: 'GET',
    });
  },

  getUsers: async () => {
    return await apiRequest('admin/users', {
      method: 'GET',
    });
  },

  toggleFeature: async (featureName: string, active: boolean) => {
    return await apiRequest('admin/features', {
      method: 'POST',
      body: JSON.stringify({ feature: featureName, active }),
    });
  },

  createAnnouncement: async (message: string) => {
    return await apiRequest('admin/announcements', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },

  getAnnouncements: async () => {
    return await apiRequest('admin/announcements', {
      method: 'GET',
    });
  },

  getTickets: async () => {
    return await apiRequest('admin/tickets', {
      method: 'GET',
    });
  },

  getSystemLogs: async () => {
    return await apiRequest('admin/logs/system', {
      method: 'GET',
    });
  },

  getUserJourney: async (userId: string | number) => {
    return await apiRequest(`admin/logs/journey/${userId}`, {
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