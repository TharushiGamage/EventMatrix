import { useEffect, useState } from "react";
import axios from "axios";

function AvailabilityCalendar() {
  const [resources, setResources] = useState([]);
  const [requests, setRequests] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [selectedResource, setSelectedResource] = useState("All");
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setMessage("");

      const resourcesResponse = await axios.get(
        "http://localhost:5000/api/v1/resources"
      );

      const requestsResponse = await axios.get(
        "http://localhost:5000/api/v1/resource-requests"
      );

      const resourceData = resourcesResponse.data.data || [];
      const requestData = requestsResponse.data.data || [];

      setResources(resourceData);
      setRequests(requestData);

      const blockingBookings = requestData.filter(
        (request) =>
          request.status === "Pending" || request.status === "Approved"
      );

      setFilteredBookings(blockingBookings);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to load availability calendar data";
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const applyFilters = (resourceValue, dateValue) => {
    let filtered = requests.filter(
      (request) => request.status === "Pending" || request.status === "Approved"
    );

    if (resourceValue !== "All") {
      filtered = filtered.filter(
        (request) => request.resource?._id === resourceValue
      );
    }

    if (dateValue) {
      filtered = filtered.filter((request) => {
        const requestDate = new Date(request.requiredDate)
          .toISOString()
          .split("T")[0];

        return requestDate === dateValue;
      });
    }

    setFilteredBookings(filtered);
  };

  const handleResourceChange = (event) => {
    const value = event.target.value;
    setSelectedResource(value);
    applyFilters(value, selectedDate);
  };

  const handleDateChange = (event) => {
    const value = event.target.value;
    setSelectedDate(value);
    applyFilters(selectedResource, value);
  };

  const clearFilters = () => {
    setSelectedResource("All");
    setSelectedDate("");

    const blockingBookings = requests.filter(
      (request) => request.status === "Pending" || request.status === "Approved"
    );

    setFilteredBookings(blockingBookings);
  };

  const formatDate = (dateValue) => {
    return new Date(dateValue).toLocaleDateString();
  };

  const getResourceName = (request) => {
    return request.resource?.resourceName || "Resource not found";
  };

  const getUniqueBookedDates = () => {
    const dates = filteredBookings.map((request) =>
      new Date(request.requiredDate).toISOString().split("T")[0]
    );

    return [...new Set(dates)];
  };

  return (
    <div className="page-container">
      <div className="table-card">
        <div className="table-header">
          <div>
            <h1>Availability Calendar</h1>
            <p className="subtitle">
              View booked and pending resource time slots to check availability
              before creating a new reservation.
            </p>
          </div>

          <button className="secondary-button" onClick={fetchData}>
            Refresh
          </button>
        </div>

        {message && <div className="error-box">{message}</div>}

        <div className="calendar-controls">
          <div className="filter-row">
            <label>Filter by Resource</label>
            <select value={selectedResource} onChange={handleResourceChange}>
              <option value="All">All Resources</option>
              {resources.map((resource) => (
                <option key={resource._id} value={resource._id}>
                  {resource.resourceName} - {resource.resourceType}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-row">
            <label>Filter by Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
            />
          </div>

          <button className="secondary-button clear-button" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>

        <div className="summary-row">
          <div className="summary-box">
            <h3>{filteredBookings.length}</h3>
            <p>Blocking Bookings</p>
          </div>

          <div className="summary-box">
            <h3>{getUniqueBookedDates().length}</h3>
            <p>Booked Dates</p>
          </div>

          <div className="summary-box">
            <h3>
              {
                filteredBookings.filter(
                  (request) => request.status === "Approved"
                ).length
              }
            </h3>
            <p>Approved</p>
          </div>

          <div className="summary-box">
            <h3>
              {
                filteredBookings.filter((request) => request.status === "Pending")
                  .length
              }
            </h3>
            <p>Pending</p>
          </div>
        </div>

        {loading ? (
          <p>Loading availability calendar...</p>
        ) : filteredBookings.length === 0 ? (
          <div className="success-box">
            No pending or approved bookings found for the selected filter. This
            time/date may be available.
          </div>
        ) : (
          <>
            <div className="calendar-grid">
              {filteredBookings.map((request) => (
                <div className="booking-card" key={request._id}>
                  <div className="booking-card-header">
                    <h3>{formatDate(request.requiredDate)}</h3>
                    <span className={`status ${request.status.toLowerCase()}`}>
                      {request.status}
                    </span>
                  </div>

                  <p>
                    <strong>Resource:</strong> {getResourceName(request)}
                  </p>
                  <p>
                    <strong>Event:</strong> {request.eventName}
                  </p>
                  <p>
                    <strong>Time:</strong> {request.startTime} -{" "}
                    {request.endTime}
                  </p>
                  <p>
                    <strong>Organizer:</strong> {request.organizerName}
                  </p>
                </div>
              ))}
            </div>

            <div className="table-wrapper availability-table">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Resource</th>
                    <th>Event</th>
                    <th>Time Slot</th>
                    <th>Status</th>
                    <th>Organizer</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredBookings.map((request) => (
                    <tr key={request._id}>
                      <td>{formatDate(request.requiredDate)}</td>
                      <td>{getResourceName(request)}</td>
                      <td>{request.eventName}</td>
                      <td>
                        {request.startTime} - {request.endTime}
                      </td>
                      <td>
                        <span
                          className={`status ${request.status.toLowerCase()}`}
                        >
                          {request.status}
                        </span>
                      </td>
                      <td>{request.organizerName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AvailabilityCalendar;