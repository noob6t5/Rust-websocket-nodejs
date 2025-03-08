const { WebSocketServer } = require('rust-websocket-server');
const WS = require('ws');
const { performance } = require('perf_hooks');

async function createConnections(url, count) {
    const connections = [];
    const latencies = [];
    
    for (let i = 0; i < count; i++) {
        const startTime = performance.now();
        const ws = new WS(url);
        
        connections.push(
            new Promise((resolve) => {
                ws.on('open', () => {
                    const latency = performance.now() - startTime;
                    latencies.push(latency);
                    resolve();
                });
            })
        );
    }
    
    await Promise.all(connections);
    return {
        avgLatency: latencies.reduce((a, b) => a + b, 0) / latencies.length,
        maxLatency: Math.max(...latencies),
        minLatency: Math.min(...latencies)
    };
}

async function measureMemory() {
    const used = process.memoryUsage();
    return {
        heapTotal: Math.round(used.heapTotal / 1024 / 1024),
        heapUsed: Math.round(used.heapUsed / 1024 / 1024),
        rss: Math.round(used.rss / 1024 / 1024)
    };
}

async function runBenchmark() {
    console.log('Starting benchmark...');
    
    // Test Rust Implementation
    console.log('\nTesting Rust Implementation...');
    const rustWss = new WebSocketServer(8080);
    await rustWss.start();
    
    const rustMemoryBefore = await measureMemory();
    const rustStart = performance.now();
    const rustMetrics = await createConnections('ws://localhost:8080', 1000);
    const rustEnd = performance.now();
    const rustMemoryAfter = await measureMemory();
    
    // Test WS Implementation
    console.log('\nTesting WS Implementation...');
    const wsServer = new WS.Server({ port: 8081 });
    
    const wsMemoryBefore = await measureMemory();
    const wsStart = performance.now();
    const wsMetrics = await createConnections('ws://localhost:8081', 1000);
    const wsEnd = performance.now();
    const wsMemoryAfter = await measureMemory();
    
    // Print Results
    console.log('\n=== BENCHMARK RESULTS ===');
    console.log('\nRust Implementation:');
    console.log(`Total Time: ${(rustEnd - rustStart).toFixed(2)} ms`);
    console.log(`Avg Latency: ${rustMetrics.avgLatency.toFixed(2)} ms`);
    console.log(`Memory Usage: ${rustMemoryAfter.heapUsed - rustMemoryBefore.heapUsed} MB`);
    
    console.log('\nWS Implementation:');
    console.log(`Total Time: ${(wsEnd - wsStart).toFixed(2)} ms`);
    console.log(`Avg Latency: ${wsMetrics.avgLatency.toFixed(2)} ms`);
    console.log(`Memory Usage: ${wsMemoryAfter.heapUsed - wsMemoryBefore.heapUsed} MB`);
    
    process.exit(0);
}

runBenchmark().catch(console.error); 