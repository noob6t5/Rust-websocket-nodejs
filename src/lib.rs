use napi_derive::napi;
use std::sync::Arc;
use tokio::net::TcpListener;
use tokio::sync::Mutex;
use futures_util::{SinkExt, StreamExt};
use tokio_tungstenite::WebSocketStream;
use tokio_tungstenite::tungstenite::Message;

type WebSocketTx = futures_util::stream::SplitSink<WebSocketStream<tokio::net::TcpStream>, Message>;
type WebSocketRx = futures_util::stream::SplitStream<WebSocketStream<tokio::net::TcpStream>>;

#[napi]
pub struct WebSocketServer {
    port: u16,
    clients: Arc<Mutex<Vec<WebSocketTx>>>,
}

#[napi]
impl WebSocketServer {
    #[napi(constructor)]
    pub fn new(port: u16) -> Self {
        WebSocketServer {
            port,
            clients: Arc::new(Mutex::new(Vec::new())),
        }
    }

    #[napi]
    pub async fn start(&self) -> napi::Result<()> {
        let addr = format!("127.0.0.1:{}", self.port);
        let try_socket = TcpListener::bind(&addr).await;
        let listener = try_socket.map_err(|e| napi::Error::from_reason(e.to_string()))?;
        
        println!("WebSocket server listening on ws://{}", addr);

        let clients = Arc::clone(&self.clients);

        loop {
            let (stream, addr) = listener.accept().await
                .map_err(|e| napi::Error::from_reason(e.to_string()))?;

            println!("New connection from: {}", addr);

            let ws_stream = tokio_tungstenite::accept_async(stream).await
                .map_err(|e| napi::Error::from_reason(e.to_string()))?;

            let (ws_tx, mut ws_rx) = ws_stream.split();
            
            {
                let mut clients = clients.lock().await;
                clients.push(ws_tx);
            }

            let clients_clone = Arc::clone(&clients);

            // Handle incoming messages
            tokio::spawn(async move {
                while let Some(msg) = ws_rx.next().await {
                    if let Ok(msg) = msg {
                        println!("Received message: {:?}", msg);
                        
                        let mut clients = clients_clone.lock().await;
                        // Create a vector to store clients to remove
                        let mut to_remove = Vec::new();
                        
                        // Try sending to each client
                        for (index, client) in clients.iter_mut().enumerate() {
                            if let Err(_) = client.send(msg.clone()).await {
                                to_remove.push(index);
                            }
                        }
                        
                        // Remove failed clients in reverse order
                        for index in to_remove.iter().rev() {
                            clients.remove(*index);
                        }
                    }
                }
            });
        }
    }

    #[napi]
    pub async fn broadcast(&self, message: String) -> napi::Result<()> {
        let mut clients = self.clients.lock().await;
        let msg = Message::Text(message);

        // Create a vector to store indices of clients to remove
        let mut to_remove = Vec::new();
        
        // Try sending to each client
        for (index, client) in clients.iter_mut().enumerate() {
            if let Err(_) = client.send(msg.clone()).await {
                to_remove.push(index);
            }
        }
        
        // Remove failed clients in reverse order
        for index in to_remove.iter().rev() {
            clients.remove(*index);
        }

        Ok(())
    }

    #[napi]
    pub fn get_port(&self) -> u16 {
        self.port
    }
} 