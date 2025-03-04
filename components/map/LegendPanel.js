// components/map/LegendPanel.js
import React from 'react';

export default function LegendPanel() {
  return (
    <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100">
      <div className="flex items-center mb-4">
        <div className="bg-green-500 w-8 h-8 rounded-lg flex items-center justify-center mr-2 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">估價誤差說明</h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center p-3 bg-green-50 rounded-lg">
          <div className="w-8 h-8 bg-green-500 rounded-full mr-3 shadow-sm"></div>
          <span className="text-gray-700">誤差 ≤ 5%</span>
        </div>
        <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
          <div className="w-8 h-8 bg-yellow-500 rounded-full mr-3 shadow-sm"></div>
          <span className="text-gray-700">誤差 5%-10%</span>
        </div>
        <div className="flex items-center p-3 bg-orange-50 rounded-lg">
          <div className="w-8 h-8 bg-orange-500 rounded-full mr-3 shadow-sm"></div>
          <span className="text-gray-700">誤差 10%-15%</span>
        </div>
        <div className="flex items-center p-3 bg-red-50 rounded-lg">
          <div className="w-8 h-8 bg-red-500 rounded-full mr-3 shadow-sm"></div>
          <span className="text-gray-700">誤差 {'>'}15%</span>
        </div>
      </div>
    </div>
  );
}