# fast-websocket

A high-performance WebSocket server implemented in Rust with Node.js bindings.

## Installation

```bash
npm install fast-websocket
```

## Usage

```javascript
const { WebSocketServer } = require('fast-websocket');

async function main() {
    const wss = new WebSocketServer(8080);
    
    // Broadcast a message every 5 seconds
    setInterval(() => {
        wss.broadcast('Hello from server!');
    }, 5000);

    await wss.start();
}

main().catch(console.error);
```

## API

### WebSocketServer

#### constructor(port: number)
Creates a new WebSocket server instance.

#### start(): Promise<void>
Starts the WebSocket server.

#### broadcast(message: string): Promise<void>
Broadcasts a message to all connected clients.

#### getPort(): number
Returns the port number the server is configured to use.

## License

MIT 