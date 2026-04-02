import api from './axios.js';

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  refresh: () => api.post('/auth/refresh'),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (token, data) => api.post(`/auth/reset-password/${token}`, data),
};

export const usersAPI = {
  search: (params) => api.get('/users', { params }),
  getProfile: (id) => api.get(`/users/${id}`),
  getMe: () => api.get('/users/me'),
  updateMe: (data) => api.put('/users/me', data),
  updateMeWithFile: (formData) => api.put('/users/me', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  markNotificationsRead: () => api.put('/users/me/notifications/read'),
};

export const shortlistAPI = {
  toggle: (data) => api.post('/shortlists', data),
  getAll: () => api.get('/shortlists'),
};

export const projectsAPI = {
  create: (data) => api.post('/projects', data),
  createWithFiles: (formData) => api.post('/projects', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getAll: (params) => api.get('/projects', { params }),
  getOne: (id) => api.get(`/projects/${id}`),
  update: (id, data) => api.put(`/projects/${id}`, data),
  updateStatus: (id, status) => api.patch(`/projects/${id}/status`, { status }),
};

export const applicationsAPI = {
  apply: (projectId, data) => api.post(`/projects/${projectId}/applications`, data),
  getAll: (projectId) => api.get(`/projects/${projectId}/applications`),
  updateStatus: (projectId, appId, status) => api.patch(`/projects/${projectId}/applications/${appId}/status`, { status }),
};

export const contractsAPI = {
  getAll: (params) => api.get('/contracts', { params }),
  getOne: (id) => api.get(`/contracts/${id}`),
  assignPM: (id, pmId) => api.patch(`/contracts/${id}/assign-pm`, { projectManagerId: pmId }),
  terminate: (id, reason) => api.patch(`/contracts/${id}/terminate`, { reason }),
};

export const milestonesAPI = {
  create: (contractId, data) => api.post(`/contracts/${contractId}/milestones`, data),
  getAll: (contractId) => api.get(`/contracts/${contractId}/milestones`),
  update: (contractId, mId, data) => api.put(`/contracts/${contractId}/milestones/${mId}`, data),
  updateStatus: (contractId, mId, data) => api.patch(`/contracts/${contractId}/milestones/${mId}/status`, data),
  delete: (contractId, mId) => api.delete(`/contracts/${contractId}/milestones/${mId}`),
};

export const tasksAPI = {
  create: (contractId, data) => api.post(`/contracts/${contractId}/tasks`, data),
  getAll: (contractId, params) => api.get(`/contracts/${contractId}/tasks`, { params }),
  update: (contractId, taskId, data) => api.put(`/contracts/${contractId}/tasks/${taskId}`, data),
  updateStatus: (contractId, taskId, status) => api.patch(`/contracts/${contractId}/tasks/${taskId}/status`, { status }),
  delete: (contractId, taskId) => api.delete(`/contracts/${contractId}/tasks/${taskId}`),
};

export const conversationsAPI = {
  create: (data) => api.post('/conversations', data),
  getAll: () => api.get('/conversations'),
  getMessages: (id, params) => api.get(`/conversations/${id}/messages`, { params }),
  sendMessage: (id, text) => api.post(`/conversations/${id}/messages`, { text }),
};

export const disputesAPI = {
  create: (data) => api.post('/disputes', data),
  getAll: (params) => api.get('/disputes', { params }),
  getOne: (id) => api.get(`/disputes/${id}`),
  updateStatus: (id, data) => api.patch(`/disputes/${id}/status`, data),
};

export const paymentsAPI = {
  createEscrow: (data) => api.post('/payments/escrow', data),
  getHistory: () => api.get('/payments/history'),
  refund: (data) => api.post('/payments/refund', data),
};

export const agenciesAPI = {
  create: (data) => api.post('/agencies', data),
  getOne: (id) => api.get(`/agencies/${id}`),
  update: (id, data) => api.put(`/agencies/${id}`, data),
  manageMember: (id, data) => api.post(`/agencies/${id}/members`, data),
  updateMemberStatus: (id, uid, data) => api.patch(`/agencies/${id}/members/${uid}`, data),
};

export const adminAPI = {
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.patch(`/admin/users/${id}`, data),
  getPendingAgencies: () => api.get('/admin/agencies/pending'),
  updateAgency: (id, data) => api.patch(`/admin/agencies/${id}`, data),
  getAnalytics: (type) => api.get('/admin/analytics', { params: { type } }),
  getDisputes: () => api.get('/admin/disputes'),
};
