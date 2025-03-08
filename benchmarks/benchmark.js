const { WebSocketServer } = require('rust-websocket-server');
const WS = require('ws');
const { performance } = require('perf_hooks');

async function createConnections(url, count) {
    const connections = [];
    for (let i = 0; i < count; i++) {
        const ws = new WS(url);
        connections.push(new Promise((resolve) => ws.on('open', resolve)));
    }
    await Promise.all(connections);
}

async function runBenchmark() {
    console.log('Starting benchmark...');
    
    // Test Rust Implementation
    const rustWss = new WebSocketServer(8080);
    await rustWss.start();
    
    const rustStart = performance.now();
    await createConnections('ws://localhost:8080', 10000);
    const rustEnd = performance.now();
    
    // Test WS Implementation
    const wsServer = new WS.Server({ port: 8081 });
    
    const wsStart = performance.now();
    await createConnections('ws://localhost:8081', 10000);
    const wsEnd = performance.now();
    
    console.log('Results:');
    console.log('Rust Implementation:', rustEnd - rustStart, 'ms');
    console.log('WS Implementation:', wsEnd - wsStart, 'ms');
    
    process.exit(0);
}

runBenchmark().catch(console.error); 