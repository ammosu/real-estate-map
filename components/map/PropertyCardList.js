// components/map/PropertyCardList.js
import React, { useMemo, useState } from 'react';
import PropertyCard from './PropertyCard';
import TrendAnalysisChart from './TrendAnalysisChart';
import PriceCorrelationChart from './PriceCorrelationChart';
import FloorPriceChart from './FloorPriceChart';
import SizePriceChart from './SizePriceChart';
import { PropertyDataProvider } from '../../context/PropertyDataContext';

// 按月份分組並排序的函數
const groupPropertiesByMonth = (properties) => {
  if (!Array.isArray(properties) || properties.length === 0) {
    return {};
  }

  // 按月份分組
  const grouped = properties.reduce((acc, property) => {
    if (!property || !property.date) return acc;
    
    try {
      const date = new Date(property.date);
      const year = date.getFullYear();
      const month = date.getMonth() + 1; // getMonth() 返回 0-11
      const key = `${year}年${month.toString().padStart(2, '0')}月`;
      
      if (!acc[key]) {
        acc[key] = [];
      }
      
      acc[key].push(property);
    } catch (error) {
      console.error('日期處理錯誤:', error);
    }
    
    return acc;
  }, {});
  
  // 對每個月份內的屬性按日期排序
  Object.keys(grouped).forEach(key => {
    grouped[key].sort((a, b) => {
      return new Date(b.date) - new Date(a.date);
    });
  });
  
  // 對月份鍵進行排序（從最近的月份開始）
  const sortedKeys = Object.keys(grouped).sort((a, b) => {
    const yearA = parseInt(a.substring(0, 4));
    const monthA = parseInt(a.substring(5, 7));
    const yearB = parseInt(b.substring(0, 4));
    const monthB = parseInt(b.substring(5, 7));
    
    if (yearA !== yearB) {
      return yearB - yearA; // 年份降序
    }
    return monthB - monthA; // 月份降序
  });
  
  // 創建排序後的對象
  const sortedGrouped = {};
  sortedKeys.forEach(key => {
    sortedGrouped[key] = grouped[key];
  });
  
  return sortedGrouped;
};

// 按社區分組的函數
const groupPropertiesByCommunity = (properties) => {
  if (!Array.isArray(properties) || properties.length === 0) {
    return {};
  }

  // 按社區分組
  const grouped = properties.reduce((acc, property) => {
    if (!property || !property.community) {
      // 如果沒有社區信息，放入"未分類"組
      const key = "未分類";
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(property);
      return acc;
    }
    
    const key = property.community;
    if (!acc[key]) {
      acc[key] = [];
    }
    
    acc[key].push(property);
    return acc;
  }, {});
  
  return grouped;
};

