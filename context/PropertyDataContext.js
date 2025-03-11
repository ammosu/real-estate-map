// context/PropertyDataContext.js
import React, { createContext, useContext, useMemo } from 'react';

// 創建上下文
const PropertyDataContext = createContext();

// 自定義 hook 用於訪問上下文
export const usePropertyData = () => {
  const context = useContext(PropertyDataContext);
  if (!context) {
    throw new Error('usePropertyData must be used within a PropertyDataProvider');
  }
  return context;
};

// 提供者組件
export const PropertyDataProvider = ({ children, properties }) => {
  // 按社區分組
  const communitiesData = useMemo(() => {
    if (!Array.isArray(properties) || properties.length === 0) {
      return { communities: [], monthlyData: [] };
    }

    // 按社區分組
    const communityGroups = properties.reduce((acc, property) => {
      if (!property || !property.community) return acc;
      
      const community = property.community;
      if (!acc[community]) {
        acc[community] = [];
      }
      
      acc[community].push(property);
      return acc;
    }, {});

    // 獲取所有社區名稱
    const communities = Object.keys(communityGroups);

    return { communities, communityGroups };
  }, [properties]);

  // 生成月度數據
  const monthlyData = useMemo(() => {
    if (!Array.isArray(properties) || properties.length === 0) {
      return [];
    }

    // 按月份分組
    const monthlyGroups = properties.reduce((acc, property) => {
      if (!property || !property.date) return acc;
      
      try {
        const date = new Date(property.date);
        const year = date.getFullYear();
        const month = date.getMonth() + 1; // getMonth() 返回 0-11
        const yearMonth = `${year}-${month.toString().padStart(2, '0')}`;
        
        if (!acc[yearMonth]) {
          acc[yearMonth] = {
            properties: [],
            totalTradePrice: 0,
            totalEstimatedPrice: 0,
            count: 0,
            errors: []
          };
        }
        
        acc[yearMonth].properties.push(property);
        acc[yearMonth].totalTradePrice += property.actualPrice || 0;
        acc[yearMonth].totalEstimatedPrice += property.estimatedPrice || 0;
        acc[yearMonth].count += 1;
        
        // 計算誤差
        if (property.error !== undefined) {
          acc[yearMonth].errors.push(property.error);
        }
      } catch (error) {
        console.error('日期處理錯誤:', error);
      }
      
      return acc;
    }, {});

    // 轉換為數組並計算平均值和誤差指標
    const result = Object.keys(monthlyGroups)
      .sort() // 按時間順序排序
      .map(yearMonth => {
        const group = monthlyGroups[yearMonth];
        const avgTradePrice = group.count > 0 ? group.totalTradePrice / group.count : 0;
        const avgEstimatedPrice = group.count > 0 ? group.totalEstimatedPrice / group.count : 0;
        
        // 計算誤差指標
        let mape = 0; // 平均絕對百分比誤差
        let mpe = 0;  // 平均百分比誤差
        
        if (group.errors.length > 0) {
          mape = group.errors.reduce((sum, error) => sum + Math.abs(error), 0) / group.errors.length;
          mpe = group.errors.reduce((sum, error) => sum + error, 0) / group.errors.length;
        }
        
        return {
          yearMonth,
          avgTradePrice,
          avgEstimatedPrice,
          count: group.count,
          mape,
          mpe
        };
      });

    return result;
  }, [properties]);

  // 按社區生成月度數據
  const communityMonthlyData = useMemo(() => {
    if (!communitiesData.communities || communitiesData.communities.length === 0) {
      return {};
    }

    const result = {};

    // 為每個社區生成月度數據
    communitiesData.communities.forEach(community => {
      const communityProperties = communitiesData.communityGroups[community];
      
      // 按月份分組
      const monthlyGroups = communityProperties.reduce((acc, property) => {
        if (!property || !property.date) return acc;
        
        try {
          const date = new Date(property.date);
          const year = date.getFullYear();
          const month = date.getMonth() + 1; // getMonth() 返回 0-11
          const yearMonth = `${year}-${month.toString().padStart(2, '0')}`;
          
          if (!acc[yearMonth]) {
            acc[yearMonth] = {
              properties: [],
              totalTradePrice: 0,
              totalEstimatedPrice: 0,
              count: 0,
              errors: []
            };
          }
          
          acc[yearMonth].properties.push(property);
          acc[yearMonth].totalTradePrice += property.actualPrice || 0;
          acc[yearMonth].totalEstimatedPrice += property.estimatedPrice || 0;
          acc[yearMonth].count += 1;
          
          // 計算誤差
          if (property.error !== undefined) {
            acc[yearMonth].errors.push(property.error);
          }
        } catch (error) {
          console.error('日期處理錯誤:', error);
        }
        
        return acc;
      }, {});

      // 轉換為數組並計算平均值和誤差指標
      result[community] = Object.keys(monthlyGroups)
        .sort() // 按時間順序排序
        .map(yearMonth => {
          const group = monthlyGroups[yearMonth];
          const avgTradePrice = group.count > 0 ? group.totalTradePrice / group.count : 0;
          const avgEstimatedPrice = group.count > 0 ? group.totalEstimatedPrice / group.count : 0;
          
          // 計算誤差指標
          let mape = 0; // 平均絕對百分比誤差
          let mpe = 0;  // 平均百分比誤差
          
          if (group.errors.length > 0) {
            mape = group.errors.reduce((sum, error) => sum + Math.abs(error), 0) / group.errors.length;
            mpe = group.errors.reduce((sum, error) => sum + error, 0) / group.errors.length;
          }
          
          return {
            yearMonth,
            avgTradePrice,
            avgEstimatedPrice,
            count: group.count,
            mape,
            mpe
          };
        });
    });

    return result;
  }, [communitiesData]);

  // 提供上下文值
  const value = {
    properties,
    monthlyData,
    communities: communitiesData.communities,
    communityMonthlyData
  };

  return (
    <PropertyDataContext.Provider value={value}>
      {children}
    </PropertyDataContext.Provider>
  );
};