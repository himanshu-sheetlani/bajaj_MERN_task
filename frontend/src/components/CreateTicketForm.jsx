import { useState } from 'react';
import { createTicket } from '../api';

export default function CreateTicketForm({ onCreated }) {
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    customerEmail: '',
    priority: 'low'
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createTicket(formData);
      setFormData({ subject: '', description: '', customerEmail: '', priority: 'low' });
      onCreated();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  return (
    <form className="create-ticket-form" onSubmit={handleSubmit}>
      <h3>New Ticket</h3>
      {error && <div className="error">{error}</div>}
      <input 
        placeholder="Subject" required
        value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} 
      />
      <input 
        type="email" placeholder="Customer Email" required
        value={formData.customerEmail} onChange={e => setFormData({...formData, customerEmail: e.target.value})} 
      />
      <select 
        value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}
      >
        <option value="low">Low (72 hour)</option>
        <option value="medium">Medium (24 hour)</option>
        <option value="high">High (8 hour)</option>
        <option value="urgent">Urgent (1 hour)</option>
      </select>
      <textarea 
        placeholder="Description" required
        value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} 
      />
      <button type="submit">Create Ticket</button>
    </form>
  );
}
