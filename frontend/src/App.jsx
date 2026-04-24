import { useEffect, useState } from "react";
import Login from "./pages/Login";
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
  const [activePage, setActivePage] = useState("list");
  const [loggedUser, setLoggedUser] = useState(null);

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("resourceUser"));

    if (savedUser) {
      setLoggedUser(savedUser);
      setActivePage(savedUser.role === "Admin" ? "list" : "reserve");
    }
  }, []);

  const handleLogin = (user) => {
    setLoggedUser(user);
    setActivePage(user.role === "Admin" ? "list" : "reserve");
  };

  const handleLogout = () => {
    localStorage.removeItem("resourceUser");
    setLoggedUser(null);
    setActivePage("list");
  };

  if (!loggedUser) {
    return <Login onLogin={handleLogin} />;
  }

  const isAdmin = loggedUser.role === "Admin";
  const isOrganizer = loggedUser.role === "Organizer";

  return (
    <div>
      <nav className="navbar">
        <div>
          <h2>EventMatrix Resource Management</h2>
          <p className="nav-user">
            Logged in as {loggedUser.name} ({loggedUser.role})
          </p>
        </div>

        <div className="nav-buttons">
          {isAdmin && (
            <button
              className={activePage === "add" ? "nav-btn active" : "nav-btn"}
              onClick={() => setActivePage("add")}
            >
              Add Resource
            </button>
          )}

          {isAdmin && (
            <button
              className={activePage === "list" ? "nav-btn active" : "nav-btn"}
              onClick={() => setActivePage("list")}
            >
              Resource List
            </button>
          )}

          {isOrganizer && (
            <button
              className={activePage === "reserve" ? "nav-btn active" : "nav-btn"}
              onClick={() => setActivePage("reserve")}
            >
              Reserve Resource
            </button>
          )}

          {isAdmin && (
            <button
              className={
                activePage === "approval" ? "nav-btn active" : "nav-btn"
              }
              onClick={() => setActivePage("approval")}
            >
              Admin Approval
            </button>
          )}

          {isOrganizer && (
            <button
              className={activePage === "issue" ? "nav-btn active" : "nav-btn"}
              onClick={() => setActivePage("issue")}
            >
              Issue Report
            </button>
          )}

          {isAdmin && (
            <button
              className={
                activePage === "issueManage" ? "nav-btn active" : "nav-btn"
              }
              onClick={() => setActivePage("issueManage")}
            >
              Issue Management
            </button>
          )}

          <button
            className={activePage === "usage" ? "nav-btn active" : "nav-btn"}
            onClick={() => setActivePage("usage")}
          >
            Usage Log
          </button>

          <button
            className={activePage === "calendar" ? "nav-btn active" : "nav-btn"}
            onClick={() => setActivePage("calendar")}
          >
            Availability
          </button>

          <button
            className={
              activePage === "notifications" ? "nav-btn active" : "nav-btn"
            }
            onClick={() => setActivePage("notifications")}
          >
            Notifications
          </button>

          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      {activePage === "add" && isAdmin && <AddResource />}
      {activePage === "list" && isAdmin && <ResourceList />}
      {activePage === "reserve" && isOrganizer && <ReserveResource />}
      {activePage === "approval" && isAdmin && <AdminApproval />}
      {activePage === "issue" && isOrganizer && <ResourceIssueReport />}
      {activePage === "issueManage" && isAdmin && <ResourceIssueManagement />}
      {activePage === "usage" && <ResourceUsageLog />}
      {activePage === "calendar" && <AvailabilityCalendar />}
      {activePage === "notifications" && <NotificationHistory />}
    </div>
  );
}

export default App;