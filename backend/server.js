const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Ticket = require('./models/Ticket');

const app = express();
app.use(cors());
app.use(express.json());

const slaHours = { urgent: 1, high: 4, medium: 24, low: 72 };

const computeDerivedFields = (ticket) => {
  const doc = ticket.toObject ? ticket.toObject() : ticket;
  const slaMs = slaHours[doc.priority] * 60 * 60 * 1000;
  const now = new Date();
  
  const ageMs = doc.resolvedAt 
    ? new Date(doc.resolvedAt) - new Date(doc.createdAt)
    : now - new Date(doc.createdAt);
  
  doc.ageMinutes = Math.floor(ageMs / 60000);
  
  doc.slaBreached = doc.resolvedAt 
    ? (new Date(doc.resolvedAt) - new Date(doc.createdAt) > slaMs)
    : (now - new Date(doc.createdAt) > slaMs);
    
  return doc;
};

app.get('/tickets/stats', async (req, res) => {
  try {
    const tickets = await Ticket.find({});
    const stats = {
      status: { open: 0, in_progress: 0, resolved: 0, closed: 0 },
      priority: { low: 0, medium: 0, high: 0, urgent: 0 },
      breachedOpen: 0
    };
    
    tickets.forEach(t => {
      stats.status[t.status] = (stats.status[t.status] || 0) + 1;
      stats.priority[t.priority] = (stats.priority[t.priority] || 0) + 1;
      
      const computed = computeDerivedFields(t);
      if (computed.slaBreached && t.status !== 'resolved' && t.status !== 'closed') {
        stats.breachedOpen++;
      }
    });
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/tickets', async (req, res) => {
  try {
    const { status, priority, breached } = req.query;
    let query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    
    const tickets = await Ticket.find(query).sort({ createdAt: -1 });
    let result = tickets.map(computeDerivedFields);
    
    if (breached === 'true') {
      result = result.filter(t => t.slaBreached);
    }
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/tickets', async (req, res) => {
  try {
    const ticket = new Ticket(req.body);
    await ticket.save();
    res.status(201).json(computeDerivedFields(ticket));
  } catch (error) {
    res.status(400).json({ error: Object.values(error.errors || {}).map(e => e.message).join(', ') || error.message });
  }
});

const statusOrder = ['open', 'in_progress', 'resolved', 'closed'];

app.patch('/tickets/:id', async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Status is required' });
    
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    
    const oldStatus = ticket.status;
    const currentIndex = statusOrder.indexOf(oldStatus);
    const newIndex = statusOrder.indexOf(status);
    
    if (newIndex === -1) return res.status(400).json({ error: 'Invalid status' });
    
    if (newIndex - currentIndex > 1) {
      return res.status(400).json({ error: 'Cannot skip forward in status' });
    }
    if (currentIndex - newIndex > 1) {
      return res.status(400).json({ error: 'Cannot move backward more than one step' });
    }
    
    ticket.status = status;
    
    if (status === 'resolved' && oldStatus !== 'resolved') {
      ticket.resolvedAt = new Date();
    }
    
    if (oldStatus === 'resolved' && status !== 'closed' && status !== 'resolved') {
      ticket.resolvedAt = null;
    }
    
    await ticket.save();
    res.json(computeDerivedFields(ticket));
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/tickets/:id', async (req, res) => {
  try {
    const ticket = await Ticket.findByIdAndDelete(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

mongoose.connect('mongodb+srv://user1:Mongodb123!@cluster0.afmomq9.mongodb.net/deskflow')
  .then(() => {
    app.listen(3000, () => console.log('Backend running on port 3000'));
  })
  .catch(console.error);
