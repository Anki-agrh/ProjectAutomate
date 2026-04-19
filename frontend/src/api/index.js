import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
});

export const getProjects = () => api.get('/projects');
export const getEmployees = () => api.get('/employees');
export const getDashboardInfo = () => api.get('/manager/dashboard');
export const generateProject = (data) => api.post('/generate-project', data);
export const completeTask = (taskId) => api.put(`/tasks/${taskId}/complete`);
export const manageOverdue = (data) => api.post('/manage-overdue', data);

// Analytics
export const getSkillGap = () => api.get('/analytics/skill-gap');
export const getGrowthTrend = (userId) => api.get(`/analytics/employee-growth/${userId}`);
export const getProjectGantt = (projectId) => api.get(`/analytics/gantt/${projectId}`);

export default api;
