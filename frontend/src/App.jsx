import { useState } from "react";
import AddResource from "./pages/AddResource";
import ResourceList from "./pages/ResourceList";
import ReserveResource from "./pages/ReserveResource";
import AdminApproval from "./pages/AdminApproval";
import ResourceIssueReport from "./pages/ResourceIssueReport";
import ResourceIssueManagement from "./pages/ResourceIssueManagement";
import ResourceUsageLog from "./pages/ResourceUsageLog";
import AvailabilityCalendar from "./pages/AvailabilityCalendar";
import "./index.css";

function App() {
  const [activePage, setActivePage] = useState("add");

  return (
    <div>
      <nav className="navbar">
        <h2>EventMatrix Resource Management</h2>

        <div className="nav-buttons">
          <button
            className={activePage === "add" ? "nav-btn active" : "nav-btn"}
            onClick={() => setActivePage("add")}
          >
            Add Resource
          </button>

          <button
            className={activePage === "list" ? "nav-btn active" : "nav-btn"}
            onClick={() => setActivePage("list")}
          >
            Resource List
          </button>

          <button
            className={activePage === "reserve" ? "nav-btn active" : "nav-btn"}
            onClick={() => setActivePage("reserve")}
          >
            Reserve Resource
          </button>

          <button
            className={activePage === "approval" ? "nav-btn active" : "nav-btn"}
            onClick={() => setActivePage("approval")}
          >
            Admin Approval
          </button>

          <button
            className={activePage === "issue" ? "nav-btn active" : "nav-btn"}
            onClick={() => setActivePage("issue")}
          >
            Issue Report
          </button>

          <button
            className={
              activePage === "issueManage" ? "nav-btn active" : "nav-btn"
            }
            onClick={() => setActivePage("issueManage")}
          >
            Issue Management
          </button>

          <button
            className={activePage === "usage" ? "nav-btn active" : "nav-btn"}
            onClick={() => setActivePage("usage")}
          >
            Usage Log
          </button>

          <button
            className={
              activePage === "calendar" ? "nav-btn active" : "nav-btn"
            }
            onClick={() => setActivePage("calendar")}
          >
            Availability
          </button>
        </div>
      </nav>

      {activePage === "add" && <AddResource />}
      {activePage === "list" && <ResourceList />}
      {activePage === "reserve" && <ReserveResource />}
      {activePage === "approval" && <AdminApproval />}
      {activePage === "issue" && <ResourceIssueReport />}
      {activePage === "issueManage" && <ResourceIssueManagement />}
      {activePage === "usage" && <ResourceUsageLog />}
      {activePage === "calendar" && <AvailabilityCalendar />}
    </div>
  );
}

export default App;