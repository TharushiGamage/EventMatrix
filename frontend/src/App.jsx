import { useState } from "react";
import AddResource from "./pages/AddResource";
import ResourceList from "./pages/ResourceList";
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
        </div>
      </nav>

      {activePage === "add" && <AddResource />}
      {activePage === "list" && <ResourceList />}
    </div>
  );
}

export default App;