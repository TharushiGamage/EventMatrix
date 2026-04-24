import { useEffect, useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AddResource from "./pages/AddResource";
import ResourceList from "./pages/ResourceList";
import ReserveResource from "./pages/ReserveResource";
import AdminApproval from "./pages/AdminApproval";
import ResourceIssueReport from "./pages/ResourceIssueReport";
import ResourceIssueManagement from "./pages/ResourceIssueManagement";
import ResourceUsageLog from "./pages/ResourceUsageLog";
import AvailabilityCalendar from "./pages/AvailabilityCalendar";
import NotificationHistory from "./pages/NotificationHistory";
import "./index.css";

function App() {
  const [loggedUser, setLoggedUser] = useState(null);
  const [activePage, setActivePage] = useState("dashboard");

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("resourceUser"));

    if (savedUser) {
      setLoggedUser(savedUser);
      setActivePage("dashboard");
    }
  }, []);

  const handleLogin = (user) => {
    setLoggedUser(user);
    setActivePage("dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("resourceUser");
    setLoggedUser(null);
    setActivePage("dashboard");
  };

  if (!loggedUser) {
    return <Login onLogin={handleLogin} />;
  }

  const isResourceManager = loggedUser.role === "ResourceManager";
  const isOrganizer = loggedUser.role === "Organizer";

  const roleLabel =
    loggedUser.role === "ResourceManager" ? "Resource Manager" : loggedUser.role;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-box">
          <div className="brand-logo">EM</div>
          <div>
            <h2>EventMatrix</h2>
            <p>Resource Module</p>
          </div>
        </div>

        <div className="user-box">
          <span className="user-name">{loggedUser.name}</span>
          <span className="user-role">{roleLabel}</span>
        </div>

        <nav className="side-nav">
          <button
            className={activePage === "dashboard" ? "side-link active" : "side-link"}
            onClick={() => setActivePage("dashboard")}
          >
            Dashboard
          </button>

          {isResourceManager && (
            <button
              className={activePage === "add" ? "side-link active" : "side-link"}
              onClick={() => setActivePage("add")}
            >
              Add Resource
            </button>
          )}

          {isResourceManager && (
            <button
              className={activePage === "list" ? "side-link active" : "side-link"}
              onClick={() => setActivePage("list")}
            >
              Resource List
            </button>
          )}

          {isOrganizer && (
            <button
              className={
                activePage === "reserve" ? "side-link active" : "side-link"
              }
              onClick={() => setActivePage("reserve")}
            >
              Reserve Resource
            </button>
          )}

          {isResourceManager && (
            <button
              className={
                activePage === "approval" ? "side-link active" : "side-link"
              }
              onClick={() => setActivePage("approval")}
            >
              Request Approval
            </button>
          )}

          {isOrganizer && (
            <button
              className={activePage === "issue" ? "side-link active" : "side-link"}
              onClick={() => setActivePage("issue")}
            >
              Issue Report
            </button>
          )}

          {isResourceManager && (
            <button
              className={
                activePage === "issueManage" ? "side-link active" : "side-link"
              }
              onClick={() => setActivePage("issueManage")}
            >
              Issue Management
            </button>
          )}

          <button
            className={activePage === "usage" ? "side-link active" : "side-link"}
            onClick={() => setActivePage("usage")}
          >
            Usage Log
          </button>

          <button
            className={
              activePage === "availability" ? "side-link active" : "side-link"
            }
            onClick={() => setActivePage("availability")}
          >
            Availability
          </button>

          <button
            className={
              activePage === "notifications" ? "side-link active" : "side-link"
            }
            onClick={() => setActivePage("notifications")}
          >
            Notifications
          </button>
        </nav>

        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </aside>

      <main className="main-content">
        <header className="top-header">
          <div>
            <h1>Resource Management</h1>
            <p>
              Manage venues, equipment, bookings, issue reports and availability
              for university events.
            </p>
          </div>

          <span className="role-pill">{roleLabel}</span>
        </header>

        {activePage === "dashboard" && (
          <Dashboard user={loggedUser} onNavigate={setActivePage} />
        )}

        {activePage === "add" && isResourceManager && <AddResource />}
        {activePage === "list" && isResourceManager && <ResourceList />}
        {activePage === "reserve" && isOrganizer && <ReserveResource />}
        {activePage === "approval" && isResourceManager && <AdminApproval />}
        {activePage === "issue" && isOrganizer && <ResourceIssueReport />}
        {activePage === "issueManage" && isResourceManager && (
          <ResourceIssueManagement />
        )}
        {activePage === "usage" && <ResourceUsageLog />}
        {activePage === "availability" && <AvailabilityCalendar />}
        {activePage === "notifications" && <NotificationHistory />}
      </main>
    </div>
  );
}

export default App;