import React from 'react';
import dynamic from 'next/dynamic';
import { usePropertyData } from '../../context/PropertyDataContext';

// 使用dynamic import動態導入recharts組件，避免SSR問題
const FloorSizeChartComponents = dynamic(
  () => import('./FloorSizeChartComponents'),
  { ssr: false, loading: () => (
    <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
        <p className="mt-2 text-gray-600">載入圖表中...</p>
      </div>
    </div>
  )}
);

const FloorPriceChart = ({ community = null }) => {
  const { floorData, communityFloorData } = usePropertyData();
  
  // 根據是否指定社區來選擇數據
  const chartData = community ? communityFloorData[community] : floorData;
  
  // 如果沒有數據，顯示空狀態
  if (!chartData || chartData.length === 0) {
    return (
      <div className="bg-white p-4 rounded-lg shadow flex flex-col items-center justify-center h-64">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p className="text-gray-500 text-center">沒有足夠的數據來顯示樓層價格分析</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-bold mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        {community ? `${community} 各樓層價格分布` : '各樓層價格分布'}
      </h3>
      
      <FloorSizeChartComponents chartData={chartData} chartType="floor" />
    </div>
  );
};

export default FloorPriceChart;
