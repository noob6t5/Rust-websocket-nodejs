const { WebSocketServer } = require('rust-websocket-server');

async function main() {
    const wss = new WebSocketServer(8080);
    console.log('WebSocket server starting on ws://localhost:8080');
    
    // Start the server
    await wss.start();
}

main().catch(console.error); 