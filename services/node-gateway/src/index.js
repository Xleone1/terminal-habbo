import express from 'express'
import { WebSocketServer } from 'ws'

const app = express();
app.get('/api/status', (req,res)=>{
  res.json({ players_online: Math.floor(Math.random()*120), timestamp: Date.now() })
})

const server = app.listen(8082, ()=> console.log('Gateway listening 8082'));

const wss = new WebSocketServer({ server });

wss.on('connection', (ws)=>{
  console.log('ws connected');
  const interval = setInterval(()=>{
    const payload = JSON.stringify({ players_online: Math.floor(Math.random()*120), ts: Date.now() })
    ws.send(payload);
  }, 3000);
  ws.on('close', ()=> clearInterval(interval));
})
