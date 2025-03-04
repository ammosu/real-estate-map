// components/RealEstateMap.js
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { generateSampleData } from './sampleData';
import { cn } from '@/lib/utils';
import RangeSlider from './RangeSlider';
import CsvUploader from './CsvUploader';
// 動態導入P5背景組件
const P5Background = dynamic(() => import('./P5Background'), { ssr: false });

// 動態載入地圖組件
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
  const [selectedTimeRange, setSelectedTimeRange] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 50000000]);
  const [errorRange, setErrorRange] = useState([0, 20]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mapView, setMapView] = useState('map'); // 'map' or 'satellite'
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [dataSource, setDataSource] = useState('sample'); // 'sample' or 'uploaded'
  const [showEffects, setShowEffects] = useState(true); // 控制特效的顯示

  // 生成並存儲樣本數據（只在組件首次加載時生成一次）
  const [sampleData, setSampleData] = useState([]);
  // 存儲上傳的 CSV 數據
  const [uploadedData, setUploadedData] = useState([]);
  
  useEffect(() => {
    try {
      console.log("生成樣本數據");
      const generatedData = generateSampleData();
      console.log("生成的樣本數據:", generatedData.length, "個點");
      setSampleData(generatedData);
    } catch (error) {
      console.error("生成樣本數據錯誤:", error);
      setSampleData([]);
    }
  }, []);  // 空依賴數組，確保只執行一次

  // 處理上傳的 CSV 數據
  const handleCsvDataLoaded = (csvData) => {
    setUploadedData(csvData);
    setDataSource('uploaded');
    setIsUploadModalOpen(false);
  };

  // 載入並過濾資料
  useEffect(() => {
    // 避免重複設置加載狀態
    if (loading) return;
    
    // 確保有數據可以過濾
    const sourceData = dataSource === 'sample' ? sampleData : uploadedData;
    if (sourceData.length === 0) return;
    
    setLoading(true);
    console.log("開始過濾數據");
    
    // 使用 window.setTimeout 確保清理能正常工作，並增加延遲時間
    const timerId = window.setTimeout(() => {
      // 防禦性程式設計
      try {
        // 使用 requestAnimationFrame 確保在下一幀渲染前執行過濾
        requestAnimationFrame(() => {
          const filteredData = filterData(sourceData) || [];
          console.log("過濾後數據:", filteredData.length, "個點");
          setData(filteredData);
          // 無論如何，都將加載狀態設為 false
          setLoading(false);
        });
      } catch (error) {
        console.error("數據處理錯誤:", error);
        // 發生錯誤時設置空數組
        setData([]);
        setLoading(false);
      }
    }, 800); // 增加延遲時間，給瀏覽器更多時間處理 UI 更新
    
    // 清理函數
    return () => {
      window.clearTimeout(timerId);
    };
  }, [sampleData, uploadedData, dataSource, selectedTimeRange, priceRange[0], priceRange[1], errorRange[0], errorRange[1]]);

  // 安全的過濾函數
  const filterData = (data) => {
    if (!Array.isArray(data)) return [];
    
    const now = new Date();
    const filterDate = new Date();
    
    if (selectedTimeRange !== 'all') {
      switch (selectedTimeRange) {
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
          break;
      }
    }
    
    return data.filter(item => {
      // 確保數據存在
      if (!item) return false;
      
      // 時間過濾
      if (selectedTimeRange !== 'all') {
        try {
          if (new Date(item.date) < filterDate) {
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

  return (
    <div className="p-3 md:p-6 max-w-7xl mx-auto relative">
      {/* 添加P5背景，只有當showEffects為true時才顯示 */}
      {showEffects && <P5Background className="" />}
      
      <div className="bg-white/70 backdrop-blur-sm rounded-lg shadow-lg relative">
        <div className="border-b p-4 md:p-6 flex flex-wrap items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold">房地產估價地圖</h2>
          
          <div className="flex space-x-2">
            {/* 特效切換按鈕 */}
            <button 
              className={`px-3 py-2 ${showEffects ? 'bg-purple-500' : 'bg-gray-400'} text-white rounded-md flex items-center gap-2`}
              onClick={() => setShowEffects(!showEffects)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zm7-10a1 1 0 01.707.293l.707.707.707-.707A1 1 0 0115 2a1 1 0 011 1v1h1a1 1 0 110 2h-1v1a1 1 0 01-1 1 1 1 0 01-.707-.293l-.707-.707-.707.707A1 1 0 0112 8a1 1 0 01-1-1V6h-1a1 1 0 110-2h1V3a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              視覺特效
            </button>
            
            {/* 上傳 CSV 按鈕 */}
            <button 
              className="px-3 py-2 bg-green-500 text-white rounded-md flex items-center gap-2"
              onClick={() => setIsUploadModalOpen(!isUploadModalOpen)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              上傳 CSV
            </button>
            
            {/* 移動端篩選器按鈕 */}
            <button 
              className="md:hidden px-3 py-2 bg-blue-500 text-white rounded-md flex items-center gap-2"
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              篩選條件
            </button>
          </div>
        </div>

        {/* CSV 上傳模態框 */}
        {isUploadModalOpen && (
          <div className="border-b p-4 md:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">上傳 CSV 數據</h3>
              <button 
                onClick={() => setIsUploadModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <CsvUploader onDataLoaded={handleCsvDataLoaded} />
            
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                {uploadedData.length > 0 && (
                  <span>已上傳 {uploadedData.length} 筆數據</span>
                )}
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => setDataSource('sample')}
                  className={`px-3 py-1 rounded text-sm ${dataSource === 'sample' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                  使用樣本數據
                </button>
                <button
                  onClick={() => setDataSource('uploaded')}
                  className={`px-3 py-1 rounded text-sm ${dataSource === 'uploaded' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                  disabled={uploadedData.length === 0}
                >
                  使用上傳數據
                </button>
              </div>
            </div>
          </div>
        )}

        <div className={cn(
          "transition-all duration-300 overflow-hidden md:h-auto border-b",
          isMobileFilterOpen ? "max-h-[500px]" : "max-h-0 md:max-h-[500px]"
        )}>
          <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 時間範圍選擇 */}
            <div>
              <label className="block text-sm font-medium mb-2">時間範圍:</label>
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="w-full p-2 border rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">全部時間</option>
                <option value="1month">最近一個月</option>
                <option value="3months">最近三個月</option>
                <option value="6months">最近半年</option>
              </select>
            </div>

            {/* 價格範圍滑塊 */}
            <div>
              <label className="block text-sm font-medium mb-2">價格範圍:</label>
              <RangeSlider
                value={priceRange}
                onChange={setPriceRange}
                min={0}
                max={100000000}
                step={1000000}
                formatValue={formatPrice}
                unit=" 元"
                allowNoLimit={true}
              />
            </div>

            {/* 誤差範圍滑塊 */}
            <div>
              <label className="block text-sm font-medium mb-2">誤差範圍:</label>
              <RangeSlider
                value={errorRange}
                onChange={setErrorRange}
                min={0}
                max={20}
                step={1}
                unit="%"
                allowNoLimit={true}
              />
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6">
          {/* 地圖控制項 */}
          <div className="mb-4 flex justify-end space-x-2">
            <button
              onClick={() => setMapView('map')}
              className={`px-3 py-1 rounded ${mapView === 'map' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              標準地圖
            </button>
            <button
              onClick={() => setMapView('satellite')}
              className={`px-3 py-1 rounded ${mapView === 'satellite' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
            >
              衛星影像
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            <div className="lg:col-span-3">
              {/* 地圖容器 */}
              <div className="h-[400px] md:h-[600px] rounded border relative">
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-70 z-10">
                    <div className="text-center">
                      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
                      <p className="mt-2 text-gray-600">處理數據中...</p>
                    </div>
                  </div>
                )}
                <Map data={data || []} mapType={mapView} />
              </div>
              
              {/* 數據狀態提示 */}
              <div className="mt-2 text-sm text-gray-500">
                {loading ? '載入中...' : `顯示 ${data.length} 個數據點`}
                {data.length === 0 && !loading ? ' (沒有符合條件的數據)' : ''}
                {dataSource === 'uploaded' && uploadedData.length > 0 ? ' (使用上傳數據)' : ''}
                {dataSource === 'sample' ? ' (使用樣本數據)' : ''}
              </div>
            </div>

            <div className="lg:col-span-1 space-y-4">
              {/* 統計資訊 */}
              <div className="p-4 border rounded">
                <h3 className="text-lg font-medium mb-4">統計資訊</h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-gray-600">平均誤差:</span>
                    <span className="ml-2 font-bold">{stats.avgError}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600">資料點數:</span>
                    <span className="ml-2 font-bold">{stats.count}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">最低價格:</span>
                    <span className="ml-2 font-bold">{stats.minPrice} 元</span>
                  </div>
                  <div>
                    <span className="text-gray-600">最高價格:</span>
                    <span className="ml-2 font-bold">{stats.maxPrice} 元</span>
                  </div>
                  <div>
                    <span className="text-gray-600">平均價格:</span>
                    <span className="ml-2 font-bold">{stats.avgPrice} 元</span>
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

              {/* 操作說明 */}
              <div className="p-4 border rounded">
                <h3 className="text-lg font-medium mb-4">操作說明</h3>
                <ul className="space-y-2 text-sm">
                  <li>• 點擊標記點查看詳細資訊</li>
                  <li>• 滾輪縮放地圖</li>
                  <li>• 拖曳移動地圖位置</li>
                  <li>• 使用篩選條件精確查詢</li>
                  <li>• 拖動滑塊兩端調整數值範圍</li>
                  <li>• 可以開啟/關閉視覺特效</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}