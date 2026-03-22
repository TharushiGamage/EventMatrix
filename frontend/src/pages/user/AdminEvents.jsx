import React, { useEffect, useState } from 'react';
import { fetchEvents } from '../../services/eventService';
import { adminService } from '../../services/userApi';
import { Calendar, Activity, ExternalLink, Eye, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './admin.css';

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState('All');
  const [participantsMap, setParticipantsMap] = useState({});

  const showToast = (msg) => {
    // simple alert-style fallback — keep minimal
    // callers can replace with shared toast later
    alert(msg);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const ev = await fetchEvents({ search });
      // ev should be array of event objects
      setEvents(ev || []);

      // fetch registrations and build participants count per event id
      const regRes = await adminService.getStudentRegistrations();
      const regs = regRes.data || [];
      const map = {};
      regs.forEach(item => {
        (item.events || []).forEach(e => {
          if (!e) return;
          const id = e.id || e._id || e.id;
          map[id] = (map[id] || 0) + 1;
        });
      });
      setParticipantsMap(map);
    } catch (err) {
      showToast('Failed loading events data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [search]);

  const navigate = useNavigate();

  const formatDate = (d) => {
    if (!d) return '-';
    const dt = new Date(d);
    return dt.toLocaleDateString() + ' • ' + dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const filtered = events.filter(ev => {
    if (filterTab === 'All') return true;
    const today = new Date().toISOString().split('T')[0];
    if (filterTab === 'Upcoming') return ev.date >= today;
    if (filterTab === 'Past') return ev.date < today;
    return true;
  });

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Event Management</h1>
        <p>View and manage all events, participants, and organizers.</p>
      </div>

      <div className="admin-controls-row">
        <div className="admin-tabs">
          {['All','Upcoming','Past'].map(tab => (
            <button key={tab} className={`adm-tab ${filterTab===tab? 'active':''}`} onClick={() => setFilterTab(tab)}>
              {tab}
              <span className="adm-tab-count">{events.filter(ev => {
                if (tab==='All') return true;
                const today = new Date().toISOString().split('T')[0];
                return tab==='Upcoming' ? ev.date >= today : ev.date < today;
              }).length}</span>
            </button>
          ))}
        </div>

        <div className="admin-search-bar">
          <input type="text" placeholder="Search events..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="admin-table-wrap">
        {loading ? (
          <div className="admin-empty">Loading events...</div>
        ) : filtered.length === 0 ? (
          <div className="admin-empty">No events found.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Date / Time</th>
                <th>Venue</th>
                <th>Organizer</th>
                <th>Participants</th>
                <th>Type</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(ev => (
                <tr key={ev.id || ev._id} className="admin-event-row">
                  <td className="ev-col ev-col-main">
                    <div className="ev-main">
                      {ev.thumbnail ? (
                        <div className="ev-thumb"><img src={ev.thumbnail} alt="thumb"/></div>
                      ) : (
                        <div className="ev-thumb ev-thumb-fallback">{(ev.name||'E').charAt(0)}</div>
                      )}
                      <div className="ev-info">
                        <div className="event-title">{ev.name}</div>
                        <div className="event-desc">{ev.description?.slice(0,100)}{ev.description?.length>100?'...':''}</div>
                      </div>
                    </div>
                  </td>
                  <td className="ev-col ev-col-date">{formatDate(ev.date)}{ev.startTime? ` — ${ev.startTime}` : ''}</td>
                  <td className="ev-col ev-col-venue">{ev.venue || '-'}</td>
                  <td className="ev-col ev-col-org">{ev.organizedBy || '-'}</td>
                  <td className="ev-col ev-col-participants"><span className="participants-badge">{participantsMap[ev.id] || 0}</span></td>
                  <td className="ev-col ev-col-type"><span className={`aep-type ${ev.isPaid ? 'paid' : 'free'}`}>{ev.isPaid ? 'Paid' : 'Free'}</span></td>
                  <td className="ev-col ev-col-actions">
                    <div className="admin-actions">
                      <button className="admin-action-btn" title="View" onClick={() => navigate(`/admin/events/${ev.id || ev._id}`)}><Eye size={16} /></button>
                      <button className="admin-action-btn" title="Edit" onClick={() => navigate(`/edit/${ev.id || ev._id}`)}><Edit size={16} /></button>
                      <button className="admin-action-btn btn-sus" title="Delete" onClick={() => { if(window.confirm('Delete this event?')) showToast('Delete not implemented'); }}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AdminEvents;
