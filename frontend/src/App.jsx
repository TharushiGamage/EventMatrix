import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedRoute from './components/RoleBasedRoute';
import UserNavbar from './components/UserNavbar';

// EventMatrix existing pages
import Dashboard from './pages/event/Dashboard';
import EventForm from './pages/event/Components/EventForm';
import Feed from './pages/feed/Feed';
import FeedDetail from './pages/feed/FeedDetail';

// User Management pages
import Login from './pages/user/Login';
import Register from './pages/user/Register';
import UserDashboard from './pages/user/UserDashboard';
import Profile from './pages/user/Profile';
import AdminUsers from './pages/user/AdminUsers';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <UserNavbar />
        <Routes>
          {/* EventMatrix original routes */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/create" element={<EventForm />} />
          <Route path="/edit/:id" element={<EventForm />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/feed/:id" element={<FeedDetail />} />

          {/* User Management public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* User Management protected routes (logged-in users) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/user-dashboard" element={<UserDashboard />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Admin-only routes */}
          <Route element={<RoleBasedRoute allowedRoles={['Admin']} />}>
            <Route path="/admin/users" element={<AdminUsers />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
