// components/map/MapView.js
import React from 'react';
import dynamic from 'next/dynamic';

// 動態載入地圖元件
const Map = dynamic(() => import('../Map'), {
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

export default function MapView({
  mapView,
  setMapView,
  data,
  loading,
  dataSource,
  uploadedData,
  currentTime,
  onMarkerClick,
  onClusterClick
}) {
  return (
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
        <Map 
          data={data || []} 
          mapType={mapView} 
          onMarkerClick={onMarkerClick}
          onClusterClick={onClusterClick}
        />
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
              {dataSource === 'sample' ? ' (使用範例資料)' : ''}
            </span>
          )}
        </div>
        <div className="text-sm text-gray-500">
          {currentTime && `最後更新: ${currentTime}`}
        </div>
      </div>
    </div>
  );
}
