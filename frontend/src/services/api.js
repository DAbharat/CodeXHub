import axios from 'axios';

const API_BASE = 'https://codexhub-emkc.onrender.com/api';

// Auth API
export const authAPI = {
  login: (email, password) =>
    axios.post(`${API_BASE}/auth/login`, { email, password }),
  register: (userData) =>
    axios.post(`${API_BASE}/auth/register`, userData),
  getMe: () => axios.get(`${API_BASE}/auth/me`),
  updateProfile: (profileData) => axios.patch(`${API_BASE}/auth/me`, profileData),
};

// Projects API
export const projectsAPI = {
  // Student
  submitRequest: (data) =>
    axios.post(`${API_BASE}/projects/request`, data),
  getMyProjects: () =>
    axios.get(`${API_BASE}/projects/student`),

  // Teacher
  getTeacherProjects: () =>
    axios.get(`${API_BASE}/projects/teacher`),

  // Both
  getProject: (id) =>
    axios.get(`${API_BASE}/projects/${id}`),

  // Teacher actions
  approveProject: (id) =>
    axios.post(`${API_BASE}/projects/${id}/approve`),
  rejectProject: (id, reason) =>
    axios.post(`${API_BASE}/projects/${id}/reject`, { reason }),
  addStudent: (projectId, studentId) =>
    axios.post(`${API_BASE}/projects/${projectId}/students`, { studentId }),
  completeProject: (id) =>
    axios.post(`${API_BASE}/projects/${id}/complete`),

  // Student actions
  uploadSynopsis: (projectId, formData) =>
    axios.post(`${API_BASE}/projects/${projectId}/synopsis`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  downloadSynopsis: (projectId) =>
    axios.get(`${API_BASE}/projects/${projectId}/synopsis/download`, {
      responseType: 'blob',
    }),

  // Progress
  updateProgress: (id, progress) =>
    axios.patch(`${API_BASE}/projects/${id}/progress`, { progress }),

  // Delete
  deleteProject: (id) =>
    axios.delete(`${API_BASE}/projects/${id}`),

  // Teachers list
  getTeachers: () =>
    axios.get(`${API_BASE}/auth/teachers`),
};

// WPR API
export const wprAPI = {
  submit: (projectId, data) =>
    axios.post(`${API_BASE}/wpr/${projectId}/submit`, data),
  getProjectWPRs: (projectId) =>
    axios.get(`${API_BASE}/wpr/${projectId}`),
  getWPR: (projectId, id) =>
    axios.get(`${API_BASE}/wpr/${projectId}/${id}`),
  delete: (projectId, id) =>
    axios.delete(`${API_BASE}/wpr/${projectId}/${id}`),
};

// Analytics API
export const analyticsAPI = {
  getTeacherAnalytics: () =>
    axios.get(`${API_BASE}/analytics/teacher`),
  getStudentAnalytics: (studentId) =>
    axios.get(`${API_BASE}/analytics/student/${studentId}`),
  getDashboardStats: () =>
    axios.get(`${API_BASE}/analytics/dashboard`),
};

export default API_BASE;
