const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:8080');

ws.on('open', () => {
    console.log('Connected to server');
    
    // Send a test message
    ws.send('Hello from test client!');
    
    // Send multiple messages
    setInterval(() => {
        ws.send(`Test message at ${new Date().toISOString()}`);
    }, 1000);
});

ws.on('message', (data) => {
    console.log('Received:', data.toString());
});

ws.on('error', (error) => {
    console.error('WebSocket error:', error);
});

ws.on('close', () => {
    console.log('Connection closed');
});