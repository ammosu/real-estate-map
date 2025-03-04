// components/CsvUploader.js
import React, { useState, useRef } from 'react';
import { cn } from '@/lib/utils';

export default function CsvUploader({ onDataLoaded, className }) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const [fileName, setFileName] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);

  // 必要欄位檢查
  const requiredFields = ['lat', 'lng', 'actualPrice'];

  const validateCsvData = (data) => {
    if (!Array.isArray(data) || data.length === 0) {
      return { valid: false, message: '無效的 CSV 格式或空檔案' };
    }

    // 檢查第一行（標題）是否包含所有必要欄位
    const headers = Object.keys(data[0]);
    const missingFields = requiredFields.filter(field => !headers.includes(field));

    if (missingFields.length > 0) {
      return { 
        valid: false, 
        message: `缺少必要欄位: ${missingFields.join(', ')}。必要欄位包括: ${requiredFields.join(', ')}` 
      };
    }

    // 檢查數據有效性
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      // 檢查緯度和經度是否為有效數字
      if (isNaN(parseFloat(row.lat)) || isNaN(parseFloat(row.lng))) {
        return { 
          valid: false, 
          message: `第 ${i + 1} 行: 緯度或經度不是有效數字` 
        };
      }
      
      // 檢查價格是否為有效數字
      if (isNaN(parseFloat(row.actualPrice))) {
        return { 
          valid: false, 
          message: `第 ${i + 1} 行: 價格不是有效數字` 
        };
      }
    }

    return { valid: true };
  };

  const processCsvFile = (file) => {
    setIsLoading(true);
    setError(null);

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const csvText = e.target.result;
        const data = parseCsv(csvText);
        
        const validation = validateCsvData(data);
        if (!validation.valid) {
          setError(validation.message);
          setIsLoading(false);
          return;
        }

        // 處理數據，確保所有必要欄位都是正確的數據類型
        const processedData = data.map(row => ({
          lat: parseFloat(row.lat),
          lng: parseFloat(row.lng),
          actualPrice: parseFloat(row.actualPrice),
          // 可選欄位，如果存在則處理
          estimatedPrice: row.estimatedPrice ? parseFloat(row.estimatedPrice) : parseFloat(row.actualPrice),
          error: row.error ? parseFloat(row.error) : 0,
          date: row.date ? new Date(row.date) : new Date()
        }));

        // 將處理後的數據傳遞給父組件
        onDataLoaded(processedData);
        setIsLoading(false);
      } catch (error) {
        console.error('CSV 處理錯誤:', error);
        setError('CSV 檔案處理失敗: ' + error.message);
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      setError('檔案讀取失敗');
      setIsLoading(false);
    };

    reader.readAsText(file);
  };

  // 簡單的 CSV 解析函數
  const parseCsv = (csvText) => {
    // 分割行
    const lines = csvText.split(/\r\n|\n/);
    if (lines.length < 2) throw new Error('CSV 檔案必須至少包含標題行和一行數據');

    // 解析標題
    const headers = lines[0].split(',').map(header => header.trim());

    // 解析數據行
    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // 跳過空行
      
      const values = line.split(',').map(value => value.trim());
      
      // 確保值的數量與標題數量相同
      if (values.length !== headers.length) {
        throw new Error(`第 ${i + 1} 行的欄位數量與標題不符`);
      }
      
      // 創建行對象
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });
      
      data.push(row);
    }

    return data;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    // 檢查檔案類型
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setError('請上傳 CSV 檔案');
      return;
    }

    setFileName(file.name);
    processCsvFile(file);
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-blue-400",
          error ? "border-red-500 bg-red-50" : ""
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".csv"
          onChange={handleFileInputChange}
        />
        
        <div className="flex flex-col items-center justify-center space-y-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          
          {isLoading ? (
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
              <p className="mt-2 text-gray-600">處理中...</p>
            </div>
          ) : fileName ? (
            <div>
              <p className="text-sm font-medium text-gray-700">已選擇檔案: {fileName}</p>
              <p className="text-xs text-gray-500 mt-1">點擊或拖放以更換檔案</p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium text-gray-700">點擊或拖放 CSV 檔案至此處</p>
              <p className="text-xs text-gray-500 mt-1">必要欄位: {requiredFields.join(', ')}</p>
            </div>
          )}
        </div>
      </div>
      
      {error && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
          <p className="font-medium">錯誤:</p>
          <p>{error}</p>
        </div>
      )}
      
      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium text-gray-700">CSV 格式說明:</h3>
          <a 
            href="/sample_data.csv" 
            download
            className="text-sm text-blue-500 hover:text-blue-700 flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            下載範例檔案
          </a>
        </div>
        <div className="bg-gray-50 p-3 rounded text-xs text-gray-600">
          <p className="mb-1">CSV 檔案應包含以下欄位:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>lat</strong> - 緯度 (必要, 數字)</li>
            <li><strong>lng</strong> - 經度 (必要, 數字)</li>
            <li><strong>actualPrice</strong> - 實際價格 (必要, 數字)</li>
            <li><strong>estimatedPrice</strong> - 估計價格 (選填, 數字)</li>
            <li><strong>error</strong> - 誤差百分比 (選填, 數字)</li>
            <li><strong>date</strong> - 日期 (選填, 日期格式)</li>
          </ul>
          <p className="mt-2">範例: lat,lng,actualPrice,estimatedPrice,error,date</p>
          <p>25.0330,121.5654,20000000,21000000,5,2023-01-15</p>
        </div>
      </div>
    </div>
  );
}
