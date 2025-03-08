const { WebSocketServer } = require('../');

async function main() {
    const wss = new WebSocketServer(8080);
    
    console.log('Starting WebSocket server...');
    
    // Broadcast a message every 5 seconds
    setInterval(() => {
        wss.broadcast(`Server time: ${new Date().toISOString()}`)
            .catch(console.error);
    }, 5000);

    try {
        await wss.start();
    } catch (error) {
        console.error('Failed to start server:', error);
    }
}

main().catch(console.error); 