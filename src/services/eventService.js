import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api/v1',
    headers: { 'Content-Type': 'application/json' },
});

/**
 * Centralized API service for Event CRUD operations.
 * Uses axios with direct backend URL (no proxy).
 */

// ─── Events ────────────────────────────────────────────────

export async function fetchEvents({ search = '', filter = 'all' } = {}) {
    const params = {};
    if (search) params.search = search;
    if (filter && filter !== 'all') params.filter = filter;

    const { data } = await api.get('/events', { params });
    return data.data.events;
}

export async function fetchEventById(id) {
    const { data } = await api.get(`/events/${id}`);
    return data.data;
}

export async function createEvent(eventData) {
    const isFormData = eventData instanceof FormData;
    const { data } = await api.post('/events', eventData, {
        headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined
    });
    return data.data;
}

export async function updateEvent(id, eventData) {
    const isFormData = eventData instanceof FormData;
    const { data } = await api.put(`/events/${id}`, eventData, {
        headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined
    });
    return data.data;
}

export async function deleteEvent(id) {
    await api.delete(`/events/${id}`);
}

export async function fetchEventStats() {
    const { data } = await api.get('/events/stats');
    return data.data;
}

export async function checkEventOverlap(date, startTime, endTime) {
    const { data } = await api.get('/events/check-overlap', {
        params: { date, startTime, endTime }
    });
    return data.data;
}

// ─── Feed (public, read-only) ──────────────────────────────

export async function fetchFeedEvents({ search = '', filter = 'all', category = 'upcoming', page = 1, limit = 20 } = {}) {
    const params = {};
    if (search) params.search = search;
    if (filter && filter !== 'all') params.filter = filter;
    if (category && category !== 'upcoming') params.category = category;
    if (page > 1) params.page = String(page);
    if (limit !== 20) params.limit = String(limit);

    const { data } = await api.get('/feed', { params });
    return data.data; // { events, pagination }
}

export async function fetchFeedEventDetail(id) {
    const { data } = await api.get(`/feed/${id}`);
    return data.data;
}

// ─── Calendar ──────────────────────────────────────────────

export async function fetchCalendarEvents(month, year) {
    const { data } = await api.get('/feed/calendar', {
        params: { month, year },
    });
    return data.data; // { month, year, totalEvents, events }
}
