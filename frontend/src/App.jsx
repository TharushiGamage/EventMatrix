import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedRoute from './components/RoleBasedRoute';
import UserNavbar from './components/UserNavbar';
import Header from './components/Header';
import Footer from './components/Footer';

// EventMatrix existing pages
import Dashboard from './pages/event/Dashboard';
import EventForm from './pages/event/Components/EventForm';
import Feed from './pages/feed/Feed';
import FeedDetail from './pages/feed/FeedDetail';

// User Management pages
import Login from './pages/user/Login';
import Register from './pages/user/Register';
import Profile from './pages/user/Profile';
import AdminUsers from './pages/user/AdminUsers';
import AdminLayout from './pages/user/AdminLayout';
import AdminDashboard from './pages/user/AdminDashboard';
import AdminStudents from './pages/user/AdminStudents';

// Registration & Payment pages (Dushan's feature)
import EventRegisterPage from './pages/registration/EventRegisterPage';
import PaymentPage from './pages/registration/PaymentPage';
import MyRegistrationsPage from './pages/registration/MyRegistrationsPage';
import PendingReviewPage from './pages/registration/PendingReviewPage';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <UserNavbar />
        <Routes>
          {/* EventMatrix original routes */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/feed/:id" element={<FeedDetail />} />

          {/* Event create/edit — Organizer and Admin only */}
          <Route element={<RoleBasedRoute allowedRoles={['Organizer', 'Admin']} redirectTo="/" />}>
            <Route path="/create" element={<EventForm />} />
            <Route path="/edit/:id" element={<EventForm />} />
          </Route>

          {/* User Management public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* User Management protected routes (logged-in users) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Registration & Payment — Student only */}
          <Route element={<RoleBasedRoute allowedRoles={['Student']} redirectTo="/login" />}>
            <Route path="/register-event/:eventId" element={<EventRegisterPage />} />
            <Route path="/pay/:registrationId" element={<PaymentPage />} />
            <Route path="/my-registrations" element={<MyRegistrationsPage />} />
          </Route>

          {/* Pending Review — Organizer only */}
          <Route element={<RoleBasedRoute allowedRoles={['Organizer']} redirectTo="/" />}>
            <Route path="/organizer/pending" element={<PendingReviewPage />} />
          </Route>

          {/* Admin-only routes */}
          <Route element={<RoleBasedRoute allowedRoles={['Admin']} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/students" element={<AdminStudents />} />
            </Route>
          </Route>
        </Routes>
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
