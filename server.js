import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { WebSocketServer, WebSocket } from 'ws';

const port = process.env.PORT || 8080;
const historyFile = new URL('./chat-history.json', import.meta.url);
const maxHistory = 100;
const profanityPattern = /\b(?:arse|asshole|bastard|bitch\w*|bullshit|crap|damn\w*|dick\w*|fuck\w*|hell|idiot\w*|piss\w*|shit\w*|slut\w*|stupid\w*|whore\w*)\b/gi;

function filterProfanity(value) {
  return value.replace(profanityPattern, (word) => `${word[0]}${'*'.repeat(Math.max(2, word.length - 1))}`);
}

let messageHistory = [];
if (existsSync(historyFile)) {
  try {
    const savedHistory = JSON.parse(readFileSync(historyFile, 'utf8'));
    if (Array.isArray(savedHistory)) messageHistory = savedHistory.slice(-maxHistory);
  } catch (error) {
    console.error('Could not load chat history:', error.message);
  }
}

const wss = new WebSocketServer({ port: port });

wss.on('connection', (ws) => {
  console.log(`\n======================================`);
  console.log(`Client joined! Total active users: ${wss.clients.size}`);
  console.log(`======================================\n`);

  ws.send(JSON.stringify({ type: 'history', messages: messageHistory }));

  ws.on('message', (rawData) => {
    const stringData = rawData.toString();

    try {
      const parsedData = JSON.parse(stringData);
      const name = typeof parsedData.name === 'string' ? filterProfanity(parsedData.name.trim().slice(0, 30)) : '';
      const text = typeof parsedData.text === 'string' ? filterProfanity(parsedData.text.trim().slice(0, 500)) : '';
      if (!name || !text) return;

      const message = { name, text, timestamp: new Date().toISOString() };
      messageHistory = [...messageHistory, message].slice(-maxHistory);
      writeFileSync(historyFile, JSON.stringify(messageHistory, null, 2));

      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'message', message }));
        }
      });
    } catch (error) {
      console.error('Ignoring invalid message:', error.message);
    }
  });

  ws.on('close', () => {
    console.log(`A client disconnected. Remaining users: ${wss.clients.size}`);
  });
});

console.log('Multi-client WebSocket server safely booted on ws://localhost:8080');