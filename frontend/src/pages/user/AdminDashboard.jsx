import { Link } from 'react-router-dom';
import { Users, Calendar, Activity } from 'lucide-react';

const AdminDashboard = () => {
  const stats = [
    { 
      title: 'Total Students', 
      count: 24, 
      icon: Users, 
      link: '/admin/users',
      color: 'stat-blue'
    },
    { 
      title: 'Total Organizers', 
      count: 8, 
      icon: Activity, 
      link: '/admin/users',
      color: 'stat-purple'
    },
    { 
      title: 'Total Events', 
      count: 12, 
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
          <p>Welcome back! Here's your system overview.</p>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="stats-container">
        <h2 className="section-title">Overview</h2>
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
    </div>
  );
};

export default AdminDashboard;
