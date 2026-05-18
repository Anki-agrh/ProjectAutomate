import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 30000,
});

// Request interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('scrummaster_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error logging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.detail || error.response?.data?.message || error.message || 'Network error';
    console.error(`[ScrumMaster API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url}: ${message}`);
    return Promise.reject(error);
  }
);

// Auth routes
export const loginUser = (data) => api.post('/login', data);
export const signupUser = (data) => api.post('/signup', data);
export const changePassword = (data) => api.post('/change-password', data);
export const seedCredentials = () => api.post('/seed-credentials');

// Employee onboarding routes
export const addEmployee = (data) => api.post('/employees', data);
export const uploadEmployeesCsv = (formData) => api.post('/employees/upload-csv', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

// Core routes
export const getProjects = () => api.get('/projects');
export const getEmployees = () => api.get('/employees');
export const getDashboardInfo = () => api.get('/manager/dashboard');
export const generateProject = (data) => api.post('/generate-project', data);
export const completeTask = (taskId) => api.put(`/tasks/${taskId}/complete`);
export const manageOverdue = (data) => api.post('/manage-overdue', data);

// Employee routes
export const getEmployeeTasks = (userId) => api.get(`/employee/${userId}/tasks`);

// Analytics routes
export const getSkillGap = () => api.get('/analytics/skill-gap');
export const getGrowthTrend = (userId) => api.get(`/analytics/employee-growth/${userId}`);
export const getProjectGantt = (projectId) => api.get(`/analytics/gantt/${projectId}`);
export const getAnalyticsOverview = () => api.get('/analytics/overview');

export default api;
