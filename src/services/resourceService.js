import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

const mockResources = [
  {
    id: 'venue-1',
    name: 'Main Auditorium',
    type: 'venue',
    category: 'Auditorium',
    location: 'Block A',
    capacity: 400,
    status: 'available',
    quantity: 1,
    availableQuantity: 1,
    description: 'Suitable for large university events and guest sessions.',
  },
  {
    id: 'venue-2',
    name: 'Seminar Hall 02',
    type: 'venue',
    category: 'Lecture Hall',
    location: 'Engineering Faculty',
    capacity: 120,
    status: 'reserved',
    quantity: 1,
    availableQuantity: 0,
    description: 'Best for workshops, seminars, and society meetings.',
  },
  {
    id: 'equip-1',
    name: 'Projector Set',
    type: 'equipment',
    category: 'Projector',
    location: 'Stores Unit',
    capacity: null,
    status: 'available',
    quantity: 8,
    availableQuantity: 5,
    description: 'Portable HD projectors with HDMI support.',
  },
  {
    id: 'equip-2',
    name: 'Wireless Microphone',
    type: 'equipment',
    category: 'Audio',
    location: 'AV Room',
    capacity: null,
    status: 'maintenance',
    quantity: 10,
    availableQuantity: 0,
    description: 'Used for speeches, panels, and stage sessions.',
  },
  {
    id: 'equip-3',
    name: 'Sound System',
    type: 'equipment',
    category: 'Audio',
    location: 'AV Room',
    capacity: null,
    status: 'available',
    quantity: 3,
    availableQuantity: 2,
    description: 'Portable speaker and mixer package.',
  },
];

const mockBookings = [
  {
    id: 'book-1',
    eventName: 'AI Club Workshop',
    organizer: 'Computing Society',
    eventDate: '2026-03-26',
    startTime: '09:00',
    endTime: '12:00',
    venueId: 'venue-2',
    venueName: 'Seminar Hall 02',
    equipment: [
      { resourceId: 'equip-1', name: 'Projector Set', quantity: 1 },
      { resourceId: 'equip-3', name: 'Sound System', quantity: 1 },
    ],
    status: 'confirmed',
  },
];

function makeSuggestions({ venueId, equipment = [] }) {
  const venueAlternatives = mockResources
    .filter((item) => item.type === 'venue' && item.id !== venueId && item.status === 'available')
    .slice(0, 3)
    .map((item) => ({ id: item.id, name: item.name, reason: 'Available at requested time' }));

  const equipmentAlternatives = equipment.flatMap((requested) =>
    mockResources
      .filter(
        (item) =>
          item.type === 'equipment' &&
          item.id !== requested.resourceId &&
          item.category === requested.category &&
          item.availableQuantity > 0
      )
      .slice(0, 2)
      .map((item) => ({
        requested: requested.name,
        alternativeId: item.id,
        alternativeName: item.name,
        availableQuantity: item.availableQuantity,
      }))
  );

  return { venueAlternatives, equipmentAlternatives };
}

function checkMockAvailability(payload) {
  const conflicts = [];
  const selectedVenue = mockResources.find((item) => item.id === payload.venueId);
  if (!selectedVenue || selectedVenue.status !== 'available') {
    conflicts.push({ type: 'venue', message: 'Selected venue is not available for reservation.' });
  }

  (payload.equipment || []).forEach((requestedItem) => {
    const stock = mockResources.find((item) => item.id === requestedItem.resourceId);
    if (!stock || stock.status === 'maintenance') {
      conflicts.push({
        type: 'equipment',
        message: `${requestedItem.name} is currently under maintenance or unavailable.`,
      });
      return;
    }

    if ((stock.availableQuantity || 0) < requestedItem.quantity) {
      conflicts.push({
        type: 'equipment',
        message: `${requestedItem.name} does not have enough available units.`,
      });
    }
  });

  return {
    available: conflicts.length === 0,
    conflicts,
    suggestions: makeSuggestions(payload),
  };
}

export async function fetchResources(params = {}) {
  try {
    const { data } = await api.get('/resources', { params });
    return data.data.resources;
  } catch {
    const { search = '', type = 'all', status = 'all' } = params;
    return mockResources.filter((item) => {
      const matchesSearch = !search || [item.name, item.category, item.location].join(' ').toLowerCase().includes(search.toLowerCase());
      const matchesType = type === 'all' || item.type === type;
      const matchesStatus = status === 'all' || item.status === status;
      return matchesSearch && matchesType && matchesStatus;
    });
  }
}

export async function fetchResourceStats() {
  try {
    const { data } = await api.get('/resources/stats');
    return data.data;
  } catch {
    const venues = mockResources.filter((item) => item.type === 'venue').length;
    const equipment = mockResources.filter((item) => item.type === 'equipment').length;
    const available = mockResources.filter((item) => item.status === 'available').length;
    const maintenance = mockResources.filter((item) => item.status === 'maintenance').length;
    return { totalResources: mockResources.length, venues, equipment, available, maintenance };
  }
}

export async function fetchResourceBookings() {
  try {
    const { data } = await api.get('/resources/bookings');
    return data.data.bookings;
  } catch {
    return mockBookings;
  }
}

export async function createResourceBooking(payload) {
  try {
    const { data } = await api.post('/resources/bookings', payload);
    return data.data;
  } catch {
    const availability = checkMockAvailability(payload);
    if (!availability.available) {
      return {
        success: false,
        ...availability,
      };
    }

    return {
      success: true,
      booking: {
        id: `book-${Date.now()}`,
        eventName: payload.eventName,
        organizer: payload.organizer,
        eventDate: payload.eventDate,
        startTime: payload.startTime,
        endTime: payload.endTime,
        venueId: payload.venueId,
        venueName: mockResources.find((item) => item.id === payload.venueId)?.name || 'Selected Venue',
        equipment: payload.equipment || [],
        status: 'confirmed',
      },
      message: 'Resources reserved successfully.',
    };
  }
}

export async function checkResourceAvailability(payload) {
  try {
    const { data } = await api.post('/resources/check-availability', payload);
    return data.data;
  } catch {
    return checkMockAvailability(payload);
  }
}
