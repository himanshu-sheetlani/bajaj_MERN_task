import axios from 'axios';

const api = axios.create({
  baseURL: 'https://bajaj-mern-task-1.onrender.com'
});

export const getTickets = (params) => api.get('/tickets', { params }).then(res => res.data);
export const getStats = () => api.get('/tickets/stats').then(res => res.data);
export const createTicket = (data) => api.post('/tickets', data).then(res => res.data);
export const updateStatus = (id, status) => api.patch(`/tickets/${id}`, { status }).then(res => res.data);
export const deleteTicket = (id) => api.delete(`/tickets/${id}`).then(res => res.data);
