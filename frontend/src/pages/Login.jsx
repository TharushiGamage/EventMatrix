import { useState } from "react";

const USERS = [
  {
    username: "Resource Manager",
    password: "resource123",
    role: "ResourceManager",
    displayRole: "Resource Manager",
  },
  {
    username: "Organizer",
    password: "organizer123",
    role: "Organizer",
    displayRole: "Organizer",
  },
];

function Login({ onLogin }) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
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

    if (!formData.username.trim()) {
      setMessage("Username is required");
      return;
    }

    if (!formData.password.trim()) {
      setMessage("Password is required");
      return;
    }

    const matchedUser = USERS.find(
      (user) =>
        user.username === formData.username.trim() &&
        user.password === formData.password.trim()
    );

    if (!matchedUser) {
      setMessage("Invalid username or password");
      return;
    }

    const loggedUser = {
      name: matchedUser.username,
      role: matchedUser.role,
      displayRole: matchedUser.displayRole,
    };

    localStorage.setItem("resourceUser", JSON.stringify(loggedUser));
    onLogin(loggedUser);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">EM</div>

        <h1>EventMatrix</h1>
        <h2>Resource Management Login</h2>

        <p className="login-subtitle">
          Login using your username and password to access the correct resource
          management features.
        </p>

        {message && <div className="error-box">{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Example: Resource Manager"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
            />
          </div>

          <button type="submit" className="primary-button">
            Login
          </button>
        </form>

        <div className="login-role-box">
          <div>
            <strong>Resource Manager</strong>
            <p>
              Username: Resource Manager
              <br />
              Password: resource123
            </p>
          </div>

          <div>
            <strong>Organizer</strong>
            <p>
              Username: Organizer
              <br />
              Password: organizer123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;