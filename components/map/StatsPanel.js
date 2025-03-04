// components/map/StatsPanel.js
import React from 'react';

export default function StatsPanel({ stats }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100">
      <div className="flex items-center mb-4">
        <div className="bg-blue-500 w-8 h-8 rounded-lg flex items-center justify-center mr-2 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">統計資訊</h3>
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
          <span className="text-gray-700 font-medium">平均誤差:</span>
          <span className="text-blue-600 font-bold text-lg">{stats.avgError}%</span>
        </div>
        <div className="flex items-center justify-between p-2 bg-indigo-50 rounded-lg">
          <span className="text-gray-700 font-medium">資料點數:</span>
          <span className="text-indigo-600 font-bold text-lg">{stats.count}</span>
        </div>
        <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
          <span className="text-gray-700 font-medium">最低價格:</span>
          <span className="text-green-600 font-bold text-lg">{stats.minPrice} 元</span>
        </div>
        <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
          <span className="text-gray-700 font-medium">最高價格:</span>
          <span className="text-red-600 font-bold text-lg">{stats.maxPrice} 元</span>
        </div>
        <div className="flex items-center justify-between p-2 bg-purple-50 rounded-lg">
          <span className="text-gray-700 font-medium">平均價格:</span>
          <span className="text-purple-600 font-bold text-lg">{stats.avgPrice} 元</span>
        </div>
      </div>
    </div>
  );
}