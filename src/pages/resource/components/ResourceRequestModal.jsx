import { useState } from "react";

function ResourceRequestModal({ isOpen, onClose, onSubmit, resources = [] }) {
  const [formData, setFormData] = useState({
    eventName: "",
    organizer: "",
    date: "",
    startTime: "",
    endTime: "",
    venue: "",
    equipment: [],
  });

  if (!isOpen) return null;

  const venues = resources.filter((item) => item.type === "venue");
  const equipmentList = resources.filter((item) => item.type === "equipment");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEquipmentChange = (e) => {
    const value = e.target.value;
    const checked = e.target.checked;

    setFormData((prev) => ({
      ...prev,
      equipment: checked
        ? [...prev.equipment, value]
        : prev.equipment.filter((item) => item !== value),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h2>Request Resource Booking</h2>

        <form onSubmit={handleSubmit} className="resource-form">
          <input
            type="text"
            name="eventName"
            placeholder="Event Name"
            value={formData.eventName}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="organizer"
            placeholder="Organizer Name"
            value={formData.organizer}
            onChange={handleChange}
            required
          />

          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />

          <input
            type="time"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            required
          />

          <input
            type="time"
            name="endTime"
            value={formData.endTime}
            onChange={handleChange}
            required
          />

          <select
            name="venue"
            value={formData.venue}
            onChange={handleChange}
            required
          >
            <option value="">Select Venue</option>
            {venues.map((venue) => (
              <option key={venue.id} value={venue.name}>
                {venue.name}
              </option>
            ))}
          </select>

          <div>
            <p>Select Equipment</p>
            {equipmentList.map((item) => (
              <label key={item.id} style={{ display: "block", marginBottom: "6px" }}>
                <input
                  type="checkbox"
                  value={item.name}
                  onChange={handleEquipmentChange}
                />
                {" "}{item.name}
              </label>
            ))}
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit">Submit Request</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ResourceRequestModal;