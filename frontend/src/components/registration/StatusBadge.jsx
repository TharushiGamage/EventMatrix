// StatusBadge.jsx — reusable coloured pill for registration statuses
export default function StatusBadge({ status }) {
  const map = {
    confirmed:  { label: 'Confirmed',  cls: 'status-confirmed'  },
    pending:    { label: 'Pending',    cls: 'status-pending'    },
    approved:   { label: 'Approved',   cls: 'status-approved'   },
    rejected:   { label: 'Rejected',   cls: 'status-rejected'   },
    cancelled:  { label: 'Cancelled',  cls: 'status-cancelled'  },
  };
  const { label, cls } = map[status] ?? { label: status, cls: '' };
  return <span className={`reg-status-badge ${cls}`}>{label}</span>;
}
