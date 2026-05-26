import TicketCard from './TicketCard';

const COLUMNS = [
  { id: 'open', title: 'Open' },
  { id: 'in_progress', title: 'In Progress' },
  { id: 'resolved', title: 'Resolved' },
  { id: 'closed', title: 'Closed' }
];

export default function Board({ tickets, onUpdate }) {
  return (
    <div className="board">
      {COLUMNS.map(col => {
        const colTickets = tickets.filter(t => t.status === col.id);
        return (
          <div key={col.id} className="board-column">
            <h2>{col.title} ({colTickets.length})</h2>
            <div className="ticket-list">
              {colTickets.map(ticket => (
                <TicketCard key={ticket._id} ticket={ticket} onUpdate={onUpdate} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