export default function PropertyCardList({ properties, onClose }) {
  // 頁籤狀態
  const [activeTab, setActiveTab] = useState('list'); // 'list', 'trend', 'correlation' 或 'analysis'
  
  // 使用 useMemo 緩存分組結果，避免不必要的重新計算
  const groupedProperties = useMemo(() => {
    return groupPropertiesByMonth(properties);
  }, [properties]);
  
  // 按社區分組
  const communitiesGrouped = useMemo(() => {
    return groupPropertiesByCommunity(properties);
  }, [properties]);
  
  // 獲取社區列表
  const communities = useMemo(() => {
    return Object.keys(communitiesGrouped);
  }, [communitiesGrouped]);
  
  // 追蹤每個月份的展開/收合狀態，預設第一個月份為展開狀態
  const [expandedMonths, setExpandedMonths] = useState(() => {
    const initialState = {};
    const monthKeys = Object.keys(groupedProperties);
    if (monthKeys.length > 0) {
      initialState[monthKeys[0]] = true;
    }
    return initialState;
  });
  
  // 切換月份的展開/收合狀態
  const toggleMonth = (monthKey) => {
    setExpandedMonths(prev => ({
      ...prev,
      [monthKey]: !prev[monthKey]
    }));
  };
  
  // 如果沒有屬性，顯示空狀態
  if (!properties || properties.length === 0) {
    return null;
  }
  
  return (
    <div className="mt-6 space-y-6 relative">
      {/* 關閉按鈕 */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute -top-4 right-0 bg-gray-200 hover:bg-gray-300 rounded-full p-2 transition-colors"
          aria-label="關閉卡片列表"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
      
      {/* 標題 */}
      <div className="flex items-center">
        <h3 className="text-lg font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          選取的房產資訊
        </h3>
        <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
          {properties.length} 筆資料
        </span>
      </div>
      
      {/* 頁籤切換 */}
      <div className="flex border-b border-gray-200">
        <button
          className={`py-2 px-4 font-medium text-sm focus:outline-none ${
            activeTab === 'list'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('list')}
        >
          房產列表
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm focus:outline-none ${
            activeTab === 'trend'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('trend')}
        >
          價格趨勢
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm focus:outline-none ${
            activeTab === 'correlation'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('correlation')}
        >
          價格關係
        </button>
        <button
          className={`py-2 px-4 font-medium text-sm focus:outline-none ${
            activeTab === 'analysis'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('analysis')}
        >
          坪數分析
        </button>
      </div>
      
      {/* 房產列表頁籤內容 */}
      {activeTab === 'list' && (
        <div className="space-y-6">
          {Object.entries(groupedProperties).map(([monthKey, props]) => (
            <div key={monthKey} className="space-y-4">
              <div
                className="bg-yellow-100 p-4 rounded-lg flex justify-between items-center cursor-pointer hover:bg-yellow-200 transition-colors"
                onClick={() => toggleMonth(monthKey)}
              >
                <div className="flex items-center">
                  <div className="mr-2 text-gray-600">
                    {expandedMonths[monthKey] ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <h3 className="font-bold">{monthKey}</h3>
                </div>
                <div>
                  <span className="bg-yellow-300 px-3 py-1 rounded-full font-bold">
                    {Math.round(props.reduce((sum, prop) => sum + prop.actualPrice, 0) / props.length).toLocaleString('zh-TW')} 元/坪
                  </span>
                  <span className="ml-2">交易：{props.length}筆</span>
                </div>
              </div>
              
              {expandedMonths[monthKey] && (
                <div className="space-y-4 animate-fadeIn">
                  {props.map((property, index) => (
                    <PropertyCard key={index} property={property} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* 價格趨勢頁籤內容 */}
      {activeTab === 'trend' && (
        <div className="space-y-6">
          {/* 如果只有一個社區或沒有社區信息，顯示整體趨勢 */}
          {communities.length <= 1 ? (
            <TrendAnalysisChart />
          ) : (
            <>
              {/* 先顯示整體趨勢 */}
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-700 mb-3">整體價格趨勢</h4>
                <TrendAnalysisChart />
              </div>
              
              {/* 然後顯示每個社區的趨勢 */}
              <div className="space-y-8">
                <h4 className="text-lg font-medium text-gray-700">各社區價格趨勢</h4>
                {communities.map(community => (
                  <div key={community} className="border-t pt-4">
                    <h5 className="text-md font-medium text-gray-600 mb-3">{community}</h5>
                    <TrendAnalysisChart community={community} />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
      
      {/* 價格關係頁籤內容 */}
      {activeTab === 'correlation' && (
        <div className="space-y-6">
          {/* 如果只有一個社區或沒有社區信息，顯示整體關係圖 */}
          {communities.length <= 1 ? (
            <PriceCorrelationChart />
          ) : (
            <>
              {/* 先顯示整體關係圖 */}
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-700 mb-3">整體價格關係</h4>
                <PriceCorrelationChart />
              </div>
              
              {/* 然後顯示每個社區的關係圖 */}
              <div className="space-y-8">
                <h4 className="text-lg font-medium text-gray-700">各社區價格關係</h4>
                {communities.map(community => (
                  <div key={community} className="border-t pt-4">
                    <h5 className="text-md font-medium text-gray-600 mb-3">{community}</h5>
                    <PriceCorrelationChart community={community} />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
      
      {/* 坪數分析頁籤內容 */}
      {activeTab === 'analysis' && (
        <div className="space-y-6">
          {/* 如果只有一個社區或沒有社區信息，顯示整體分析 */}
          {communities.length <= 1 ? (
            <>
              <FloorPriceChart />
              <div className="mt-6">
                <SizePriceChart />
              </div>
            </>
          ) : (
            <>
              {/* 先顯示整體分析 */}
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-700 mb-3">整體分析</h4>
                <FloorPriceChart />
                <div className="mt-6">
                  <SizePriceChart />
                </div>
              </div>
              
              {/* 然後顯示每個社區的分析 */}
              <div className="space-y-8">
                <h4 className="text-lg font-medium text-gray-700">各社區分析</h4>
                {communities.map(community => (
                  <div key={community} className="border-t pt-4">
                    <h5 className="text-md font-medium text-gray-600 mb-3">{community}</h5>
                    <FloorPriceChart community={community} />
                    <div className="mt-6">
                      <SizePriceChart community={community} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
