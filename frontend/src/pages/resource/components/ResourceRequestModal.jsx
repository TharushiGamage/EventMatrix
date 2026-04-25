import { useMemo, useState } from 'react';

function ResourceRequestModal({ isOpen, onClose, onSubmit, resources = [], defaultOrganizer = '' }) {
  const [formData, setFormData] = useState({
    eventName: '',
    organizer: defaultOrganizer,
    date: '',
    startTime: '',
    endTime: '',
    venue: '',
    equipment: [],
  });
  const [errors, setErrors] = useState({});

  const venues = useMemo(() => resources.filter((item) => item.type === 'venue'), [resources]);
  const equipmentList = useMemo(() => resources.filter((item) => item.type === 'equipment'), [resources]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleEquipmentChange = (e) => {
    const { value, checked } = e.target;
    const nextValues = checked
      ? [...formData.equipment, value]
      : formData.equipment.filter((item) => item !== value);

    setFormData((prev) => ({ ...prev, equipment: nextValues }));
  };

  const validateForm = () => {
    const nextErrors = {};
    const today = new Date().toISOString().split('T')[0];

    if (!formData.eventName.trim()) nextErrors.eventName = 'Event name is required';
    if (!formData.organizer.trim()) nextErrors.organizer = 'Organizer name is required';

    if (!formData.date) nextErrors.date = 'Date is required';
    else if (formData.date < today) nextErrors.date = 'Past dates are not allowed';

    if (!formData.startTime) nextErrors.startTime = 'Start time is required';
    if (!formData.endTime) nextErrors.endTime = 'End time is required';
    if (formData.startTime && formData.endTime && formData.endTime <= formData.startTime) {
      nextErrors.endTime = 'End time must be later than start time';
    }

    if (!formData.venue) nextErrors.venue = 'Please select a venue';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    onSubmit(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card clean-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Request Resource Booking</h2>
            <p className="modal-subtitle">Reserve a venue and required equipment for your event.</p>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="resource-form clean-form">
          <div className="form-group">
            <label>Event Name</label>
            <input type="text" name="eventName" placeholder="Enter event name" value={formData.eventName} onChange={handleChange} />
            {errors.eventName && <small className="error-text">{errors.eventName}</small>}
          </div>

          <div className="form-group">
            <label>Organizer Name</label>
            <input type="text" name="organizer" placeholder="Enter organizer name" value={formData.organizer} onChange={handleChange} />
            {errors.organizer && <small className="error-text">{errors.organizer}</small>}
          </div>

          <div className="form-row form-row-3">
            <div className="form-group">
              <label>Event Date</label>
              <input type="date" name="date" value={formData.date} onChange={handleChange} />
              {errors.date && <small className="error-text">{errors.date}</small>}
            </div>

            <div className="form-group">
              <label>Start Time</label>
              <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} />
              {errors.startTime && <small className="error-text">{errors.startTime}</small>}
            </div>

            <div className="form-group">
              <label>End Time</label>
              <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} />
              {errors.endTime && <small className="error-text">{errors.endTime}</small>}
            </div>
          </div>

          <div className="form-group">
            <label>Select Venue</label>
            <select name="venue" value={formData.venue} onChange={handleChange}>
              <option value="">Choose a venue</option>
              {venues.map((venue) => (
                <option key={venue.id} value={venue.name}>{venue.name}</option>
              ))}
            </select>
            {errors.venue && <small className="error-text">{errors.venue}</small>}
          </div>

          <div className="form-group">
            <label>Required Equipment</label>
            <div className="equipment-grid">
              {equipmentList.length > 0 ? equipmentList.map((item) => (
                <label key={item.id} className="equipment-item">
                  <input type="checkbox" value={item.name} checked={formData.equipment.includes(item.name)} onChange={handleEquipmentChange} />
                  <span>{item.name}</span>
                </label>
              )) : <p className="empty-text">No equipment available</p>}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="secondary-btn" onClick={onClose}>Close</button>
            <button type="submit" className="primary-btn">Submit Request</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ResourceRequestModal;
