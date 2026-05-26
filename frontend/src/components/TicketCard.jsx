import { updateStatus, deleteTicket } from '../api';

const STATUS_ORDER = ['open', 'in_progress', 'resolved', 'closed'];

export default function TicketCard({ ticket, onUpdate }) {
  const currentIndex = STATUS_ORDER.indexOf(ticket.status);
  
  const canMoveBackward = currentIndex > 0;
  const canMoveForward = currentIndex < STATUS_ORDER.length - 1;

  const handleStatusChange = async (newStatus) => {
    try {
      await updateStatus(ticket._id, newStatus);
      onUpdate();
    } catch (e) {
      alert(e.response?.data?.error || e.message);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTicket(ticket._id);
      onUpdate();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className={`ticket-card ${ticket.slaBreached ? 'breached' : ''}`}>
      <h4>{ticket.subject}</h4>
      <div className="ticket-meta">
        <span className={`priority ${ticket.priority}`}>{ticket.priority}</span>
        <span>{ticket.ageMinutes} min old</span>
      </div>
      {ticket.slaBreached && <div className="breach-indicator">⚠️ SLA Breached</div>}
      
      <div className="ticket-actions">
        {canMoveBackward && (
          <button onClick={() => handleStatusChange(STATUS_ORDER[currentIndex - 1])}>&larr; Back</button>
        )}
        {canMoveForward && (
          <button onClick={() => handleStatusChange(STATUS_ORDER[currentIndex + 1])}>Next &rarr;</button>
        )}
        <button className="delete-btn" onClick={handleDelete}>🗑</button>
      </div>
    </div>
  );
}
