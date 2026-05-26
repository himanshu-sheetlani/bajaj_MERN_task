import { useState, useEffect, useCallback } from 'react';
import Board from './components/Board';
import CreateTicketForm from './components/CreateTicketForm';
import { getTickets, getStats } from './api';

function App() {
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState(null);
  const [priorityFilter, setPriorityFilter] = useState('');
  const [breachedFilter, setBreachedFilter] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const params = {};
      if (priorityFilter) params.priority = priorityFilter;
      if (breachedFilter) params.breached = true;
      
      const t = await getTickets(params);
      setTickets(t);
      
      const s = await getStats();
      setStats(s);
    } catch (e) {
      console.error(e);
    }
  }, [priorityFilter, breachedFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="app-container">
      <header>
        <h1>DeskFlow Support</h1>
        {stats && (
          <div className="stats-strip">
            <span>Open: {stats.status.open}</span>
            <span>In Progress: {stats.status.in_progress}</span>
            <span>Resolved: {stats.status.resolved}</span>
            <span>Closed: {stats.status.closed}</span>
            <span className="breached-stat">Breached Open: {stats.breachedOpen}</span>
          </div>
        )}
      </header>

      <div className="main-content">
        <div className="sidebar">
          <CreateTicketForm onCreated={loadData} />
          
          <div className="filters">
            <h3>Filters</h3>
            <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
            <label>
              <input type="checkbox" checked={breachedFilter} onChange={e => setBreachedFilter(e.target.checked)} />
              Show Breached Only
            </label>
          </div>
        </div>

        <Board tickets={tickets} onUpdate={loadData} />
      </div>
    </div>
  );
}

export default App;
