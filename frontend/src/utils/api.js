import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

API.interceptors.request.use(config => {
  const u = JSON.parse(localStorage.getItem('user') || 'null');
  if (u?.token) config.headers.Authorization = `Bearer ${u.token}`;
  return config;
});

export const authAPI = {
  register: d => API.post('/auth/register', d),
  login: d => API.post('/auth/login', d),
  providerLogin: d => API.post('/auth/provider-login', d),
  getProfile: () => API.get('/auth/profile'),
  updateProfile: d => API.put('/auth/profile', d),
};

export const servicesAPI = {
  getAll: p => API.get('/services', { params: p }),
  getOne: slug => API.get(`/services/${slug}`),
  create: d => API.post('/services', d),
  update: (id, d) => API.put(`/services/${id}`, d),
  delete: id => API.delete(`/services/${id}`),
};

export const providersAPI = {
  getAll: p => API.get('/providers', { params: p }),
  getOne: id => API.get(`/providers/${id}`),
  smartMatch: d => API.post('/providers/smart-match', d),
  getDashboard: () => API.get('/providers/dashboard'),
  getCities: () => API.get('/providers/cities'),
  updateAvailability: (id, d) => API.put(`/providers/${id}/availability`, d),
  create: d => API.post('/providers', d),
  update: (id, d) => API.put(`/providers/${id}`, d),
  delete: id => API.delete(`/providers/${id}`),
};

export const bookingsAPI = {
  create: d => API.post('/bookings', d),
  getMy: () => API.get('/bookings/my'),
  getAll: p => API.get('/bookings/all', { params: p }),
  getOne: id => API.get(`/bookings/${id}`),
  getInvoice: id => API.get(`/bookings/${id}/invoice`),
  track: (id, d) => API.put(`/bookings/${id}/track`, d),
  cancel: (id, d) => API.put(`/bookings/${id}/cancel`, d),
};

export const reviewsAPI = {
  getForService: slug => API.get(`/reviews/service/${slug}`),
  create: d => API.post('/reviews', d),
  delete: id => API.delete(`/reviews/${id}`),
};

export const messagesAPI = {
  get: bookingId => API.get(`/messages/${bookingId}`),
  send: (bookingId, d) => API.post(`/messages/${bookingId}`, d),
};

export const categoriesAPI = { getAll: () => API.get('/categories') };

export const publicStatsAPI = { getStats: () => API.get('/admin/public-stats') };

export const adminAPI = {
  getStats: () => API.get('/admin/stats'),
  getUsers: () => API.get('/admin/users'),
  toggleUser: id => API.put(`/admin/users/${id}/toggle`),
  updateProvider: (id, d) => API.put(`/admin/providers/${id}`, d),
  changeProviderPassword: (id, d) => API.put(`/admin/providers/${id}/password`, d),
};

export const ALLOWED_CITIES = [
  'Davanagere','Shivamogga','Honnali','Sagar','Bhadravathi',
  'Chitradurga','Tumkur','Mysuru','Mangaluru','Hubballi',
  'Dharwad','Belagavi','Vijayapura','Ballari','Raichur',
  'Kalaburagi','Udupi','Hassan','Mandya','Chikkamagaluru'
];

export default API;
