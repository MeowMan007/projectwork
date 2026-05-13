import axios from 'axios';

const backendUrl = import.meta.env.VITE_API_URL;
const API = axios.create({
  baseURL: backendUrl 
    ? (backendUrl.endsWith('/api') ? backendUrl : `${backendUrl.replace(/\/+$/, '')}/api`)
    : '/api',
});

// Attach JWT token to every request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth
export const signup = (data) => API.post('/auth/signup', data);
export const login = (data) => API.post('/auth/login', data);
export const getProfile = () => API.get('/auth/profile');

// Projects
export const getProjects = () => API.get('/projects');
export const getProjectById = (id) => API.get(`/projects/${id}`);
export const createProject = (data) => API.post('/projects', data);
export const updateProject = (id, data) => API.put(`/projects/${id}`, data);
export const deleteProject = (id) => API.delete(`/projects/${id}`);
export const getAllUsers = () => API.get('/projects/members/all');

// Tasks
export const getTasks = (params) => API.get('/tasks', { params });
export const createTask = (data) => API.post('/tasks', data);
export const updateTask = (id, data) => API.put(`/tasks/${id}`, data);
export const deleteTask = (id) => API.delete(`/tasks/${id}`);

// Dashboard
export const getDashboardStats = () => API.get('/dashboard/stats');

export default API;
