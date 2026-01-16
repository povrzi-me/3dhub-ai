// /api/gemini-relay.ts
import { WebSocket } from 'ws';

export default function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.status(405).end();
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).end('Missing GEMINI_API_KEY');
    return;
  }

  const upstream = new WebSocket(
    `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${apiKey}`
  );

  req.socket.on('data', (chunk: Buffer) => {
    if (upstream.readyState === WebSocket.OPEN) {
      upstream.send(chunk);
    }
  });

  upstream.on('message', (msg) => {
    res.socket.write(msg);
  });

  upstream.on('close', () => {
    res.socket.end();
  });

  req.socket.on('close', () => {
    upstream.close();
  });
}
