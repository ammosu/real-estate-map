// components/map/TrendAnalysisChart.js
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { usePropertyData } from '../../context/PropertyDataContext';

// 使用dynamic import動態導入recharts組件，避免SSR問題
const ChartComponents = dynamic(
  () => import('./ChartComponents'),
  { ssr: false, loading: () => (
    <div className="h-96 flex items-center justify-center bg-gray-50 rounded-lg">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
        <p className="mt-2 text-gray-600">載入圖表中...</p>
      </div>
    </div>
  )}
);

const TrendAnalysisChart = ({ community = null }) => {
  const { monthlyData, communityMonthlyData } = usePropertyData();
  const [showErrorMetrics, setShowErrorMetrics] = useState(false);

  // 根據是否指定社區來選擇數據
  const chartData = community ? communityMonthlyData[community] : monthlyData;

  // 如果沒有數據，顯示空狀態
  if (!chartData || chartData.length === 0) {
    return (
      <div className="bg-white p-4 rounded-lg shadow flex flex-col items-center justify-center h-96">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p className="text-gray-500 text-center">沒有足夠的數據來顯示趨勢分析</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold">
          {community ? `${community} 價格時間趨勢分析` : '價格時間趨勢分析'}
        </h3>
        <div className="flex items-center">
          <button
            onClick={() => setShowErrorMetrics(!showErrorMetrics)}
            className={`px-3 py-1 rounded text-sm ${showErrorMetrics ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            {showErrorMetrics ? '顯示價格' : '顯示誤差指標'}
          </button>
        </div>
      </div>
      
      <ChartComponents 
        chartData={chartData} 
        showErrorMetrics={showErrorMetrics} 
      />
      
      <div className="mt-4 text-sm text-gray-600">
        {showErrorMetrics && (
          <div className="p-2 bg-gray-100 rounded">
            <p><strong>MAPE (平均絕對百分比誤差)：</strong>衡量估值與實際交易價格的絕對誤差百分比</p>
            <p><strong>MPE (平均百分比誤差)：</strong>衡量估值與實際交易價格的誤差方向，正值表示高估，負值表示低估</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrendAnalysisChart;