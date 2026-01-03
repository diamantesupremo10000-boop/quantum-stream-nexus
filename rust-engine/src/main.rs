use redis::AsyncCommands;
use serde::{Serialize, Deserialize};
use std::time::Duration;
use rand::Rng;
use chrono::Utc;

#[derive(Serialize, Deserialize, Debug)]
struct MarketData {
    symbol: String,
    price: f64,
    volume: u32,
    timestamp: String,
    volatility_index: f64,
}

#[tokio::main]
async fn main() -> redis::RedisResult<()> {
    println!("🚀 Rust High-Performance Engine Starting...");
    
    // Conexión al Bus de Eventos
    let client = redis::Client::open("redis://redis:6379")?;
    let mut con = client.get_async_connection().await?;

    let symbols = vec!["BTC-USD", "ETH-USD", "SOL-USD", "NVDA", "TSLA"];
    let mut rng = rand::thread_rng();

    loop {
        // Simulamos cálculos complejos de alta frecuencia
        for sym in &symbols {
            let price: f64 = rng.gen_range(100.0..50000.0);
            let volume: u32 = rng.gen_range(1..1000);
            let volatility: f64 = rng.gen_range(0.0..1.0);

            let data = MarketData {
                symbol: sym.to_string(),
                price: (price * 100.0).round() / 100.0,
                volume,
                timestamp: Utc::now().to_rfc3339(),
                volatility_index: volatility,
            };

            let json_data = serde_json::to_string(&data).unwrap();

            // Publicamos al canal "market_updates"
            // Esto ocurre miles de veces, Rust lo maneja sin sudar
            let _: () = con.publish("market_updates", json_data).await?;
        }

        // Frecuencia de actualización (50ms = 20 actualizaciones por segundo por activo)
        tokio::time::sleep(Duration::from_millis(50)).await;
    }
}
