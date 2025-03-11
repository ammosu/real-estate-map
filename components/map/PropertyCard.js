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
    estimatedPrice = 0,
    estimatedPriceWithCommunity = 0,
    estimatedPriceWithCommunityAndTime = 0,
    city = '',
    district = '',
    community = ''
  } = property || {};
  
  // 格式化日期
  const formattedDate = date ? new Date(date).toLocaleDateString('zh-TW') : '未知日期';
  
  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-100">
      <div className="flex flex-col mb-3">
        <div className="flex items-center mb-1">
          <div className="bg-blue-100 p-2 rounded-full mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h4 className="font-medium">{address}</h4>
          <span className="ml-auto text-sm text-gray-500">{formattedDate}</span>
        </div>
        
        {community && (
          <div className="flex items-center ml-9 text-sm">
            <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded mr-2">
              {community}
            </span>
            {city && district && (
              <span className="text-gray-500">
                {city} {district}
              </span>
            )}
          </div>
        )}
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
      </div>
      
      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
        <h5 className="text-sm font-medium text-gray-700 mb-2">價格比較</h5>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-gray-500 text-sm">交易價格 (元/坪)</div>
            <div className="font-medium text-blue-500">{Math.round(actualPrice).toLocaleString('zh-TW')}</div>
          </div>
          <div>
            <div className="text-gray-500 text-sm">基本估值 (元/坪)</div>
            <div className="flex items-center">
              <span className="font-medium text-orange-500">{Math.round(estimatedPrice).toLocaleString('zh-TW')}</span>
              {actualPrice > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                  ((estimatedPrice - actualPrice) / actualPrice * 100) >= 0
                    ? 'bg-red-100 text-red-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  PE: {((estimatedPrice - actualPrice) / actualPrice * 100).toFixed(2)}%
                </span>
              )}
            </div>
          </div>
          <div>
            <div className="text-gray-500 text-sm">含社區調整估值 (元/坪)</div>
            <div className="flex items-center">
              <span className="font-medium text-green-500">{Math.round(estimatedPriceWithCommunity).toLocaleString('zh-TW')}</span>
              {actualPrice > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                  ((estimatedPriceWithCommunity - actualPrice) / actualPrice * 100) >= 0
                    ? 'bg-red-100 text-red-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  PE: {((estimatedPriceWithCommunity - actualPrice) / actualPrice * 100).toFixed(2)}%
                </span>
              )}
            </div>
          </div>
          <div>
            <div className="text-gray-500 text-sm">含社區時間調整估值 (元/坪)</div>
            <div className="flex items-center">
              <span className="font-medium text-purple-500">{Math.round(estimatedPriceWithCommunityAndTime).toLocaleString('zh-TW')}</span>
              {actualPrice > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                  ((estimatedPriceWithCommunityAndTime - actualPrice) / actualPrice * 100) >= 0
                    ? 'bg-red-100 text-red-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  PE: {((estimatedPriceWithCommunityAndTime - actualPrice) / actualPrice * 100).toFixed(2)}%
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
