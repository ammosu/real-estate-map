// components/RealEstateMap.js
import React, { useState } from 'react';
import dynamic from 'next/dynamic';

// 自定義 hooks
import useTimeManagement from '../hooks/useTimeManagement';
import useDataManagement from '../hooks/useDataManagement';
import useStats from '../hooks/useStats';

// 子組件
import FilterPanel from './map/FilterPanel';
import MapView from './map/MapView';
import StatsPanel from './map/StatsPanel';
import LegendPanel from './map/LegendPanel';
import InstructionsPanel from './map/InstructionsPanel';
import CsvUploadModal from './map/CsvUploadModal';

// 動態匯入P5背景元件
const P5Background = dynamic(() => import('./P5Background'), { ssr: false });

export default function RealEstateMap() {
  // 使用自定義 hooks
  const { currentTime, timeRange, setTimeRange, formatDate } = useTimeManagement();
  const [priceRange, setPriceRange] = useState([0, 50000000]);
  const [errorRange, setErrorRange] = useState([0, 20]);
  const [mapView, setMapView] = useState('map'); // 'map' or 'satellite'
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [showEffects, setShowEffects] = useState(true); // 控制特效的顯示

  // 數據管理 hook
  const {
    data,
    loading,
    dataSource,
    setDataSource,
    isUploadModalOpen,
    setIsUploadModalOpen,
    uploadedData,
    handleCsvDataLoaded,
    formatPrice
  } = useDataManagement(timeRange, priceRange, errorRange);

  // 統計數據 hook
  const stats = useStats(data);

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
        <CsvUploadModal
          isUploadModalOpen={isUploadModalOpen}
          setIsUploadModalOpen={setIsUploadModalOpen}
          uploadedData={uploadedData}
          dataSource={dataSource}
          setDataSource={setDataSource}
          handleCsvDataLoaded={handleCsvDataLoaded}
        />

        {/* 篩選條件面板 */}
        <FilterPanel
          isMobileFilterOpen={isMobileFilterOpen}
          timeRange={timeRange}
          setTimeRange={setTimeRange}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          errorRange={errorRange}
          setErrorRange={setErrorRange}
          formatDate={formatDate}
          formatPrice={formatPrice}
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            {/* 地圖視圖 */}
            <MapView
              mapView={mapView}
              setMapView={setMapView}
              data={data}
              loading={loading}
              dataSource={dataSource}
              uploadedData={uploadedData}
              currentTime={currentTime}
            />
          </div>

          <div className="lg:col-span-1 space-y-6">
            {/* 統計信息面板 */}
            <StatsPanel stats={stats} />
            
            {/* 圖例說明面板 */}
            <LegendPanel />
            
            {/* 操作說明面板 */}
            <InstructionsPanel />
          </div>
        </div>
      </div>
    </div>
  );
}