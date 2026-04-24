function Dashboard({ user, onNavigate }) {
  const isResourceManager = user?.role === "ResourceManager";

  const roleLabel =
    user?.role === "ResourceManager" ? "Resource Manager" : "Organizer";

  const resourceManagerCards = [
    {
      title: "Resource Inventory",
      description:
        "Add, update, remove and manage venues, equipment, labs and other event resources.",
      action: "Manage Resources",
      page: "list",
      badge: "Manager",
    },
    {
      title: "Request Approval",
      description:
        "Review organizer resource requests and approve or reject them based on availability.",
      action: "Review Requests",
      page: "approval",
      badge: "Workflow",
    },
    {
      title: "Availability Control",
      description:
        "Check booked dates, prevent double booking and monitor available resources.",
      action: "Check Availability",
      page: "availability",
      badge: "Calendar",
    },
    {
      title: "Issue Management",
      description:
        "Review reported damages or technical issues and mark resources as resolved after maintenance.",
      action: "Manage Issues",
      page: "issueManage",
      badge: "Maintenance",
    },
  ];

  const organizerCards = [
    {
      title: "Reserve Resource",
      description:
        "Request venues or equipment for university events, workshops and club activities.",
      action: "Create Request",
      page: "reserve",
      badge: "Request",
    },
    {
      title: "Availability View",
      description:
        "Check booked dates and available resources before submitting a reservation request.",
      action: "View Availability",
      page: "availability",
      badge: "Calendar",
    },
    {
      title: "Issue Reporting",
      description:
        "Report damaged, missing or faulty resources so they can be reviewed by the Resource Manager.",
      action: "Report Issue",
      page: "issue",
      badge: "Support",
    },
    {
      title: "Notifications",
      description:
        "View request confirmations, approval updates, issue updates and system messages.",
      action: "View Messages",
      page: "notifications",
      badge: "Updates",
    },
  ];

  const cards = isResourceManager ? resourceManagerCards : organizerCards;

  return (
    <div className="dashboard-page">
      <section className="dashboard-hero">
        <div>
          <span className="dashboard-kicker">EventMatrix Resource Module</span>
          <h2>Welcome, {roleLabel}</h2>
          <p>
            Manage event resources, booking requests, availability records and
            issue workflows from one place.
          </p>
        </div>

        <div className="dashboard-role-panel">
          <span>Logged in as</span>
          <strong>{roleLabel}</strong>
        </div>
      </section>

      <section className="dashboard-stats-grid">
        <div className="dashboard-stat-card">
          <span className="stat-icon">01</span>
          <h3>Resources</h3>
          <p>Venues, equipment and facilities are managed centrally.</p>
        </div>

        <div className="dashboard-stat-card">
          <span className="stat-icon">02</span>
          <h3>Bookings</h3>
          <p>Requests are tracked from submission to approval.</p>
        </div>

        <div className="dashboard-stat-card">
          <span className="stat-icon">03</span>
          <h3>Availability</h3>
          <p>Overlapping reservations are prevented through availability checks.</p>
        </div>

        <div className="dashboard-stat-card">
          <span className="stat-icon">04</span>
          <h3>Issues</h3>
          <p>Damages and maintenance issues are reported and resolved.</p>
        </div>
      </section>

      <section className="dashboard-section-header">
        <div>
          <h2>{roleLabel} Workspace</h2>
          <p>
            Select a function below to continue with your resource management
            tasks.
          </p>
        </div>
      </section>

      <section className="dashboard-feature-grid">
        {cards.map((card) => (
          <div className="dashboard-feature-card" key={card.title}>
            <div className="feature-card-top">
              <span className="feature-badge">{card.badge}</span>
            </div>

            <h3>{card.title}</h3>
            <p>{card.description}</p>

            <button
              type="button"
              className="feature-action-btn"
              onClick={() => onNavigate(card.page)}
            >
              {card.action}
            </button>
          </div>
        ))}
      </section>

      <section className="dashboard-flow-card">
        <div>
          <h3>Module Workflow</h3>
          <p>
            Organizer requests a resource → system checks availability → Resource
            Manager reviews request → booking status and notifications are
            updated.
          </p>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;