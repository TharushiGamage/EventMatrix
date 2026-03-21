import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchResources,
  fetchResourceStats,
  fetchResourceBookings,
  checkResourceAvailability,
  createResourceBooking,
} from '../../services/resourceService';

import ResourceRequestModal from './components/ResourceRequestModal';

function StatusBadge({ status }) {
  const className = {
    available: 'resource-badge resource-badge-available',
    reserved: 'resource-badge resource-badge-reserved',
    maintenance: 'resource-badge resource-badge-maintenance',
  }[status] || 'resource-badge';

  return <span className={className}>{status}</span>;
}

function ResourceCard({ resource, onRequest }) {
  return (
    <article className="resource-card">
      <div className="resource-card-top">
        <div>
          <p className="resource-type">{resource.type}</p>
          <h3>{resource.name}</h3>
        </div>
        <StatusBadge status={resource.status} />
      </div>

      <div className="resource-card-meta">
        <span>{resource.category}</span>
        <span>{resource.location}</span>
        {resource.type === 'venue' ? <span>Capacity {resource.capacity}</span> : <span>{resource.availableQuantity}/{resource.quantity} available</span>}
      </div>

      <p className="resource-card-desc">{resource.description}</p>

      <button
        className="btn btn-primary"
        onClick={() => onRequest(resource)}
        disabled={resource.status !== 'available'}
      >
        Request Resource
      </button>
    </article>
  );
}

function BookingRow({ booking }) {
  return (
    <tr>
      <td>{booking.eventName}</td>
      <td>{booking.organizer}</td>
      <td>{booking.venueName}</td>
      <td>{booking.eventDate}</td>
      <td>{booking.startTime} - {booking.endTime}</td>
      <td><span className="booking-status">{booking.status}</span></td>
    </tr>
  );
}

export default function ResourceManagement() {
  const [resources, setResources] = useState([]);
  const [stats, setStats] = useState({ totalResources: 0, venues: 0, equipment: 0, available: 0, maintenance: 0 });
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedResource, setSelectedResource] = useState(null);
  const [availabilityResult, setAvailabilityResult] = useState(null);
  const [bookingMessage, setBookingMessage] = useState(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [resourceData, statsData, bookingData] = await Promise.all([
        fetchResources({ search, type, status }),
        fetchResourceStats(),
        fetchResourceBookings(),
      ]);
      setResources(resourceData);
      setStats(statsData);
      setBookings(bookingData);
    } catch (err) {
      setError(err.message || 'Failed to load resource data');
    } finally {
      setLoading(false);
    }
  }, [search, type, status]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const venueOptions = useMemo(() => resources.filter((item) => item.type === 'venue'), [resources]);
  const equipmentOptions = useMemo(() => resources.filter((item) => item.type === 'equipment'), [resources]);

  const handleAvailabilityCheck = async (payload) => {
    const result = await checkResourceAvailability(payload);
    setAvailabilityResult(result);
    return result;
  };

  const handleCreateBooking = async (payload) => {
    const result = await createResourceBooking(payload);
    setAvailabilityResult(result.success ? null : result);

    if (result.success) {
      setBookingMessage(result.message || 'Booking confirmed.');
      setSelectedResource(null);
      await loadData();
    }

    return result;
  };

  return (
    <div className="dashboard resource-page">
      <header className="dashboard-header resource-header">
        <div>
          <h1 className="dashboard-title">Resource Management</h1>
          <p className="dashboard-subtitle">Manage venues, equipment, availability, and conflict-free reservations.</p>
        </div>
        <div className="resource-header-actions">
          <Link className="btn btn-ghost" to="/">Back to Events</Link>
          <button className="btn btn-primary btn-lg" onClick={() => setSelectedResource({ type: 'manual' })}>
            New Resource Request
          </button>
        </div>
      </header>

      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => setError(null)}>&times;</button>
        </div>
      )}

      {bookingMessage && (
        <div className="success-banner">
          <span>{bookingMessage}</span>
          <button onClick={() => setBookingMessage(null)}>&times;</button>
        </div>
      )}

      <section className="stats-bar resource-stats-bar">
        <div className="stat-card stat-total"><span className="stat-number">{stats.totalResources}</span><span className="stat-label">Total Resources</span></div>
        <div className="stat-card stat-upcoming"><span className="stat-number">{stats.venues}</span><span className="stat-label">Venues</span></div>
        <div className="stat-card stat-free"><span className="stat-number">{stats.equipment}</span><span className="stat-label">Equipment</span></div>
        <div className="stat-card stat-paid"><span className="stat-number">{stats.available}</span><span className="stat-label">Available Now</span></div>
      </section>

      <section className="toolbar">
        <div className="search-box">
          <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder="Search by resource name, category, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="resource-filter-row">
          <select className="resource-select" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="all">All Types</option>
            <option value="venue">Venues</option>
            <option value="equipment">Equipment</option>
          </select>

          <select className="resource-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
      </section>

      <section className="resource-layout">
        <div className="resource-grid-panel">
          <div className="section-title-row">
            <h2>Inventory</h2>
            <span>{resources.length} items</span>
          </div>

          <div className="resource-grid">
            {loading ? (
              <div className="empty-state"><div className="spinner"></div><p>Loading resources...</p></div>
            ) : resources.length ? (
              resources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} onRequest={setSelectedResource} />
              ))
            ) : (
              <div className="empty-state"><h3>No resources found</h3><p>Try changing the filters or search term.</p></div>
            )}
          </div>
        </div>

        <aside className="booking-panel">
          <div className="section-title-row">
            <h2>Recent Bookings</h2>
            <span>{bookings.length} records</span>
          </div>

          <div className="booking-table-wrap">
            <table className="booking-table">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Organizer</th>
                  <th>Venue</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.length ? bookings.map((booking) => <BookingRow key={booking.id} booking={booking} />) : (
                  <tr><td colSpan="6" className="booking-empty">No bookings yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {availabilityResult && !availabilityResult.available && (
            <div className="conflict-box">
              <h3>Conflict detected</h3>
              <ul>
                {availabilityResult.conflicts?.map((item, index) => <li key={index}>{item.message}</li>)}
              </ul>

              {(availabilityResult.suggestions?.venueAlternatives?.length > 0 || availabilityResult.suggestions?.equipmentAlternatives?.length > 0) && (
                <div className="suggestion-box">
                  <h4>Suggested alternatives</h4>
                  {availabilityResult.suggestions.venueAlternatives?.map((item) => (
                    <p key={item.id}>Venue: {item.name}</p>
                  ))}
                  {availabilityResult.suggestions.equipmentAlternatives?.map((item, index) => (
                    <p key={`${item.alternativeId}-${index}`}>{item.requested}: {item.alternativeName}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </aside>
      </section>

      <ResourceRequestModal
        isOpen={Boolean(selectedResource)}
        initialResource={selectedResource}
        venueOptions={venueOptions}
        equipmentOptions={equipmentOptions}
        onClose={() => {
          setSelectedResource(null);
          setAvailabilityResult(null);
        }}
        onCheckAvailability={handleAvailabilityCheck}
        onSubmit={handleCreateBooking}
      />
    </div>
  );
}
