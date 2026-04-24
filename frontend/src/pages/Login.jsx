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
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      setMessage("Name is required");
      return;
    }

    if (!formData.role) {
      setMessage("Role is required");
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
        <h1>EventMatrix Login</h1>
        <p className="subtitle">
          Select your role to access the Resource Management Module.
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
              <option value="Admin">Admin</option>
              <option value="Organizer">Organizer</option>
            </select>
          </div>

          <button type="submit" className="primary-button">
            Login
          </button>
        </form>

        <div className="login-help">
          <p>
            <strong>Admin:</strong> Add/manage resources, approve requests, and
            resolve issues.
          </p>
          <p>
            <strong>Organizer:</strong> Reserve resources and report issues.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;