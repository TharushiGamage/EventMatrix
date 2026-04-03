// registrationService.js
// Uses the authenticated axios instance from userApi (auto-injects JWT, auto-logout on 401)
import api from './userApi';

// ── Registrations ────────────────────────────────────────────────────────────

export const registrationService = {
  // POST /api/v1/registrations
  register: async (payload) => {
    const res = await api.post('/v1/registrations', payload);
    return res.data;
  },

  // POST /api/v1/registrations/:id/upload-receipt  (multipart)
  uploadReceipt: async (registrationId, formData) => {
    const res = await api.post(`/v1/registrations/${registrationId}/upload-receipt`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  // GET /api/v1/registrations/my
  getMyRegistrations: async () => {
    const res = await api.get('/v1/registrations/my');
    return res.data.data;
  },

  // DELETE /api/v1/registrations/:id
  cancelRegistration: async (registrationId) => {
    const res = await api.delete(`/v1/registrations/${registrationId}`);
    return res.data;
  },

  // GET /api/v1/registrations/dashboard-stats  (Organizer)
  getDashboardStats: async (eventIds = []) => {
    if (!eventIds.length) return { pendingPayments: 0, approvedPayments: 0 };
    const res = await api.get('/v1/registrations/dashboard-stats', { params: { eventIds: eventIds.join(',') } });
    return res.data.data;
  },

  // GET /api/v1/registrations/pending  (Organizer)
  getPendingRegistrations: async (eventId = null) => {
    const params = eventId ? { eventId } : {};
    const res = await api.get('/v1/registrations/pending', { params });
    return res.data.data;
  },

  // GET /api/v1/registrations/approved  (Organizer)
  getApprovedRegistrations: async () => {
    const res = await api.get('/v1/registrations/approved');
    return res.data.data;
  },

  // PUT /api/v1/registrations/:id/review  (Organizer)
  reviewRegistration: async (registrationId, action, notes = '') => {
    const res = await api.put(`/v1/registrations/${registrationId}/review`, { action, notes });
    return res.data;
  },

  // GET /api/v1/registrations/attendance/:eventId
  getAttendance: async (eventId) => {
    const res = await api.get(`/v1/registrations/attendance/${eventId}`);
    return res.data.data;
  },

  // GET /api/v1/registrations/:id/qr-code
  getQrCode: async (registrationId) => {
    const res = await api.get(`/v1/registrations/${registrationId}/qr-code`);
    return res.data.data;
  },

  // GET /api/v1/registrations/validate-qr/:token
  validateQrCode: async (token) => {
    const res = await api.get(`/v1/registrations/validate-qr/${token}`);
    return res.data.data;
  },
};

// ── Notifications ─────────────────────────────────────────────────────────────

export const notificationService = {
  // GET /api/v1/notifications
  getAll: async (unreadOnly = false) => {
    const res = await api.get('/v1/notifications', { params: unreadOnly ? { unreadOnly: 'true' } : {} });
    return res.data.data; // { notifications, unreadCount }
  },

  // PUT /api/v1/notifications/:id/read
  markRead: async (id) => {
    const res = await api.put(`/v1/notifications/${id}/read`);
    return res.data;
  },

  // PUT /api/v1/notifications/read-all
  markAllRead: async () => {
    const res = await api.put('/v1/notifications/read-all');
    return res.data;
  },
};
