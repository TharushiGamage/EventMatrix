import { useState } from "react";

function Login({ onLogin }) {
  const [formData, setFormData] = useState({
    name: "",
    role: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    setMessage("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      setMessage("User name is required");
      return;
    }

    if (!formData.role) {
      setMessage("User role is required");
      return;
    }

    const user = {
      name: formData.name.trim(),
      role: formData.role,
    };

    localStorage.setItem("resourceUser", JSON.stringify(user));
    onLogin(user);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">EM</div>

        <h1>EventMatrix</h1>
        <h2>Resource Management Login</h2>

        <p className="login-subtitle">
          Login as Resource Manager or Organizer to access the correct resource
          management features.
        </p>

        {message && <div className="error-box">{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>User Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Example: Thilini Abeykoon"
            />
          </div>

          <div className="form-group">
            <label>User Role</label>
            <select name="role" value={formData.role} onChange={handleChange}>
              <option value="">Select role</option>
              <option value="ResourceManager">Resource Manager</option>
              <option value="Organizer">Organizer</option>
            </select>
          </div>

          <button type="submit" className="primary-button">
            Login
          </button>
        </form>

        <div className="login-role-box">
          <div>
            <strong>Resource Manager</strong>
            <p>
              Add, edit, delete resources, approve requests, and resolve issues.
            </p>
          </div>

          <div>
            <strong>Organizer</strong>
            <p>Reserve resources, report issues, and view availability.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;