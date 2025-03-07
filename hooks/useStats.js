// hooks/useStats.js
import { useMemo } from 'react';

export default function useStats(data) {
  // 安全的統計計算
  const stats = useMemo(() => {
    const defaultStats = {
      avgError: 0,
      avgAbsError: 0,
      count: 0,
      minPrice: 0,
      maxPrice: 0,
      avgPrice: 0
    };
    
    if (!Array.isArray(data) || data.length === 0) return defaultStats;
    
    try {
      // 計算總誤差（考慮正負值）
      const totalError = data.reduce((sum, item) => sum + (item?.error || 0), 0);
      
      // 計算絕對誤差總和（不考慮正負）
      const totalAbsError = data.reduce((sum, item) => sum + Math.abs(item?.error || 0), 0);
      
      const prices = data.map(item => item?.actualPrice || 0).filter(p => p > 0);
      
      if (prices.length === 0) return defaultStats;
      
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
      
      return {
        avgError: (totalError / data.length).toFixed(2),
        avgAbsError: (totalAbsError / data.length).toFixed(2),
        count: data.length,
        minPrice: minPrice.toLocaleString('zh-TW'),
        maxPrice: maxPrice.toLocaleString('zh-TW'),
        avgPrice: Math.round(avgPrice).toLocaleString('zh-TW')
      };
    } catch (e) {
      console.error("統計計算錯誤", e);
      return defaultStats;
    }
  }, [data]);

  return stats;
}
