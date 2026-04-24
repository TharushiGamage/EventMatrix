import AddResource from "./pages/AddResource";
import "./index.css";

function App() {
  return (
    <div>
      <nav className="navbar">
        <h2>EventMatrix Resource Management</h2>
        <span>Admin Panel</span>
      </nav>

      <AddResource />
    </div>
  );
}

export default App;