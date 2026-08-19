import { WebSocketServer, WebSocket } from 'ws';

const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', (ws) => {
  console.log(`\n======================================`);
  console.log(`Client joined! Total active users: ${wss.clients.size}`);
  console.log(`======================================\n`);

  ws.on('message', (rawData) => {
    // 1. Always safely decode the raw network buffer first
    const stringData = new TextDecoder().decode(rawData);
    
    // 2. Wrap everything in a try...catch block to prevent JSON parsing crashes
    try {
      // If it's a JSON object, parse it (or just log it)
      const parsedData = JSON.parse(stringData);
      console.log('Received valid JSON:', parsedData);
    } catch (e) {
      // If it's NOT JSON (like "Hi" or "Hello Server!"), it safely falls back here
      console.log(`Received plain text string: "${stringData}"`);
    }

    // 3. Broadcast the raw string out to all other open tabs
    wss.clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(stringData); 
      }
    });
  });

  ws.on('close', () => {
    console.log(`A client disconnected. Remaining users: ${wss.clients.size}`);
  });
});

console.log('Multi-client WebSocket server safely booted on ws://localhost:8080');