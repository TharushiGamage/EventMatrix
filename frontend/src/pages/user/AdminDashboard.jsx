import { Link } from 'react-router-dom';
import { Users, Calendar, Activity, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { adminService } from '../../services/userApi';
import { fetchEvents } from '../../services/eventService';

const AdminDashboard = () => {
  const [counts, setCounts] = useState({ students: 0, organizers: 0, events: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const fetchCounts = async () => {
    try {
      console.log('Fetching dashboard counts...');
      setLoading(true);
      setError('');
      
      // Fetch students count
      const studentsRes = await adminService.getUsers('', 'Student');
      console.log('Students response:', studentsRes);
      const studentCount = studentsRes.data?.length || 0;
      console.log('Student count:', studentCount);

      // Fetch organizers count
      const organizersRes = await adminService.getUsers('', 'Organizer');
      console.log('Organizers response:', organizersRes);
      const organizerCount = organizersRes.data?.length || 0;
      console.log('Organizer count:', organizerCount);

      // Fetch events count
      const events = await fetchEvents();
      console.log('Events response:', events);
      const eventCount = events?.length || 0;
      console.log('Event count:', eventCount);

      setCounts({ students: studentCount, organizers: organizerCount, events: eventCount });
    } catch (err) {
      console.error('Failed to fetch dashboard counts:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch dashboard counts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchCounts();
  }, []);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(fetchCounts, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await fetchCounts();
  };

  const stats = [
    { 
      title: 'Total Students', 
      count: counts.students, 
      icon: Users, 
      link: '/admin/students',
      color: 'stat-blue'
    },
    {
      title: 'Total Organizers',
      count: counts.organizers,
      icon: Activity,
      link: '/admin/organizers',
      color: 'stat-purple'
    },
    { 
      title: 'Total Events', 
      count: counts.events, 
      icon: Calendar, 
      link: '/admin/events',
      color: 'stat-orange'
    },
  ];

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Welcome! Here's your system overview.</p>
        </div>
        <button 
          onClick={handleManualRefresh} 
          disabled={refreshing}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            background: '#3b82f6',
            color: 'white',
            cursor: refreshing ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            opacity: refreshing ? 0.6 : 1,
            transition: 'all 0.3s ease'
          }}
        >
          <RefreshCw size={16} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Statistics Grid */}
      <div className="stats-container">
        <h2 className="section-title">Overview</h2>
        {error && (
          <div style={{ color: '#dc2626', marginBottom: '12px', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}
        <div className="stats-grid">
          {stats.map((stat, idx) => {
            const IconComponent = stat.icon;
            return (
              <Link to={stat.link} key={idx} className={`stat-card ${stat.color}`}>
                <div className="stat-card-header">
                  <div className="stat-icon-wrapper">
                    <IconComponent size={24} />
                  </div>
                  <div className="stat-title">{stat.title}</div>
                </div>
                <div className="stat-card-body">
                  <div className="stat-number">{stat.count}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
