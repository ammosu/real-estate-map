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
            totalEstimatedPriceWithCommunity: 0,
            totalEstimatedPriceWithCommunityAndTime: 0,
            count: 0,
            errors: [],
            errorsWithCommunity: [],
            errorsWithCommunityAndTime: []
          };
        }
        
        acc[yearMonth].properties.push(property);
        acc[yearMonth].totalTradePrice += property.actualPrice || 0;
        acc[yearMonth].totalEstimatedPrice += property.estimatedPrice || 0;
        acc[yearMonth].totalEstimatedPriceWithCommunity += property.estimatedPriceWithCommunity || 0;
        acc[yearMonth].totalEstimatedPriceWithCommunityAndTime += property.estimatedPriceWithCommunityAndTime || 0;
        acc[yearMonth].count += 1;
        
        // 計算誤差
        if (property.error !== undefined) {
          acc[yearMonth].errors.push(property.error);
        }
        if (property.errorWithCommunity !== undefined) {
          acc[yearMonth].errorsWithCommunity.push(property.errorWithCommunity);
        }
        if (property.errorWithCommunityAndTime !== undefined) {
          acc[yearMonth].errorsWithCommunityAndTime.push(property.errorWithCommunityAndTime);
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
        const avgEstimatedPriceWithCommunity = group.count > 0 ? group.totalEstimatedPriceWithCommunity / group.count : 0;
        const avgEstimatedPriceWithCommunityAndTime = group.count > 0 ? group.totalEstimatedPriceWithCommunityAndTime / group.count : 0;
        
        // 計算誤差指標
        let mape = 0; // 平均絕對百分比誤差
        let mpe = 0;  // 平均百分比誤差
        let mapeWithCommunity = 0;
        let mpeWithCommunity = 0;
        let mapeWithCommunityAndTime = 0;
        let mpeWithCommunityAndTime = 0;
        
        if (group.errors.length > 0) {
          mape = group.errors.reduce((sum, error) => sum + Math.abs(error), 0) / group.errors.length;
          mpe = group.errors.reduce((sum, error) => sum + error, 0) / group.errors.length;
        }
        
        if (group.errorsWithCommunity.length > 0) {
          mapeWithCommunity = group.errorsWithCommunity.reduce((sum, error) => sum + Math.abs(error), 0) / group.errorsWithCommunity.length;
          mpeWithCommunity = group.errorsWithCommunity.reduce((sum, error) => sum + error, 0) / group.errorsWithCommunity.length;
        }
        
        if (group.errorsWithCommunityAndTime.length > 0) {
          mapeWithCommunityAndTime = group.errorsWithCommunityAndTime.reduce((sum, error) => sum + Math.abs(error), 0) / group.errorsWithCommunityAndTime.length;
          mpeWithCommunityAndTime = group.errorsWithCommunityAndTime.reduce((sum, error) => sum + error, 0) / group.errorsWithCommunityAndTime.length;
        }
        
        return {
          yearMonth,
          avgTradePrice,
          avgEstimatedPrice,
          avgEstimatedPriceWithCommunity,
          avgEstimatedPriceWithCommunityAndTime,
          count: group.count,
          mape,
          mpe,
          mapeWithCommunity,
          mpeWithCommunity,
          mapeWithCommunityAndTime,
          mpeWithCommunityAndTime
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
              totalEstimatedPriceWithCommunity: 0,
              totalEstimatedPriceWithCommunityAndTime: 0,
              count: 0,
              errors: [],
              errorsWithCommunity: [],
              errorsWithCommunityAndTime: []
            };
          }
          
          acc[yearMonth].properties.push(property);
          acc[yearMonth].totalTradePrice += property.actualPrice || 0;
          acc[yearMonth].totalEstimatedPrice += property.estimatedPrice || 0;
          acc[yearMonth].totalEstimatedPriceWithCommunity += property.estimatedPriceWithCommunity || 0;
          acc[yearMonth].totalEstimatedPriceWithCommunityAndTime += property.estimatedPriceWithCommunityAndTime || 0;
          acc[yearMonth].count += 1;
          
          // 計算誤差
          if (property.error !== undefined) {
            acc[yearMonth].errors.push(property.error);
          }
          if (property.errorWithCommunity !== undefined) {
            acc[yearMonth].errorsWithCommunity.push(property.errorWithCommunity);
          }
          if (property.errorWithCommunityAndTime !== undefined) {
            acc[yearMonth].errorsWithCommunityAndTime.push(property.errorWithCommunityAndTime);
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
          const avgEstimatedPriceWithCommunity = group.count > 0 ? group.totalEstimatedPriceWithCommunity / group.count : 0;
          const avgEstimatedPriceWithCommunityAndTime = group.count > 0 ? group.totalEstimatedPriceWithCommunityAndTime / group.count : 0;
          
          // 計算誤差指標
          let mape = 0; // 平均絕對百分比誤差
          let mpe = 0;  // 平均百分比誤差
          let mapeWithCommunity = 0;
          let mpeWithCommunity = 0;
          let mapeWithCommunityAndTime = 0;
          let mpeWithCommunityAndTime = 0;
          
          if (group.errors.length > 0) {
            mape = group.errors.reduce((sum, error) => sum + Math.abs(error), 0) / group.errors.length;
            mpe = group.errors.reduce((sum, error) => sum + error, 0) / group.errors.length;
          }
          
          if (group.errorsWithCommunity.length > 0) {
            mapeWithCommunity = group.errorsWithCommunity.reduce((sum, error) => sum + Math.abs(error), 0) / group.errorsWithCommunity.length;
            mpeWithCommunity = group.errorsWithCommunity.reduce((sum, error) => sum + error, 0) / group.errorsWithCommunity.length;
          }
          
          if (group.errorsWithCommunityAndTime.length > 0) {
            mapeWithCommunityAndTime = group.errorsWithCommunityAndTime.reduce((sum, error) => sum + Math.abs(error), 0) / group.errorsWithCommunityAndTime.length;
            mpeWithCommunityAndTime = group.errorsWithCommunityAndTime.reduce((sum, error) => sum + error, 0) / group.errorsWithCommunityAndTime.length;
          }
          
          return {
            yearMonth,
            avgTradePrice,
            avgEstimatedPrice,
            avgEstimatedPriceWithCommunity,
            avgEstimatedPriceWithCommunityAndTime,
            count: group.count,
            mape,
            mpe,
            mapeWithCommunity,
            mpeWithCommunity,
            mapeWithCommunityAndTime,
            mpeWithCommunityAndTime
          };
        });
    });

    return result;
  }, [communitiesData]);

  // 生成散點圖數據
  const scatterData = useMemo(() => {
    if (!Array.isArray(properties) || properties.length === 0) {
      return [];
    }
    
    return properties.map(property => ({
      estimatedPrice: property.estimatedPrice || 0,
      tradePrice: property.actualPrice || 0,
      address: property.address || '地址未知',
      floor: property.floor || 0,
      area: property.size || 0,
      date: property.date ? new Date(property.date).toLocaleDateString('zh-TW') : '未知',
      community: property.community || '未知'
    }));
  }, [properties]);

  // 按樓層分組的資料
  const floorData = useMemo(() => {
    if (!Array.isArray(properties) || properties.length === 0) {
      return [];
    }

    // 將樓層分組（例如：1-5樓、6-10樓等）
    const floorGroups = {};
    
    properties.forEach(property => {
      if (!property || !property.floor) return;
      
      // 將樓層分成適當的區間
      const floor = property.floor;
      const floorGroup = Math.floor((floor - 1) / 5) * 5 + 1;
      const floorGroupKey = `${floorGroup}-${floorGroup + 4}樓`;
      
      if (!floorGroups[floorGroupKey]) {
        floorGroups[floorGroupKey] = {
          properties: [],
          totalTradePrice: 0,
          totalEstimatedPrice: 0,
          count: 0
        };
      }
      
      floorGroups[floorGroupKey].properties.push(property);
      floorGroups[floorGroupKey].totalTradePrice += property.actualPrice || 0;
      floorGroups[floorGroupKey].totalEstimatedPrice += property.estimatedPrice || 0;
      floorGroups[floorGroupKey].count += 1;
    });
    
    // 轉換為數組並計算平均值
    return Object.keys(floorGroups)
      .sort((a, b) => {
        // 按樓層區間排序
        const aStart = parseInt(a.split('-')[0]);
        const bStart = parseInt(b.split('-')[0]);
        return aStart - bStart;
      })
      .map(floorGroupKey => {
        const group = floorGroups[floorGroupKey];
        return {
          floorGroup: floorGroupKey,
          avgTradePrice: group.count > 0 ? group.totalTradePrice / group.count : 0,
          avgEstimatedPrice: group.count > 0 ? group.totalEstimatedPrice / group.count : 0,
          count: group.count
        };
      });
  }, [properties]);

  // 按社區分組的樓層資料
  const communityFloorData = useMemo(() => {
    if (!communitiesData.communities || communitiesData.communities.length === 0) {
      return {};
    }

    const result = {};

    // 為每個社區生成樓層資料
    communitiesData.communities.forEach(community => {
      const communityProperties = communitiesData.communityGroups[community];
      
      // 將樓層分組
      const floorGroups = {};
      
      communityProperties.forEach(property => {
        if (!property || !property.floor) return;
        
        const floor = property.floor;
        const floorGroup = Math.floor((floor - 1) / 5) * 5 + 1;
        const floorGroupKey = `${floorGroup}-${floorGroup + 4}樓`;
        
        if (!floorGroups[floorGroupKey]) {
          floorGroups[floorGroupKey] = {
            properties: [],
            totalTradePrice: 0,
            totalEstimatedPrice: 0,
            count: 0
          };
        }
        
        floorGroups[floorGroupKey].properties.push(property);
        floorGroups[floorGroupKey].totalTradePrice += property.actualPrice || 0;
        floorGroups[floorGroupKey].totalEstimatedPrice += property.estimatedPrice || 0;
        floorGroups[floorGroupKey].count += 1;
      });
      
      // 轉換為數組並計算平均值
      result[community] = Object.keys(floorGroups)
        .sort((a, b) => {
          const aStart = parseInt(a.split('-')[0]);
          const bStart = parseInt(b.split('-')[0]);
          return aStart - bStart;
        })
        .map(floorGroupKey => {
          const group = floorGroups[floorGroupKey];
          return {
            floorGroup: floorGroupKey,
            avgTradePrice: group.count > 0 ? group.totalTradePrice / group.count : 0,
            avgEstimatedPrice: group.count > 0 ? group.totalEstimatedPrice / group.count : 0,
            count: group.count
          };
        });
    });

    return result;
  }, [communitiesData]);

  // 按坪數分組的資料
  const sizeData = useMemo(() => {
    if (!Array.isArray(properties) || properties.length === 0) {
      return [];
    }

    // 將坪數分組（例如：20-30坪、30-40坪等）
    const sizeGroups = {};
    
    properties.forEach(property => {
      if (!property || !property.size) return;
      
      // 將坪數分成適當的區間
      const size = property.size;
      const sizeGroup = Math.floor(size / 10) * 10;
      const sizeGroupKey = `${sizeGroup}-${sizeGroup + 10}坪`;
      
      if (!sizeGroups[sizeGroupKey]) {
        sizeGroups[sizeGroupKey] = {
          properties: [],
          totalTradePrice: 0,
          totalEstimatedPrice: 0,
          count: 0
        };
      }
      
      sizeGroups[sizeGroupKey].properties.push(property);
      sizeGroups[sizeGroupKey].totalTradePrice += property.actualPrice || 0;
      sizeGroups[sizeGroupKey].totalEstimatedPrice += property.estimatedPrice || 0;
      sizeGroups[sizeGroupKey].count += 1;
    });
    
    // 轉換為數組並計算平均值
    return Object.keys(sizeGroups)
      .sort((a, b) => {
        // 按坪數區間排序
        const aStart = parseInt(a.split('-')[0]);
        const bStart = parseInt(b.split('-')[0]);
        return aStart - bStart;
      })
      .map(sizeGroupKey => {
        const group = sizeGroups[sizeGroupKey];
        return {
          sizeGroup: sizeGroupKey,
          avgTradePrice: group.count > 0 ? group.totalTradePrice / group.count : 0,
          avgEstimatedPrice: group.count > 0 ? group.totalEstimatedPrice / group.count : 0,
          count: group.count
        };
      });
  }, [properties]);

  // 按社區分組的坪數資料
  const communitySizeData = useMemo(() => {
    if (!communitiesData.communities || communitiesData.communities.length === 0) {
      return {};
    }

    const result = {};

    // 為每個社區生成坪數資料
    communitiesData.communities.forEach(community => {
      const communityProperties = communitiesData.communityGroups[community];
      
      // 將坪數分組
      const sizeGroups = {};
      
      communityProperties.forEach(property => {
        if (!property || !property.size) return;
        
        const size = property.size;
        const sizeGroup = Math.floor(size / 10) * 10;
        const sizeGroupKey = `${sizeGroup}-${sizeGroup + 10}坪`;
        
        if (!sizeGroups[sizeGroupKey]) {
          sizeGroups[sizeGroupKey] = {
            properties: [],
            totalTradePrice: 0,
            totalEstimatedPrice: 0,
            count: 0
          };
        }
        
        sizeGroups[sizeGroupKey].properties.push(property);
        sizeGroups[sizeGroupKey].totalTradePrice += property.actualPrice || 0;
        sizeGroups[sizeGroupKey].totalEstimatedPrice += property.estimatedPrice || 0;
        sizeGroups[sizeGroupKey].count += 1;
      });
      
      // 轉換為數組並計算平均值
      result[community] = Object.keys(sizeGroups)
        .sort((a, b) => {
          const aStart = parseInt(a.split('-')[0]);
          const bStart = parseInt(b.split('-')[0]);
          return aStart - bStart;
        })
        .map(sizeGroupKey => {
          const group = sizeGroups[sizeGroupKey];
          return {
            sizeGroup: sizeGroupKey,
            avgTradePrice: group.count > 0 ? group.totalTradePrice / group.count : 0,
            avgEstimatedPrice: group.count > 0 ? group.totalEstimatedPrice / group.count : 0,
            count: group.count
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
    communityMonthlyData,
    scatterData,
    floorData,
    communityFloorData,
    sizeData,
    communitySizeData
  };

  return (
    <PropertyDataContext.Provider value={value}>
      {children}
    </PropertyDataContext.Provider>
  );
};
