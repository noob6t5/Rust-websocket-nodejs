const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:8080');

ws.on('open', () => {
    console.log('Connected to server');
    
    // Send a message every 2 seconds
    setInterval(() => {
        ws.send('Hello from client!');
    }, 2000);
});

ws.on('message', (data) => {
    console.log('Received:', data.toString());
});

ws.on('error', console.error); 