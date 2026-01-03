import { create } from 'zustand';

export interface MarketData {
  symbol: String;
  price: number;
  volume: number;
  timestamp: string;
  volatility_index: number;
  alert?: string;
}

interface MarketStore {
  tickers: Record<string, MarketData[]>; // Historial por símbolo
  latest: Record<string, MarketData>;    // Último precio
  addTicker: (data: any) => void;
}

export const useMarketStore = create<MarketStore>((set) => ({
  tickers: {},
  latest: {},
  addTicker: (data) => set((state) => {
    const symbol = data.symbol;
    const currentHistory = state.tickers[symbol] || [];
    // Mantenemos solo los últimos 50 puntos para rendimiento
    const newHistory = [...currentHistory, data].slice(-50);
    
    return {
      tickers: { ...state.tickers, [symbol]: newHistory },
      latest: { ...state.latest, [symbol]: data }
    };
  }),
}));
