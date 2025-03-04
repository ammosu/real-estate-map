// components/map/CsvUploadModal.js
import React from 'react';
import CsvUploader from '../CsvUploader';

export default function CsvUploadModal({
  isUploadModalOpen,
  setIsUploadModalOpen,
  uploadedData,
  dataSource,
  setDataSource,
  handleCsvDataLoaded
}) {
  if (!isUploadModalOpen) return null;
  
  return (
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
  );
}