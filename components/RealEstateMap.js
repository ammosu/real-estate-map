// components/RealEstateMap.js
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { generateSampleData } from './sampleData';
import { cn } from '@/lib/utils';
import RangeSlider from './RangeSlider';
import CsvUploader from './CsvUploader';
// 動態匯入P5背景元件
const P5Background = dynamic(() => import('./P5Background'), { ssr: false });

// 動態載入地圖元件
const Map = dynamic(() => import('./Map'), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] rounded border flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
        <p className="mt-2 text-gray-600">載入地圖中...</p>
      </div>
    </div>
  ),
});

export default function RealEstateMap() {
  const [timeRange, setTimeRange] = useState(() => {
    // 設定最小日期為 2024/01/01
    const minDate = new Date('2024-01-01').getTime();
    // 預設結束日期為當前時間
    const endDate = new Date();
    // 預設開始日期為最近6個月，但不早於 2024/01/01
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(endDate.getMonth() - 6);
    const startDate = Math.max(sixMonthsAgo.getTime(), minDate);
    
    return [startDate, endDate.getTime()];
  });
  const [priceRange, setPriceRange] = useState([0, 50000000]);
  const [errorRange, setErrorRange] = useState([0, 20]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mapView, setMapView] = useState('map'); // 'map' or 'satellite'
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [dataSource, setDataSource] = useState('sample'); // 'sample' or 'uploaded'
  const [showEffects, setShowEffects] = useState(true); // 控制特效的顯示
  const [currentTime, setCurrentTime] = useState(''); // 用於存儲當前時間

  // 生成並儲存樣本資料（只在元件首次載入時生成一次）
  const [sampleData, setSampleData] = useState([]);
  // 儲存上傳的 CSV 資料
  const [uploadedData, setUploadedData] = useState([]);

  // 只在客戶端更新時間
  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString('zh-TW'));
    
    // 可選：設置定時器每秒更新時間
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('zh-TW'));
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  useEffect(() => {
    try {
      console.log("生成樣本資料");
      const generatedData = generateSampleData();
      console.log("生成的樣本資料:", generatedData.length, "個點");
      setSampleData(generatedData);
    } catch (error) {
      console.error("生成樣本資料錯誤:", error);
      setSampleData([]);
    }
  }, []);  // 空依賴陣列，確保只執行一次

  // 處理上傳的 CSV 資料
  const handleCsvDataLoaded = (csvData) => {
    setUploadedData(csvData);
    setDataSource('uploaded');
    setIsUploadModalOpen(false);
  };

  // 載入並過濾資料
  useEffect(() => {
    // 避免重複設定載入狀態
    if (loading) return;
    
    // 確保有資料可以過濾
    const sourceData = dataSource === 'sample' ? sampleData : uploadedData;
    if (sourceData.length === 0) return;
    
    setLoading(true);
    console.log("開始過濾資料");
    
    // 使用 window.setTimeout 確保清理能正常運作，並增加延遲時間
    const timerId = window.setTimeout(() => {
      // 防禦性程式設計
      try {
        // 使用 requestAnimationFrame 確保在下一幀渲染前執行過濾
        requestAnimationFrame(() => {
          const filteredData = filterData(sourceData) || [];
          console.log("過濾後資料:", filteredData.length, "個點");
          setData(filteredData);
          // 無論如何，都將載入狀態設為 false
          setLoading(false);
        });
      } catch (error) {
        console.error("資料處理錯誤:", error);
        // 發生錯誤時設定空陣列
        setData([]);
        setLoading(false);
      }
    }, 800); // 增加延遲時間，給瀏覽器更多時間處理 UI 更新
    
    // 清理函數
    return () => {
      window.clearTimeout(timerId);
    };
  }, [sampleData, uploadedData, dataSource, timeRange[0], timeRange[1], priceRange[0], priceRange[1], errorRange[0], errorRange[1]]);

  // 安全的過濾函數
  const filterData = (data) => {
    if (!Array.isArray(data)) return [];
    
    return data.filter(item => {
      // 確保資料存在
      if (!item) return false;
      
      // 時間過濾
      if (Array.isArray(timeRange) && timeRange.length === 2) {
        try {
          const itemDate = new Date(item.date).getTime();
          // 檢查最小值
          if (itemDate < timeRange[0]) {
            return false;
          }
          
          // 檢查最大值
          if (itemDate > timeRange[1]) {
            return false;
          }
        } catch (e) {
          console.warn("日期解析錯誤", e);
          return false;
        }
      }
      
      // 價格範圍過濾
      if (Array.isArray(priceRange) && priceRange.length === 2) {
        // 檢查最小值
        if (item.actualPrice < priceRange[0]) {
          return false;
        }
        
        // 檢查最大值 (如果最大值等於滑塊的最大值，視為不限上限)
        if (priceRange[1] < 100000000 && item.actualPrice > priceRange[1]) {
          return false;
        }
      }
      
      // 誤差範圍過濾
      if (Array.isArray(errorRange) && errorRange.length === 2) {
        // 檢查最小值
        if (item.error < errorRange[0]) {
          return false;
        }
        
        // 檢查最大值 (如果最大值等於滑塊的最大值，視為不限上限)
        if (errorRange[1] < 20 && item.error > errorRange[1]) {
          return false;
        }
      }
      
      return true;
    });
  };

  // 安全的統計計算
  const stats = React.useMemo(() => {
    const defaultStats = {
      avgError: 0,
      count: 0,
      minPrice: 0,
      maxPrice: 0,
      avgPrice: 0
    };
    
    if (!Array.isArray(data) || data.length === 0) return defaultStats;
    
    try {
      const totalError = data.reduce((sum, item) => sum + (item?.error || 0), 0);
      const prices = data.map(item => item?.actualPrice || 0).filter(p => p > 0);
      
      if (prices.length === 0) return defaultStats;
      
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
      
      return {
        avgError: (totalError / data.length).toFixed(2),
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

  // 格式化價格顯示
  const formatPrice = (value) => {
    return value.toLocaleString('zh-TW');
  };
  
  // 格式化日期顯示
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    
    // 為了支持 HTML5 日期輸入框，需要返回 YYYY-MM-DD 格式
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="p-3 md:p-6 max-w-7xl mx-auto relative">
      {/* 添加P5背景，只有當showEffects為true時才顯示 */}
      {showEffects && <P5Background className="" />}
      
      <div className="bg-white/80 backdrop-blur-md rounded-xl shadow-xl relative border border-gray-100/30 overflow-hidden">
        <div className="border-b border-gray-200/50 p-4 md:p-6">
          <div className="flex flex-wrap items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="bg-blue-600 w-10 h-10 rounded-lg flex items-center justify-center mr-3 shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">房地產估價地圖</h2>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
              {/* 特效切換按鈕 */}
              <button
                className={`px-3 py-2 ${showEffects ? 'bg-gradient-to-r from-purple-500 to-indigo-600' : 'bg-gray-400'} text-white rounded-lg flex items-center gap-2 shadow-md transition-all hover:shadow-lg`}
                onClick={() => setShowEffects(!showEffects)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zm7-10a1 1 0 01.707.293l.707.707.707-.707A1 1 0 0115 2a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 01-1 1 1 1 0 01-.707-.293l-.707-.707-.707.707A1 1 0 0112 8a1 1 0 01-1-1V6h-1a1 1 0 110-2h1V3a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                視覺特效
              </button>
              
              {/* 上傳 CSV 按鈕 */}
              <button
                className="px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg flex items-center gap-2 shadow-md transition-all hover:shadow-lg"
                onClick={() => setIsUploadModalOpen(!isUploadModalOpen)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                上傳 CSV
              </button>
              
              {/* 移動端篩選器按鈕 */}
              <button
                className="md:hidden px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg flex items-center gap-2 shadow-md transition-all hover:shadow-lg"
                onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                篩選條件
              </button>
            </div>
          </div>
          
          <p className="text-gray-500 text-sm">探索房地產市場趨勢與估價準確度，輕鬆分析不同區域的價格變化。</p>
        </div>

        {/* CSV 上傳模態框 */}
        {isUploadModalOpen && (
          <div className="border-b border-gray-200/50 p-4 md:p-6 bg-gray-50/50">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center">
                <div className="bg-green-500 w-8 h-8 rounded-lg flex items-center justify-center mr-2 shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">上傳 CSV 資料</h3>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-gray-500 hover:text-gray-700 bg-white rounded-full p-1 shadow-sm hover:shadow transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-4">
              <CsvUploader onDataLoaded={handleCsvDataLoaded} />
            </div>
            
            <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="text-sm text-gray-600 bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100">
                {uploadedData.length > 0 ? (
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    已上傳 {uploadedData.length} 筆資料
                  </span>
                ) : (
                  <span className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    尚未上傳資料
                  </span>
                )}
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setDataSource('sample')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${dataSource === 'sample'
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}`}
                >
                  使用樣本資料
                </button>
                <button
                  onClick={() => setDataSource('uploaded')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    uploadedData.length === 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : dataSource === 'uploaded'
                        ? 'bg-gradient-to-r from-green-500 to-teal-600 text-white shadow-md'
                        : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                  }`}
                  disabled={uploadedData.length === 0}
                >
                  使用上傳資料
                </button>
              </div>
            </div>
          </div>
        )}

        <div className={cn(
          "transition-all duration-300 overflow-hidden md:h-auto border-b border-gray-200/50",
          isMobileFilterOpen ? "max-h-[500px]" : "max-h-0 md:max-h-[500px]"
        )}>
          <div className="p-4 md:p-6 bg-gray-50/50">
            <div className="flex items-center mb-4">
              <div className="bg-blue-500 w-8 h-8 rounded-lg flex items-center justify-center mr-2 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">篩選條件</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 時間範圍選擇 */}
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  時間範圍:
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">開始日期</label>
                    <input
                      type="date"
                      className="w-full p-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      value={formatDate(timeRange[0])}
                      min="2024-01-01"
                      max={formatDate(new Date().getTime())}
                      onChange={(e) => {
                        try {
                          const date = new Date(e.target.value);
                          if (!isNaN(date.getTime())) {
                            // 確保開始日期不晚於結束日期
                            const endDate = timeRange[1];
                            if (date.getTime() <= endDate) {
                              setTimeRange([date.getTime(), endDate]);
                            } else {
                              // 如果開始日期晚於結束日期，將結束日期設為開始日期
                              setTimeRange([date.getTime(), date.getTime()]);
                            }
                          }
                        } catch (error) {
                          console.error('日期解析錯誤:', error);
                        }
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">結束日期</label>
                    <input
                      type="date"
                      className="w-full p-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      value={formatDate(timeRange[1])}
                      min={formatDate(timeRange[0])}
                      max={formatDate(new Date().getTime())}
                      onChange={(e) => {
                        try {
                          const date = new Date(e.target.value);
                          if (!isNaN(date.getTime())) {
                            // 確保結束日期不早於開始日期
                            const startDate = timeRange[0];
                            if (date.getTime() >= startDate) {
                              setTimeRange([startDate, date.getTime()]);
                            }
                          }
                        } catch (error) {
                          console.error('日期解析錯誤:', error);
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* 價格範圍滑塊 */}
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  價格範圍:
                </label>
                <RangeSlider
                  value={priceRange}
                  onChange={setPriceRange}
                  min={0}
                  max={100000000}
                  step={1000000}
                  formatValue={formatPrice}
                  unit=" 元"
                  allowNoLimit={true}
                  allowManualInput={true}
                  inputType="number"
                />
              </div>

              {/* 誤差範圍滑塊 */}
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  誤差範圍:
                </label>
                <RangeSlider
                  value={errorRange}
                  onChange={setErrorRange}
                  min={0}
                  max={20}
                  step={1}
                  unit="%"
                  allowNoLimit={true}
                  allowManualInput={true}
                  inputType="number"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6">
          {/* 地圖控制項 */}
          <div className="mb-4 flex justify-between items-center">
            <div className="flex items-center">
              <div className="bg-indigo-500 w-8 h-8 rounded-lg flex items-center justify-center mr-2 shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">地圖視圖</h3>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setMapView('map')}
                className={`px-4 py-2 rounded-lg transition-all ${mapView === 'map'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}`}
              >
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  標準地圖
                </span>
              </button>
              <button
                onClick={() => setMapView('satellite')}
                className={`px-4 py-2 rounded-lg transition-all ${mapView === 'satellite'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}`}
              >
                <span className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  衛星影像
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3">
              {/* 地圖容器 */}
              <div className="h-[400px] md:h-[600px] rounded-xl border border-gray-200 shadow-md overflow-hidden relative">
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 backdrop-blur-sm z-10">
                    <div className="bg-white p-6 rounded-xl shadow-lg text-center">
                      <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
                      <p className="mt-3 text-gray-700 font-medium">處理資料中...</p>
                    </div>
                  </div>
                )}
                <Map data={data || []} mapType={mapView} />
              </div>
              
              {/* 數據狀態提示 */}
              <div className="mt-3 flex items-center justify-between">
                <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 text-sm text-gray-600 flex items-center">
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      載入中...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      顯示 <span className="font-medium">{data.length}</span> 個資料點
                      {data.length === 0 && !loading ? ' (沒有符合條件的資料)' : ''}
                      {dataSource === 'uploaded' && uploadedData.length > 0 ? ' (使用上傳資料)' : ''}
                      {dataSource === 'sample' ? ' (使用樣本資料)' : ''}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  {currentTime && `最後更新: ${currentTime}`}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1 space-y-6">
              {/* 統計資訊 */}
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

              {/* 圖例說明 */}
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

              {/* 操作說明 */}
              <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100">
                <div className="flex items-center mb-4">
                  <div className="bg-purple-500 w-8 h-8 rounded-lg flex items-center justify-center mr-2 shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">操作說明</h3>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center p-2 bg-gray-50 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                    </svg>
                    點擊標記點查看詳細資訊
                  </li>
                  <li className="flex items-center p-2 bg-gray-50 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    滾輪縮放地圖
                  </li>
                  <li className="flex items-center p-2 bg-gray-50 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    拖曳移動地圖位置
                  </li>
                  <li className="flex items-center p-2 bg-gray-50 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                    </svg>
                    使用篩選條件精確查詢
                  </li>
                  <li className="flex items-center p-2 bg-gray-50 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                    </svg>
                    拖動滑塊兩端調整數值範圍
                  </li>
                  <li className="flex items-center p-2 bg-gray-50 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    可以開啟/關閉視覺特效
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}