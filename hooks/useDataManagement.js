// hooks/useDataManagement.js
import { useState, useEffect } from 'react';
import { generateSampleData } from '../components/sampleData';

export default function useDataManagement(timeRange, priceRange, errorRange, textFilter) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState('sample'); // 'sample' or 'uploaded'
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  
  // 生成並儲存樣本資料（只在元件首次載入時生成一次）
  const [sampleData, setSampleData] = useState([]);
  // 儲存上傳的 CSV 資料
  const [uploadedData, setUploadedData] = useState([]);

  // 生成樣本資料
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
    // 確保有資料可以過濾
    const sourceData = dataSource === 'sample' ? sampleData : uploadedData;
    if (sourceData.length === 0) return;
    
    setLoading(true);
    console.log("開始過濾資料");
    
    // 使用 setTimeout 確保清理能正常運作
    const timerId = setTimeout(() => {
      try {
        const filteredData = filterData(sourceData) || [];
        console.log("過濾後資料:", filteredData.length, "個點");
        setData(filteredData);
      } catch (error) {
        console.error("資料處理錯誤:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    }, 100);
    
    // 清理函數
    return () => {
      clearTimeout(timerId);
    };
  }, [sampleData, uploadedData, dataSource, timeRange, priceRange, errorRange, textFilter]);

  // 定義常數
  const PRICE_MAX_LIMIT = 2000000; // 價格上限值
  const ERROR_MIN_LIMIT = -30;     // 誤差下限值
  const ERROR_MAX_LIMIT = 30;      // 誤差上限值

  // 判斷是否為不限上限
  const isNoUpperLimit = (value, maxLimit) => value >= maxLimit;
  
  // 判斷是否為不限下限
  const isNoLowerLimit = (value, minLimit) => value <= minLimit;

  // 安全的過濾函數
  const filterData = (data) => {
    if (!Array.isArray(data)) return [];
    
    // 如果沒有設置過濾條件，直接返回所有數據
    if (!timeRange || !priceRange || !errorRange) {
      console.log("沒有設置過濾條件，返回所有數據");
      return data;
    }
    
    // 添加調試信息
    console.log("過濾條件:", {
      timeRange,
      priceRange,
      errorRange,
      textFilter
    });
    
    return data.filter(item => {
      // 確保資料存在
      if (!item) return false;
      
      // 調試單個項目
      const debug = {};
      
      // 時間過濾
      if (Array.isArray(timeRange) && timeRange.length === 2) {
        try {
          const itemDate = new Date(item.date).getTime();
          debug.date = new Date(item.date).toISOString();
          debug.timeRange = [new Date(timeRange[0]).toISOString(), new Date(timeRange[1]).toISOString()];
          
          // 檢查最小值
          if (itemDate < timeRange[0]) {
            return false;
          }
          
          // 檢查最大值
          if (itemDate > timeRange[1]) {
            return false;
          }
        } catch (e) {
          console.warn("日期解析錯誤", e, item);
          return false;
        }
      }
      
      // 價格範圍過濾
      if (Array.isArray(priceRange) && priceRange.length === 2) {
        debug.price = item.actualPrice;
        debug.priceRange = priceRange;
        
        // 檢查最小值
        if (item.actualPrice < priceRange[0]) {
          return false;
        }
        
        // 檢查最大值 (使用明確的函數判斷是否為不限上限)
        if (!isNoUpperLimit(priceRange[1], PRICE_MAX_LIMIT) && item.actualPrice > priceRange[1]) {
          return false;
        }
      }
      
      // 誤差範圍過濾
      if (Array.isArray(errorRange) && errorRange.length === 2) {
        debug.error = item.error;
        debug.errorRange = errorRange;
        
        // 直接使用誤差值進行過濾，不使用絕對值，以區分正負誤差
        const itemError = item.error;
        
        // 檢查最小值 (使用明確的函數判斷是否為不限下限)
        if (!isNoLowerLimit(errorRange[0], ERROR_MIN_LIMIT) && itemError < errorRange[0]) {
          return false;
        }
        
        // 檢查最大值 (使用明確的函數判斷是否為不限上限)
        if (!isNoUpperLimit(errorRange[1], ERROR_MAX_LIMIT) && itemError > errorRange[1]) {
          return false;
        }
      }
      
      // 文字篩選
      if (textFilter && textFilter.trim() !== '') {
        const searchText = textFilter.trim().toLowerCase();
        const district = (item.district || '').toLowerCase();
        const address = (item.address || '').toLowerCase();
        const community = (item.community || '').toLowerCase();
        
        // 檢查行政區、地址和社區名稱是否包含搜尋文字
        const matchesText = 
          district.includes(searchText) || 
          address.includes(searchText) || 
          community.includes(searchText);
        
        if (!matchesText) {
          return false;
        }
      }
      
      return true;
    });
  };

  // 格式化價格顯示
  const formatPrice = (value) => {
    return value.toLocaleString('zh-TW');
  };

  return {
    data,
    loading,
    dataSource,
    setDataSource,
    isUploadModalOpen,
    setIsUploadModalOpen,
    uploadedData,
    handleCsvDataLoaded,
    formatPrice
  };
}
