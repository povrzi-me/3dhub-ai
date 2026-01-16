import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import dotenv from 'dotenv';

dotenv.config();

const PORT = 3000;
const API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY;

if (!API_KEY) {
  console.error("ERROR: GEMINI_API_KEY is not set in .env file");
  process.exit(1);
}

const server = createServer((req, res) => {
  res.writeHead(200);
  res.end('Andro VIP Local Relay is Running');
});

const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (request, socket, head) => {
  // Check if this is a request for our relay
  if (request.url.startsWith('/api/gemini-relay')) {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

wss.on('connection', (clientWs, req) => {
  console.log('[Local Relay] Client connected');

  // Strip the local proxy path to get the upstream path
  // Client requests: /api/gemini-relay/ws/google.ai...
  const targetPath = req.url.replace('/api/gemini-relay', '');
  const targetUrl = `wss://generativelanguage.googleapis.com${targetPath}`;
  
  const separator = targetUrl.includes('?') ? '&' : '?';
  const authUrl = `${targetUrl}${separator}key=${API_KEY}`;

  const googleWs = new WebSocket(authUrl);

  googleWs.on('open', () => {
    console.log('[Local Relay] Connected to Gemini');
  });

  clientWs.on('message', (data) => {
    if (googleWs.readyState === WebSocket.OPEN) {
      googleWs.send(data);
    }
  });

  googleWs.on('message', (data) => {
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(data);
    }
  });

  clientWs.on('close', () => {
    console.log('[Local Relay] Client closed');
    googleWs.close();
  });

  googleWs.on('close', () => {
    console.log('[Local Relay] Gemini closed');
    clientWs.close();
  });

  clientWs.on('error', (e) => console.error('Client Error:', e));
  googleWs.on('error', (e) => console.error('Google Error:', e));
});

server.listen(PORT, () => {
  console.log(`\n🚀 Local Relay Server running at http://localhost:${PORT}`);
  console.log(`Proxying traffic to Gemini API`);
});