'use client';

import { useEffect, useMemo } from 'react';
import { io } from 'socket.io-client';
import { useMarketStore } from '../store/useMarketStore';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, AlertTriangle, Cpu } from 'lucide-react';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export default function Dashboard() {
  const { addTicker, latest, tickers } = useMarketStore();
  const symbols = ["BTC-USD", "ETH-USD", "NVDA"]; // Filtrar visualización

  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ['websocket'] });
    
    socket.on('connect', () => console.log('🟢 Connected to WebSocket Stream'));
    
    socket.on('ticker_update', (data) => {
      addTicker(data);
    });

    return () => { socket.disconnect(); };
  }, [addTicker]);

  return (
    <main className="min-h-screen bg-slate-950 text-white p-8 font-mono">
      <header className="mb-8 border-b border-slate-800 pb-4 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
            QUANTUM STREAM NEXUS
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            <Cpu className="inline w-4 h-4 mr-1"/> 
            High-Performance Real-Time Engine (Rust + Node + Next.js)
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 px-4 py-2 rounded border border-slate-800">
            <span className="text-xs text-slate-500 block">SYSTEM STATUS</span>
            <span className="text-emerald-500 font-bold flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> ONLINE
            </span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {symbols.map((sym) => {
          const currentData = latest[sym];
          const history = tickers[sym] || [];
          const isVolatile = currentData?.volatility_index > 0.8;

          return (
            <div key={sym} className={`bg-slate-900/50 border ${isVolatile ? 'border-red-500/50' : 'border-slate-800'} rounded-xl p-6 relative overflow-hidden backdrop-blur-sm transition-all duration-300`}>
              
              {/* Header de la Tarjeta */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">{sym}</h2>
                  <p className="text-slate-400 text-xs">Crypto/Stock Asset</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-mono tracking-tighter">
                    ${currentData?.price?.toFixed(2) || '0.00'}
                  </div>
                  {isVolatile && (
                    <span className="flex items-center gap-1 text-red-400 text-xs font-bold animate-pulse mt-1 justify-end">
                      <AlertTriangle className="w-3 h-3"/> HIGH VOLATILITY
                    </span>
                  )}
                </div>
              </div>

              {/* Gráfico en Tiempo Real */}
              <div className="h-[200px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history}>
                    <XAxis dataKey="timestamp" hide />
                    <YAxis domain={['auto', 'auto']} hide />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #334155' }}
                      itemStyle={{ color: '#fff' }}
                      formatter={(value: number) => [`$${value}`, 'Price']}
                      labelFormatter={() => ''}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke={isVolatile ? '#ef4444' : '#3b82f6'} 
                      strokeWidth={2} 
                      dot={false}
                      isAnimationActive={false} // Desactivar animación para rendimiento en tiempo real extremo
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Métricas Secundarias */}
              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-800/50">
                <div>
                  <span className="text-xs text-slate-500 block">VOLUME (24H)</span>
                  <span className="text-sm font-mono">{currentData?.volume || 0}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">LATENCY</span>
                  <span className="text-sm font-mono text-emerald-400">< 1ms</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
