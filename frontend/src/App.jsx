import { useState } from "react";
import AddResource from "./pages/AddResource";
import ResourceList from "./pages/ResourceList";
import ReserveResource from "./pages/ReserveResource";
import AdminApproval from "./pages/AdminApproval";
import ResourceIssueReport from "./pages/ResourceIssueReport";
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
        </div>
      </nav>

      {activePage === "add" && <AddResource />}
      {activePage === "list" && <ResourceList />}
      {activePage === "reserve" && <ReserveResource />}
      {activePage === "approval" && <AdminApproval />}
      {activePage === "issue" && <ResourceIssueReport />}
    </div>
  );
}

export default App;