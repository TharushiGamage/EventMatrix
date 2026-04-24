import { useEffect, useMemo, useState } from "react";
import api from "../utils/api";

function AvailabilityCalendar() {
  const [resources, setResources] = useState([]);
  const [requests, setRequests] = useState([]);
  const [selectedResource, setSelectedResource] = useState("All");
  const [selectedDate, setSelectedDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setMessage("");

      const resourcesResponse = await api.get("/resources");
      const requestsResponse = await api.get("/resource-requests");

      setResources(resourcesResponse.data.data || []);
      setRequests(requestsResponse.data.data || []);
    } catch (error) {
      setMessage(
        error.response?.data?.message ||
          "Failed to load availability calendar data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const blockingBookings = useMemo(() => {
    let filtered = requests.filter(
      (request) => request.status === "Pending" || request.status === "Approved"
    );

    if (selectedResource !== "All") {
      filtered = filtered.filter(
        (request) => request.resource?._id === selectedResource
      );
    }

    if (selectedDate) {
      filtered = filtered.filter((request) => {
        const requestDate = new Date(request.requiredDate)
          .toISOString()
          .split("T")[0];

        return requestDate === selectedDate;
      });
    }

    return filtered;
  }, [requests, selectedResource, selectedDate]);

  const approvedCount = blockingBookings.filter(
    (request) => request.status === "Approved"
  ).length;

  const pendingCount = blockingBookings.filter(
    (request) => request.status === "Pending"
  ).length;

  const uniqueDates = [
    ...new Set(
      blockingBookings.map((request) =>
        new Date(request.requiredDate).toISOString().split("T")[0]
      )
    ),
  ];

  const clearFilters = () => {
    setSelectedResource("All");
    setSelectedDate("");
  };

  return (
    <div className="module-page">
      <section className="module-hero">
        <div>
          <span className="dashboard-kicker">Availability Control</span>
          <h2>Availability Calendar</h2>
          <p>
            Check pending and approved bookings by resource and date before
            creating a new reservation.
          </p>
        </div>

        <div className="module-role-card">
          <span>Blocking Bookings</span>
          <strong>{blockingBookings.length}</strong>
        </div>
      </section>

      <section className="module-stats-grid">
        <div className="module-stat-card">
          <span className="stat-icon">01</span>
          <h3>{blockingBookings.length}</h3>
          <p>Blocking Bookings</p>
        </div>

        <div className="module-stat-card">
          <span className="stat-icon">02</span>
          <h3>{uniqueDates.length}</h3>
          <p>Booked Dates</p>
        </div>

        <div className="module-stat-card">
          <span className="stat-icon">03</span>
          <h3>{approvedCount}</h3>
          <p>Approved</p>
        </div>

        <div className="module-stat-card">
          <span className="stat-icon">04</span>
          <h3>{pendingCount}</h3>
          <p>Pending</p>
        </div>
      </section>

      <section className="module-card">
        <div className="table-header">
          <div>
            <h2>Booked Dates View</h2>
            <p className="subtitle">
              Use resource and date filters to identify available or occupied
              time slots.
            </p>
          </div>

          <button className="secondary-button" onClick={fetchData}>
            Refresh
          </button>
        </div>

        <div className="module-filter-row">
          <select
            value={selectedResource}
            onChange={(event) => setSelectedResource(event.target.value)}
          >
            <option value="All">All Resources</option>
            {resources.map((resource) => (
              <option key={resource._id} value={resource._id}>
                {resource.resourceName} - {resource.resourceType}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
          />

          <button className="secondary-button" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>

        {message && <div className="error-box">{message}</div>}

        {loading ? (
          <p>Loading availability calendar...</p>
        ) : blockingBookings.length === 0 ? (
          <div className="success-box">
            No pending or approved bookings found for the selected filter. This
            date/time may be available.
          </div>
        ) : (
          <>
            <div className="calendar-grid">
              {blockingBookings.map((request) => (
                <div className="booking-card" key={request._id}>
                  <div className="booking-card-header">
                    <h3>
                      {new Date(request.requiredDate).toLocaleDateString()}
                    </h3>
                    <span className={`status ${request.status.toLowerCase()}`}>
                      {request.status}
                    </span>
                  </div>

                  <p>
                    <strong>Resource:</strong>{" "}
                    {request.resource?.resourceName || "Resource not found"}
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
                  {blockingBookings.map((request) => (
                    <tr key={request._id}>
                      <td>{new Date(request.requiredDate).toLocaleDateString()}</td>
                      <td>{request.resource?.resourceName || "Resource not found"}</td>
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
      </section>
    </div>
  );
}

export default AvailabilityCalendar;