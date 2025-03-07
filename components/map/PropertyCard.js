// components/map/PropertyCard.js
import React from 'react';

export default function PropertyCard({ property }) {
  // 確保所有必要的屬性都存在
  const {
    address = '未知地址',
    date,
    size = 0,
    floor = 0,
    actualPrice = 0,
    estimatedPrice = 0
  } = property || {};
  
  // 格式化日期
  const formattedDate = date ? new Date(date).toLocaleDateString('zh-TW') : '未知日期';
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-100">
      <div className="flex items-center mb-2">
        <div className="bg-blue-100 p-2 rounded-full mr-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <h4 className="font-medium">{address}</h4>
        <span className="ml-auto text-sm text-gray-500">{formattedDate}</span>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mt-3">
        <div>
          <div className="text-gray-500 text-sm">房屋坪數</div>
          <div className="font-medium">{size.toFixed(2)}坪</div>
        </div>
        <div>
          <div className="text-gray-500 text-sm">樓層</div>
          <div className="font-medium">{floor}F</div>
        </div>
        <div>
          <div className="text-gray-500 text-sm">交易價格 (元/坪)</div>
          <div className="font-medium text-blue-500">{Math.round(actualPrice).toLocaleString('zh-TW')}</div>
        </div>
        <div>
          <div className="text-gray-500 text-sm">估值 (元/坪)</div>
          <div className="font-medium text-orange-500">{Math.round(estimatedPrice).toLocaleString('zh-TW')}</div>
        </div>
      </div>
    </div>
  );
}
