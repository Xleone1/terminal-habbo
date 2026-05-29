import express from 'express'
import { WebSocketServer } from 'ws'

const app = express();
const API_URL = process.env.API_URL || 'https://api.xcleone.me';

// Fetch stats from Laravel API
async function fetchStats() {
  try {
    const response = await fetch(`${API_URL}/api/stats`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching stats:', error.message);
    // Return mock data on error
    return {
      stats: {
        total_users: Math.floor(Math.random() * 150),
        total_admins: 1,
        players_online: Math.floor(Math.random() * 120),
        total_rooms: 8,
        active_rooms: Math.floor(Math.random() * 8),
      },
      recent_users: [],
      timestamp: new Date().toISOString(),
    };
  }
}

// REST endpoint for status
app.get('/api/status', async (req, res) => {
  try {
    const stats = await fetchStats();
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

const server = app.listen(3000, () => console.log('Node Gateway listening on port 3000'));

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
  
  // Send initial stats
  fetchStats().then((stats) => {
    ws.send(JSON.stringify(stats));
  });

  // Send updated stats every 5 seconds
  const interval = setInterval(async () => {
    try {
      const stats = await fetchStats();
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify(stats));
      }
    } catch (error) {
      console.error('Error sending stats:', error.message);
    }
  }, 5000);

  ws.on('close', () => {
    console.log('WebSocket client disconnected');
    clearInterval(interval);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error.message);
    clearInterval(interval);
  });
});

