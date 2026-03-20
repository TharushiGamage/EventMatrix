import React, { useEffect, useState } from 'react';
import { fetchEvents } from '../../services/eventService';
import { adminService } from '../../services/userApi';
import { Calendar, Activity, ExternalLink } from 'lucide-react';
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
              </tr>
            </thead>
            <tbody>
              {filtered.map(ev => (
                <tr key={ev.id || ev._id}>
                  <td>
                    <div style={{display:'flex',flexDirection:'column'}}>
                      <strong>{ev.name}</strong>
                      <small style={{color:'#64748b'}}>{ev.description?.slice(0,80)}{ev.description?.length>80?'...':''}</small>
                    </div>
                  </td>
                  <td>{ev.date} {ev.startTime} - {ev.endTime}</td>
                  <td>{ev.venue}</td>
                  <td>{ev.organizedBy}</td>
                  <td>{participantsMap[ev.id] || 0}</td>
                  <td><span className={`aep-type ${ev.isPaid? 'paid':'free'}`}>{ev.isPaid? 'Paid':'Free'}</span></td>
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
