import React, { useEffect, useState } from 'react';
import { fetchEvents } from '../../services/eventService';
import { adminService } from '../../services/userApi';
import { Calendar, Activity, ExternalLink, Eye, Edit, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './admin.css';

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState('All');
  const [participantsMap, setParticipantsMap] = useState({});
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [requestType, setRequestType] = useState(null); // 'edit' or 'delete'
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const showToast = (msg) => {
    alert(msg);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const ev = await fetchEvents({ search });
      setEvents(ev || []);

      try {
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
      } catch (regErr) {
        console.warn('Failed to load participant counts:', regErr.message);
      }
    } catch (err) {
      console.error('Failed to load events:', err.message);
      setEvents([]);
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

  const openRequestModal = (event, type) => {
    setSelectedEvent(event);
    setRequestType(type);
    setReason('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedEvent(null);
    setRequestType(null);
    setReason('');
  };

  const handleSubmitRequest = async () => {
    if (!selectedEvent || !requestType) return;

    setIsSubmitting(true);
    try {
      if (requestType === 'edit') {
        await adminService.requestEventEdit(selectedEvent.id || selectedEvent._id, reason);
        showToast('Edit request sent to organizer successfully!');
      } else if (requestType === 'delete') {
        await adminService.requestEventDelete(selectedEvent.id || selectedEvent._id, reason);
        showToast('Delete request sent to organizer successfully!');
      }
      closeModal();
    } catch (error) {
      console.error('Request failed:', error);
      showToast('Failed to send request: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

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
                      <button className="admin-action-btn" title="Request Edit" onClick={() => openRequestModal(ev, 'edit')}><Edit size={16} /></button>
                      <button className="admin-action-btn btn-sus" title="Request Delete" onClick={() => openRequestModal(ev, 'delete')}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Request Modal */}
      {showModal && selectedEvent && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{requestType === 'edit' ? 'Request Event Edit' : 'Request Event Delete'}</h2>
              <button className="modal-close" onClick={closeModal}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <p className="modal-event-name">Event: <strong>{selectedEvent.name}</strong></p>
              <p className="modal-event-organizer">Organizer: <strong>{selectedEvent.organizedBy}</strong></p>
              <p className="modal-info-text">
                {requestType === 'edit' 
                  ? 'Provide a reason why this event needs to be edited'
                  : 'Provide a reason why this event needs to be deleted'}
              </p>
              <textarea
                className="modal-textarea"
                placeholder="Enter your reason (optional)..."
                value={reason}
                onChange={e => setReason(e.target.value)}
                rows="4"
              />
            </div>
            <div className="modal-footer">
              <button className="modal-btn-cancel" onClick={closeModal} disabled={isSubmitting}>Cancel</button>
              <button className="modal-btn-submit" onClick={handleSubmitRequest} disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEvents;
