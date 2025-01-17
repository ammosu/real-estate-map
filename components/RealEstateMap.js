// components/RealEstateMap.js
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { generateSampleData } from './sampleData';

// 動態載入地圖組件
const Map = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => <div>Loading map...</div>
});

export default function RealEstateMap() {
  const [selectedTimeRange, setSelectedTimeRange] = useState('all');
  const [data, setData] = useState([]);

  // 載入並過濾資料
  useEffect(() => {
    const sampleData = generateSampleData();
    const filteredData = filterDataByTimeRange(sampleData, selectedTimeRange);
    setData(filteredData);
  }, [selectedTimeRange]);

  // 根據時間範圍過濾資料
  const filterDataByTimeRange = (data, timeRange) => {
    const now = new Date();
    const filterDate = new Date();
    
    switch (timeRange) {
      case '1month':
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case '3months':
        filterDate.setMonth(now.getMonth() - 3);
        break;
      case '6months':
        filterDate.setMonth(now.getMonth() - 6);
        break;
      default:
        return data;
    }

    return data.filter(item => new Date(item.date) >= filterDate);
  };

  // 計算統計資料
  const stats = React.useMemo(() => {
    if (!data.length) return { avgError: 0, count: 0 };
    
    const totalError = data.reduce((sum, item) => sum + item.error, 0);
    return {
      avgError: (totalError / data.length).toFixed(2),
      count: data.length
    };
  }, [data]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b p-6">
          <h2 className="text-2xl font-bold">房地產估價地圖</h2>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">時間範圍:</label>
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="w-full p-2 border rounded shadow-sm"
            >
              <option value="all">全部時間</option>
              <option value="1month">最近一個月</option>
              <option value="3months">最近三個月</option>
              <option value="6months">最近半年</option>
            </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-3">
              <div className="h-[600px] rounded border">
                <Map data={data} />
              </div>
            </div>

            <div className="lg:col-span-1 space-y-4">
              {/* 統計資訊 */}
              <div className="p-4 border rounded">
                <h3 className="text-lg font-medium mb-4">統計資訊</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-gray-600">平均誤差:</span>
                    <span className="ml-2 font-bold">{stats.avgError}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600">資料點數:</span>
                    <span className="ml-2 font-bold">{stats.count}</span>
                  </div>
                </div>
              </div>

              {/* 圖例說明 */}
              <div className="p-4 border rounded">
                <h3 className="text-lg font-medium mb-4">估價誤差說明</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-green-500 rounded mr-2"></div>
                    <span>誤差 小於等於 5%</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-yellow-500 rounded mr-2"></div>
                    <span>誤差 5%-10%</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-orange-500 rounded mr-2"></div>
                    <span>誤差 10%-15%</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-red-500 rounded mr-2"></div>
                    <span>誤差 大於 15%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}