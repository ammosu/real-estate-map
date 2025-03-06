// hooks/useTimeManagement.js
import { useState, useEffect } from 'react';

export default function useTimeManagement() {
  const [currentTime, setCurrentTime] = useState('');
  const [timeRange, setTimeRange] = useState(() => {
    // 設定最小日期為 2012/07/01
    const minDate = new Date('2012-07-01').getTime();
    // 預設結束日期為當前時間
    const endDate = new Date();
    // 預設開始日期為最近6個月，但不早於 2012/07/01
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(endDate.getMonth() - 6);
    const startDate = Math.max(sixMonthsAgo.getTime(), minDate);
    
    return [startDate, endDate.getTime()];
  });

  // 只在客戶端更新時間
  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString('zh-TW'));
    
    // 可選：設置定時器每秒更新時間
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('zh-TW'));
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // 格式化日期顯示
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    
    // 為了支持 HTML5 日期輸入框，需要返回 YYYY-MM-DD 格式
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };

  return {
    currentTime,
    timeRange,
    setTimeRange,
    formatDate
  };
}