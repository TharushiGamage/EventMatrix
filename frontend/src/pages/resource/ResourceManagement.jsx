import { useEffect, useMemo, useState } from 'react';
import { PackagePlus, Search, Wrench, Building2, CalendarClock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getResources,
  getResourceStats,
  getBookings,
  checkResourceAvailability,
  createResourceBooking,
  createResource,
} from '../../services/resourceService';
import ResourceRequestModal from './components/ResourceRequestModal';

function StatusBadge({ status }) {
  return <span className={`resource-status ${status}`}>{status}</span>;
}

function ResourceManagement() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin' || user?.role === 'ResourceManager';
  const organizerName = user?.name || user?.username || '';

  const [resources, setResources] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({
    totalResources: 0,
    availableResources: 0,
    reservedResources: 0,
    maintenanceResources: 0,
  });

  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bookingMessage, setBookingMessage] = useState('');
  const [bookingMessageType, setBookingMessageType] = useState('');

  const [showEquipmentForm, setShowEquipmentForm] = useState(false);
  const [showVenueForm, setShowVenueForm] = useState(false);
  const [equipmentForm, setEquipmentForm] = useState({
    name: '',
    location: '',
    totalUnits: '',
    availableUnits: '',
    status: 'available',
    description: '',
    category: 'Equipment',
  });
  const [venueForm, setVenueForm] = useState({
    name: '',
    location: '',
    category: 'Venue',
    capacity: '',
    status: 'available',
    description: '',
  });
  const [formErrors, setFormErrors] = useState({});

  const loadPageData = async () => {
    try {
      setLoading(true);
      setPageError('');
      const [resourcesData, statsData, bookingsData] = await Promise.all([
        getResources(),
        getResourceStats(),
        getBookings(),
      ]);
      setResources(Array.isArray(resourcesData) ? resourcesData : []);
      setStats(statsData || {
        totalResources: 0,
        availableResources: 0,
        reservedResources: 0,
        maintenanceResources: 0,
      });
      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
    } catch (error) {
      console.error('Failed to load resource data:', error);
      setPageError(error.response?.data?.message || 'Failed to load resource data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPageData();
  }, []);

  const filteredResources = useMemo(() => resources.filter((resource) => {
    const haystack = [resource.name, resource.category, resource.location, resource.description]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    const matchesSearch = !searchTerm || haystack.includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || resource.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || resource.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  }), [resources, searchTerm, typeFilter, statusFilter]);

  const resetMessages = () => {
    setBookingMessage('');
    setBookingMessageType('');
  };

  const handleBookingSubmit = async (formData) => {
    try {
      resetMessages();
      const availability = await checkResourceAvailability({
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        venue: formData.venue,
        equipment: formData.equipment,
      });

      if (!availability.available) {
        const extra = availability.alternatives?.length ? ` Alternatives: ${availability.alternatives.join(', ')}` : '';
        setBookingMessage(`${availability.message}${extra}`);
        setBookingMessageType('error');
        return;
      }

      await createResourceBooking({
        eventName: formData.eventName,
        organizer: formData.organizer,
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        venue: formData.venue,
        equipment: formData.equipment,
      });

      setBookingMessage('Resource booking created successfully.');
      setBookingMessageType('success');
      await loadPageData();
      setTimeout(() => {
        setIsModalOpen(false);
        resetMessages();
      }, 1000);
    } catch (error) {
      console.error('Booking failed:', error);
      setBookingMessage(error.response?.data?.error?.message || 'Failed to create booking.');
      setBookingMessageType('error');
    }
  };

  const validateEquipmentForm = () => {
    const errors = {};
    if (!equipmentForm.name.trim()) errors.name = 'Equipment name is required';
    if (!equipmentForm.location.trim()) errors.location = 'Location is required';
    if (!equipmentForm.totalUnits) errors.totalUnits = 'Total units is required';
    else if (Number(equipmentForm.totalUnits) <= 0) errors.totalUnits = 'Total units must be greater than 0';
    if (equipmentForm.availableUnits === '') errors.availableUnits = 'Available units is required';
    else if (Number(equipmentForm.availableUnits) < 0) errors.availableUnits = 'Available units cannot be negative';
    else if (Number(equipmentForm.availableUnits) > Number(equipmentForm.totalUnits)) errors.availableUnits = 'Available units cannot exceed total units';
    if (!equipmentForm.description.trim()) errors.description = 'Description is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateVenueForm = () => {
    const errors = {};
    if (!venueForm.name.trim()) errors.venueName = 'Venue name is required';
    if (!venueForm.location.trim()) errors.venueLocation = 'Location is required';
    if (!venueForm.capacity) errors.capacity = 'Capacity is required';
    else if (Number(venueForm.capacity) <= 0) errors.capacity = 'Capacity must be greater than 0';
    if (!venueForm.description.trim()) errors.venueDescription = 'Description is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetEquipmentForm = () => {
    setEquipmentForm({
      name: '',
      location: '',
      totalUnits: '',
      availableUnits: '',
      status: 'available',
      description: '',
      category: 'Equipment',
    });
  };

  const resetVenueForm = () => {
    setVenueForm({
      name: '',
      location: '',
      category: 'Venue',
      capacity: '',
      status: 'available',
      description: '',
    });
  };

  const handleAddEquipment = async (e) => {
    e.preventDefault();
    if (!validateEquipmentForm()) return;
    try {
      await createResource({
        type: 'equipment',
        name: equipmentForm.name.trim(),
        category: equipmentForm.category.trim() || 'Equipment',
        location: equipmentForm.location.trim(),
        totalUnits: Number(equipmentForm.totalUnits),
        availableUnits: Number(equipmentForm.availableUnits),
        status: equipmentForm.status,
        description: equipmentForm.description.trim(),
      });
      resetEquipmentForm();
      setFormErrors({});
      setShowEquipmentForm(false);
      await loadPageData();
    } catch (error) {
      setFormErrors((prev) => ({ ...prev, equipmentForm: error.response?.data?.error?.message || 'Failed to add equipment.' }));
    }
  };

  const handleAddVenue = async (e) => {
    e.preventDefault();
    if (!validateVenueForm()) return;
    try {
      await createResource({
        type: 'venue',
        name: venueForm.name.trim(),
        category: venueForm.category.trim() || 'Venue',
        location: venueForm.location.trim(),
        capacity: Number(venueForm.capacity),
        status: venueForm.status,
        description: venueForm.description.trim(),
      });
      resetVenueForm();
      setFormErrors({});
      setShowVenueForm(false);
      await loadPageData();
    } catch (error) {
      setFormErrors((prev) => ({ ...prev, venueForm: error.response?.data?.error?.message || 'Failed to add venue.' }));
    }
  };

  if (loading) {
    return <div className="resource-management-page"><div className="empty-card">Loading resources and bookings...</div></div>;
  }

  return (
    <div className="resource-management-page">
      <div className="page-header">
        <div>
          <h1>Resource Management</h1>
          <p>Manage venues, equipment, and reservations for university events, workshops, and club activities.</p>
        </div>
        <button type="button" className="primary-btn" onClick={() => { resetMessages(); setIsModalOpen(true); }}>
          <CalendarClock size={18} />
          <span>Request Booking</span>
        </button>
      </div>

      {pageError && <div className="alert-error">{pageError}</div>}

      <div className="stats-grid resource-stats-grid">
        <div className="resource-summary-card summary-total">
          <div className="resource-summary-icon"><PackagePlus size={20} /></div>
          <div className="resource-summary-content">
            <span className="stat-label">Total Resources</span>
            <h3>{stats.totalResources ?? resources.length}</h3>
          </div>
        </div>
        <div className="resource-summary-card summary-available">
          <div className="resource-summary-icon"><Building2 size={20} /></div>
          <div className="resource-summary-content">
            <span className="stat-label">Available</span>
            <h3>{stats.availableResources ?? 0}</h3>
          </div>
        </div>
        <div className="resource-summary-card summary-reserved">
          <div className="resource-summary-icon"><CalendarClock size={20} /></div>
          <div className="resource-summary-content">
            <span className="stat-label">Reserved</span>
            <h3>{stats.reservedResources ?? 0}</h3>
          </div>
        </div>
        <div className="resource-summary-card summary-maintenance">
          <div className="resource-summary-icon"><Wrench size={20} /></div>
          <div className="resource-summary-content">
            <span className="stat-label">Maintenance</span>
            <h3>{stats.maintenanceResources ?? 0}</h3>
          </div>
        </div>
      </div>

      <div className="toolbar-card">
        <div className="toolbar-grid">
          <div className="toolbar-search-wrap">
            <Search size={18} className="toolbar-search-icon" />
            <input
              type="text"
              className="toolbar-search"
              placeholder="Search by resource name, category, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select className="toolbar-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="all">All Types</option>
            <option value="venue">Venue</option>
            <option value="equipment">Equipment</option>
          </select>

          <select className="toolbar-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
      </div>

      {isAdmin && (
        <div className="resource-admin-grid">
          <div className="equipment-admin-section">
            <div className="section-header">
              <div>
                <h2>Equipment Management</h2>
                <p>Add and maintain equipment inventory records</p>
              </div>
              <button type="button" className="primary-btn" onClick={() => { setShowEquipmentForm((prev) => !prev); setShowVenueForm(false); setFormErrors({}); }}>
                {showEquipmentForm ? 'Close Form' : 'Add Equipment'}
              </button>
            </div>
            {showEquipmentForm && (
              <div className="equipment-form-card">
                <form onSubmit={handleAddEquipment} className="equipment-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Equipment Name</label>
                      <input type="text" name="name" value={equipmentForm.name} onChange={(e) => setEquipmentForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Enter equipment name" />
                      {formErrors.name && <small className="error-text">{formErrors.name}</small>}
                    </div>
                    <div className="form-group">
                      <label>Location</label>
                      <input type="text" name="location" value={equipmentForm.location} onChange={(e) => setEquipmentForm((prev) => ({ ...prev, location: e.target.value }))} placeholder="Enter storage location" />
                      {formErrors.location && <small className="error-text">{formErrors.location}</small>}
                    </div>
                  </div>
                  <div className="form-row form-row-3">
                    <div className="form-group">
                      <label>Total Units</label>
                      <input type="number" min="1" value={equipmentForm.totalUnits} onChange={(e) => setEquipmentForm((prev) => ({ ...prev, totalUnits: e.target.value }))} placeholder="Enter total units" />
                      {formErrors.totalUnits && <small className="error-text">{formErrors.totalUnits}</small>}
                    </div>
                    <div className="form-group">
                      <label>Available Units</label>
                      <input type="number" min="0" value={equipmentForm.availableUnits} onChange={(e) => setEquipmentForm((prev) => ({ ...prev, availableUnits: e.target.value }))} placeholder="Enter available units" />
                      {formErrors.availableUnits && <small className="error-text">{formErrors.availableUnits}</small>}
                    </div>
                    <div className="form-group">
                      <label>Status</label>
                      <select value={equipmentForm.status} onChange={(e) => setEquipmentForm((prev) => ({ ...prev, status: e.target.value }))}>
                        <option value="available">Available</option>
                        <option value="reserved">Reserved</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea rows="4" value={equipmentForm.description} onChange={(e) => setEquipmentForm((prev) => ({ ...prev, description: e.target.value }))} placeholder="Enter equipment description" />
                    {formErrors.description && <small className="error-text">{formErrors.description}</small>}
                  </div>
                  {formErrors.equipmentForm && <div className="alert-error">{formErrors.equipmentForm}</div>}
                  <div className="equipment-form-actions">
                    <button type="button" className="secondary-btn" onClick={() => { resetEquipmentForm(); setFormErrors({}); setShowEquipmentForm(false); }}>Cancel</button>
                    <button type="submit" className="primary-btn">Save Equipment</button>
                  </div>
                </form>
              </div>
            )}
          </div>

          <div className="equipment-admin-section">
            <div className="section-header">
              <div>
                <h2>Venue Management</h2>
                <p>Add venue resources for future event bookings</p>
              </div>
              <button type="button" className="primary-btn" onClick={() => { setShowVenueForm((prev) => !prev); setShowEquipmentForm(false); setFormErrors({}); }}>
                {showVenueForm ? 'Close Form' : 'Add Venue'}
              </button>
            </div>
            {showVenueForm && (
              <div className="equipment-form-card">
                <form onSubmit={handleAddVenue} className="equipment-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Venue Name</label>
                      <input type="text" value={venueForm.name} onChange={(e) => setVenueForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Enter venue name" />
                      {formErrors.venueName && <small className="error-text">{formErrors.venueName}</small>}
                    </div>
                    <div className="form-group">
                      <label>Location</label>
                      <input type="text" value={venueForm.location} onChange={(e) => setVenueForm((prev) => ({ ...prev, location: e.target.value }))} placeholder="Enter venue location" />
                      {formErrors.venueLocation && <small className="error-text">{formErrors.venueLocation}</small>}
                    </div>
                  </div>
                  <div className="form-row form-row-3">
                    <div className="form-group">
                      <label>Category</label>
                      <input type="text" value={venueForm.category} onChange={(e) => setVenueForm((prev) => ({ ...prev, category: e.target.value }))} placeholder="Lecture Hall / Auditorium" />
                    </div>
                    <div className="form-group">
                      <label>Capacity</label>
                      <input type="number" min="1" value={venueForm.capacity} onChange={(e) => setVenueForm((prev) => ({ ...prev, capacity: e.target.value }))} placeholder="Enter capacity" />
                      {formErrors.capacity && <small className="error-text">{formErrors.capacity}</small>}
                    </div>
                    <div className="form-group">
                      <label>Status</label>
                      <select value={venueForm.status} onChange={(e) => setVenueForm((prev) => ({ ...prev, status: e.target.value }))}>
                        <option value="available">Available</option>
                        <option value="reserved">Reserved</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea rows="4" value={venueForm.description} onChange={(e) => setVenueForm((prev) => ({ ...prev, description: e.target.value }))} placeholder="Enter venue description" />
                    {formErrors.venueDescription && <small className="error-text">{formErrors.venueDescription}</small>}
                  </div>
                  {formErrors.venueForm && <div className="alert-error">{formErrors.venueForm}</div>}
                  <div className="equipment-form-actions">
                    <button type="button" className="secondary-btn" onClick={() => { resetVenueForm(); setFormErrors({}); setShowVenueForm(false); }}>Cancel</button>
                    <button type="submit" className="primary-btn">Save Venue</button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="resource-section">
        <div className="section-header">
          <div>
            <h2>Inventory</h2>
            <p>{filteredResources.length} items</p>
          </div>
        </div>

        {filteredResources.length === 0 ? (
          <div className="empty-card">No matching resources found.</div>
        ) : (
          <div className="resource-grid inventory-grid-fix">
            {filteredResources.map((resource) => (
              <div key={resource.id} className="resource-card">
                <div className="resource-card-top">
                  <div>
                    <span className={`resource-type ${resource.type}`}>{resource.type}</span>
                    <h3>{resource.name}</h3>
                  </div>
                  <StatusBadge status={resource.status} />
                </div>

                <div className="resource-meta">
                  <div className="meta-item">
                    <span className="meta-label">Location</span>
                    <span className="meta-value">{resource.location || 'N/A'}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">{resource.type === 'venue' ? 'Capacity' : 'Quantity'}</span>
                    <span className="meta-value">{resource.type === 'venue' ? resource.capacity || 'N/A' : `${resource.availableUnits || 0}/${resource.totalUnits || 0} available`}</span>
                  </div>
                </div>

                <p className="resource-description">{resource.description || 'No description available.'}</p>

                <div className="resource-card-actions">
                  <button className="request-btn" onClick={() => { resetMessages(); setIsModalOpen(true); }} disabled={resource.status !== 'available'}>
                    {resource.status === 'available' ? 'Request Resource' : 'Unavailable'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="booking-section">
        <div className="section-header">
          <div>
            <h2>Recent Bookings</h2>
            <p>{bookings.length} records</p>
          </div>
        </div>

        <div className="booking-table-card">
          {bookings.length === 0 ? (
            <div className="empty-state">No booking records found.</div>
          ) : (
            <div className="booking-table-wrapper">
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
                  {bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td>{booking.eventName || 'N/A'}</td>
                      <td>{booking.organizer || 'N/A'}</td>
                      <td>{booking.venue || 'N/A'}</td>
                      <td>{booking.date || 'N/A'}</td>
                      <td>{`${booking.startTime || '--'} - ${booking.endTime || '--'}`}</td>
                      <td><span className={`booking-status ${booking.status || 'pending'}`}>{booking.status || 'pending'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {bookingMessage && <div className={bookingMessageType === 'success' ? 'alert-success' : 'alert-error'}>{bookingMessage}</div>}

      <ResourceRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleBookingSubmit}
        resources={resources}
        defaultOrganizer={organizerName}
      />
    </div>
  );
}

export default ResourceManagement;
