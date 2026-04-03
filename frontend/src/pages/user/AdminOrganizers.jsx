import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/userApi';
import { Search, Calendar, ChevronUp, ChevronDown, Activity, ExternalLink } from 'lucide-react';
import './admin.css';

const AdminOrganizers = () => {
  const [organizers, setOrganizers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [orgEvents, setOrgEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  const fetchOrganizers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getUsers(search, 'Organizer');
      setOrganizers(res.data || []);
    } catch (err) {
      console.error(err?.response?.data || err.message);
      setOrganizers([]);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    const t = setTimeout(fetchOrganizers, 300);
    return () => clearTimeout(t);
  }, [search]);

  const toggleExpand = async (userId) => {
    if (expanded === userId) {
      setExpanded(null);
      return;
    }
    setExpanded(userId);
    setLoadingEvents(true);
    setOrgEvents([]);
    try {
      const res = await adminService.getOrganizerEvents(userId);
      setOrgEvents(res.data || []);
    } catch (err) {
      console.error('Failed to load organizer events', err?.message || err);
    } finally {
      setLoadingEvents(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Organizers</h1>
        <p>All organizers and the events they have published.</p>
      </div>

      <div className="admin-controls-row">
        <div className="admin-tabs" style={{gap:'0.5rem'}}>
          <div className="adm-tab active">Organizers</div>
        </div>

        <div className="admin-search-bar">
          <Search size={18} className="admin-search-icon" />
          <input type="text" placeholder="Search organizers..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="admin-table-wrap">
        {loading ? (
          <div className="admin-empty">Loading organizers...</div>
        ) : organizers.length === 0 ? (
          <div className="admin-empty">No organizers found.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Organizer</th>
                <th>Contact</th>
                <th>Organization</th>
                <th>Events</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {organizers.map(o => (
                <React.Fragment key={o._id}>
                  <tr className={expanded === o._id ? 'row-expanded' : ''}>
                    <td>
                      <div className="admin-user-cell">
                        <div className="admin-avatar">
                          {o.profileImage && o.profileImage !== 'default.png' ? <img src={`http://localhost:5000${o.profileImage}`} alt="" /> : o.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="admin-user-name">{o.organizationName || o.name}</div>
                          <div className="admin-user-email">{o.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{fontSize:'0.9rem', color:'#475569'}}>
                      <div>{o.phone || 'No phone'}</div>
                      {o.website && <a href={o.website} target="_blank" rel="noreferrer" className="adm-org-link">{o.website} <ExternalLink size={12}/></a>}
                    </td>
                    <td>{o.organizationName || '-'}</td>
                    <td>{/* placeholder for quick count - expansion shows full list */}</td>
                    <td>
                      <button className="admin-action-btn btn-expand" onClick={() => toggleExpand(o._id)} title="View events">
                        {expanded === o._id ? <ChevronUp size={16} /> : <Calendar size={16} />}
                      </button>
                    </td>
                  </tr>

                  {expanded === o._id && (
                    <tr className="admin-subrow">
                      <td colSpan="5">
                        <div className="admin-events-panel fade-in">
                          <div className="aep-header">
                            <h4><Activity size={16}/> Events published by {o.organizationName || o.name}</h4>
                          </div>
                          <div className="aep-content">
                            {loadingEvents ? (
                              <div className="aep-loader">Loading events...</div>
                            ) : orgEvents.length === 0 ? (
                              <div className="aep-empty">This organizer has not published any events yet.</div>
                            ) : (
                              <div className="aep-grid">
                                {orgEvents.map(ev => (
                                  <div key={ev.id || ev._id} className="aep-card">
                                    <div className="aep-card-top">
                                      <span className="aep-date">{new Date(ev.date).toLocaleDateString()}</span>
                                      <span className={`aep-type ${ev.isPaid ? 'paid' : 'free'}`}>{ev.isPaid ? 'Paid' : 'Free'}</span>
                                    </div>
                                    <h5>{ev.name}</h5>
                                    <p className="aep-venue">{ev.venue}</p>
                                    <div className="aep-metrics">
                                      <span>{ev.maxParticipants} max capacity</span>
                                      {ev.isPaid && ev.ticketPrice && <span>${ev.ticketPrice}</span>}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminOrganizers;
