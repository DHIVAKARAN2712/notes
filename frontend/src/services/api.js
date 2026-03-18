import axios from 'axios';

const api = axios.create({ baseURL: '/api', headers: { 'Content-Type': 'application/json' } });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('eduwallet_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, err => Promise.reject(err));

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('eduwallet_token');
      localStorage.removeItem('eduwallet_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register:       d => api.post('/auth/register', d),
  login:          d => api.post('/auth/login', d),
  getProfile:     () => api.get('/auth/profile'),
  updateProfile:  d => api.put('/auth/profile', d),
  changePassword: d => api.put('/auth/change-password', d),
  getAllUsers:     () => api.get('/auth/users'),
  grantAdmin:     id => api.patch(`/auth/users/${id}/grant-admin`),
};

export const notesAPI = {
  upload:     fd => api.post('/notes/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getAll:     p => api.get('/notes', { params: p }),
  getById:    id => api.get(`/notes/${id}`),
  delete:     id => api.delete(`/notes/${id}`),
  restore:    id => api.patch(`/notes/${id}/restore`),
  getTrash:   () => api.get('/notes/trash'),
  save:       id => api.post('/notes/save', { note_id: id }),
  getSaved:   () => api.get('/notes/saved'),
  addComment: d => api.post('/notes/comment', d),
  download:   id => api.get(`/notes/${id}/download`, { responseType: 'blob' }),
  getNotifications:     () => api.get('/notes/notifications'),
  markNotificationsRead:() => api.patch('/notes/notifications/read'),
};

export const groupsAPI = {
  create:       d => api.post('/groups/create', d),
  join:         code => api.post('/groups/join', { invite_code: code }),
  getAll:       () => api.get('/groups'),
  getById:      id => api.get(`/groups/${id}`),
  delete:       id => api.delete(`/groups/${id}`),
  removeMember: (g,u) => api.delete(`/groups/${g}/members/${u}`),
};

export const messagesAPI = {
  getConversations: () => api.get('/messages/conversations'),
  getMessages:      id => api.get(`/messages/conversations/${id}`),
  send:             d => api.post('/messages/send', d),
  getContacts:      () => api.get('/messages/contacts'),
  getUnread:        () => api.get('/messages/unread'),
};

export const aiAPI = {
  summarize:  noteId => api.get(`/ai/notes/${noteId}/summary`),
  ask:        (noteId, question) => api.post(`/ai/notes/${noteId}/ask`, { question }),
  getHistory: noteId => api.get(`/ai/notes/${noteId}/history`),
  clarify:    (question, subject, noteContext) => api.post('/ai/clarify', { question, subject, noteContext }),
};

export default api;
