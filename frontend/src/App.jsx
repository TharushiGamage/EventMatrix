import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { EventRefreshProvider } from './context/EventRefreshContext';
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
import ProfileLayout from './pages/user/ProfileLayout';
import ProfileOverview from './pages/user/ProfileOverview';
import ProfileGeneral from './pages/user/ProfileGeneral';
import ProfileSecurity from './pages/user/ProfileSecurity';
import OrganizerEvents from './pages/user/OrganizerEvents';
import AdminUsers from './pages/user/AdminUsers';
import AdminOrganizers from './pages/user/AdminOrganizers';
import AdminSettings from './pages/user/AdminSettings';
import AdminLayout from './pages/user/AdminLayout';
import AdminDashboard from './pages/user/AdminDashboard';
import AdminStudents from './pages/user/AdminStudents';
import AdminEvents from './pages/user/AdminEvents';

// Registration & Payment pages (Dushan's feature)
import EventRegisterPage from './pages/registration/EventRegisterPage';
import PaymentPage from './pages/registration/PaymentPage';
import MyRegistrationsPage from './pages/registration/MyRegistrationsPage';
import PendingReviewPage from './pages/registration/PendingReviewPage';

import './App.css';

// Conditionally render UserNavbar — hide on profile & admin layout pages
const ConditionalNavbar = () => {
  const { pathname } = useLocation();
  const hideNavbar = pathname.startsWith('/profile') || pathname.startsWith('/admin');
  return hideNavbar ? null : <UserNavbar />;
};

function App() {
  return (
    <AuthProvider>
      <EventRefreshProvider>
        <BrowserRouter>
          <ConditionalNavbar />
          <Routes>
          {/* EventMatrix original routes */}
          <Route path="/" element={<Navigate to="/feed" replace />} />
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

          {/* Profile — sidebar + topbar layout (mirroring admin dashboard) */}
          <Route element={<ProtectedRoute />}>
            <Route element={<ProfileLayout />}>
              <Route path="/profile" element={<ProfileOverview />} />
              <Route path="/profile/general" element={<ProfileGeneral />} />
              <Route path="/profile/security" element={<ProfileSecurity />} />
            </Route>
          </Route>

          {/* Organizer Events — view, edit, delete events */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile/events" element={<OrganizerEvents />} />
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
              <Route path="/admin/organizers" element={<AdminOrganizers />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="/admin/events" element={<AdminEvents />} />
              <Route path="/admin/students" element={<AdminStudents />} />
            </Route>
          </Route>
        </Routes>
        <Footer />
      </BrowserRouter>
      </EventRefreshProvider>
    </AuthProvider>
  );
}

export default App;
