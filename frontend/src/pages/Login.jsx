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
        <h2>Welcome Back</h2>

        <p className="login-subtitle">
          Please enter your credentials to access your dashboard.
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
              placeholder="Enter your username"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" className="primary-button">
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;