// components/Map.js
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet/dist/leaflet.css';

// 修正 Leaflet 的圖標問題
if (typeof window !== 'undefined') {
  delete L.Icon.Default.prototype._getIconUrl;
  
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
}

const createCustomIcon = (error) => {
  // 防禦性編程
  if (error === undefined || error === null) {
    error = 0;
  }
  
  let color, borderColor, textColor, innerColor;
  const absError = Math.abs(error);
  
  // 根據誤差的正負和大小決定顏色
  if (error >= 0) {
    // 正誤差（高估）- 紅色系
    textColor = error >= 10 ? 'white' : '#B91C1C';
    if (absError <= 5) {
      color = '#FEE2E2'; // 非常淺紅背景
      innerColor = '#FECACA'; // 淺紅內圈
      borderColor = '#F87171'; // 中紅邊框
    } else if (absError <= 10) {
      color = '#FECACA'; // 淺紅背景
      innerColor = '#F87171'; // 中紅內圈
      borderColor = '#EF4444'; // 深紅邊框
    } else if (absError <= 15) {
      color = '#F87171'; // 中紅背景
      innerColor = '#EF4444'; // 深紅內圈
      borderColor = '#DC2626'; // 更深紅邊框
    } else {
      color = '#EF4444'; // 深紅背景
      innerColor = '#DC2626'; // 更深紅內圈
      borderColor = '#B91C1C'; // 極深紅邊框
    }
  } else {
    // 負誤差（低估）- 藍色系
    textColor = error <= -10 ? 'white' : '#1E40AF';
    if (absError <= 5) {
      color = '#EFF6FF'; // 非常淺藍背景
      innerColor = '#BFDBFE'; // 淺藍內圈
      borderColor = '#60A5FA'; // 中藍邊框
    } else if (absError <= 10) {
      color = '#BFDBFE'; // 淺藍背景
      innerColor = '#60A5FA'; // 中藍內圈
      borderColor = '#3B82F6'; // 深藍邊框
    } else if (absError <= 15) {
      color = '#60A5FA'; // 中藍背景
      innerColor = '#3B82F6'; // 深藍內圈
      borderColor = '#2563EB'; // 更深藍邊框
    } else {
      color = '#3B82F6'; // 深藍背景
      innerColor = '#2563EB'; // 更深藍內圈
      borderColor = '#1D4ED8'; // 極深藍邊框
    }
  }

  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="
        background-color: ${color};
        width: 44px;
        height: 44px;
        border-radius: 50%;
        border: 2px solid ${borderColor};
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      " onmouseover="this.style.transform='scale(1.1)';this.style.boxShadow='0 4px 12px rgba(0,0,0,0.3)';" 
        onmouseout="this.style.transform='scale(1)';this.style.boxShadow='0 2px 8px rgba(0,0,0,0.2)';">
        <div style="
          background-color: ${innerColor};
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${textColor};
          font-weight: bold;
          font-size: 13px;
        ">${error.toFixed(1)}%</div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    popupAnchor: [0, -22]
  });
};

export default function Map({ data = [], mapType = 'map', onMarkerClick, onClusterClick, isLoading = false }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerClusterRef = useRef(null);
  const currentViewRef = useRef(null);
  const [mapStatus, setMapStatus] = useState({ isInitialized: false, isEmpty: data.length === 0 });

  // 存儲當前圖層的引用
  const tileLayerRef = useRef(null);

  useEffect(() => {
    // 只在客戶端渲染
    if (typeof window === 'undefined') return;
    
    // 確保 mapRef 存在
    if (!mapRef.current) return;
    
    // 初始化地圖
    if (!mapInstanceRef.current) {
      try {
        // 初始化地圖，添加 maxZoom 設置
        mapInstanceRef.current = L.map(mapRef.current, {
          maxZoom: 18,
          minZoom: 5
        }).setView([23.5, 121], 7);
        
        // 初始圖層將在 mapType useEffect 中添加

        // 初始化標記群集
        markerClusterRef.current = L.markerClusterGroup({
          iconCreateFunction: function(cluster) {
            const childMarkers = cluster.getAllChildMarkers();
            // 確保有標記
            if (!childMarkers || !childMarkers.length) {
              return L.divIcon({ 
                html: '<div>0</div>', 
                className: 'custom-cluster-icon',
                iconSize: [30, 30]
              });
            }
            
            // 計算平均誤差
            let totalError = 0;
            let validMarkers = 0;
            
            childMarkers.forEach(marker => {
              if (marker.options && typeof marker.options.error === 'number') {
                totalError += marker.options.error;
                validMarkers++;
              }
            });
            
            const avgError = validMarkers > 0 ? totalError / validMarkers : 0;
            const absAvgError = Math.abs(avgError);

            let color, borderColor, textColor, innerColor;
            // 根據平均誤差的正負和大小決定顏色
            if (avgError >= 0) {
              // 正誤差（高估）- 紅色系
              textColor = avgError >= 10 ? 'white' : '#B91C1C';
              if (absAvgError <= 5) {
                color = '#FEE2E2'; // 非常淺紅背景
                innerColor = '#FECACA'; // 淺紅內圈
                borderColor = '#F87171'; // 中紅邊框
              } else if (absAvgError <= 10) {
                color = '#FECACA'; // 淺紅背景
                innerColor = '#F87171'; // 中紅內圈
                borderColor = '#EF4444'; // 深紅邊框
              } else if (absAvgError <= 15) {
                color = '#F87171'; // 中紅背景
                innerColor = '#EF4444'; // 深紅內圈
                borderColor = '#DC2626'; // 更深紅邊框
              } else {
                color = '#EF4444'; // 深紅背景
                innerColor = '#DC2626'; // 更深紅內圈
                borderColor = '#B91C1C'; // 極深紅邊框
              }
            } else {
              // 負誤差（低估）- 藍色系
              textColor = avgError <= -10 ? 'white' : '#1E40AF';
              if (absAvgError <= 5) {
                color = '#EFF6FF'; // 非常淺藍背景
                innerColor = '#BFDBFE'; // 淺藍內圈
                borderColor = '#60A5FA'; // 中藍邊框
              } else if (absAvgError <= 10) {
                color = '#BFDBFE'; // 淺藍背景
                innerColor = '#60A5FA'; // 中藍內圈
                borderColor = '#3B82F6'; // 深藍邊框
              } else if (absAvgError <= 15) {
                color = '#60A5FA'; // 中藍背景
                innerColor = '#3B82F6'; // 深藍內圈
                borderColor = '#2563EB'; // 更深藍邊框
              } else {
                color = '#3B82F6'; // 深藍背景
                innerColor = '#2563EB'; // 更深藍內圈
                borderColor = '#1D4ED8'; // 極深藍邊框
              }
            }

            return L.divIcon({
              html: `
                <div style="
                  background-color: ${color};
                  width: 54px;
                  height: 54px;
                  border-radius: 50%;
                  border: 2px solid ${borderColor};
                  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  transition: transform 0.2s ease, box-shadow 0.2s ease;
                " onmouseover="this.style.transform='scale(1.1)';this.style.boxShadow='0 4px 12px rgba(0,0,0,0.3)';" 
                  onmouseout="this.style.transform='scale(1)';this.style.boxShadow='0 2px 8px rgba(0,0,0,0.2)';">
                  <div style="
                    background-color: ${innerColor};
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    color: ${textColor};
                    font-weight: bold;
                    font-size: 13px;
                    line-height: 1.2;
                  ">
                    <span>${avgError.toFixed(1)}%</span>
                    <span style="font-size: 10px;">(${cluster.getChildCount()})</span>
                  </div>
                </div>
              `,
              className: 'custom-cluster-icon',
              iconSize: [54, 54],
              iconAnchor: [27, 27]
            });
          },
          maxClusterRadius: 80,
          spiderfyOnMaxZoom: true,
          showCoverageOnHover: true,
          zoomToBoundsOnClick: true
        }).addTo(mapInstanceRef.current);

        // 添加聚合點點擊事件
        if (onClusterClick) {
          markerClusterRef.current.on('clusterclick', (e) => {
            // 阻止默認的縮放行為
            e.layer.zoomToBounds = function() {}; // 覆蓋原方法
            
            // 獲取所有子標記的原始數據點
            const childMarkers = e.layer.getAllChildMarkers();
            const points = childMarkers.map(marker => marker.options.originalPoint).filter(Boolean);
            
            // 調用回調函數
            onClusterClick(points);
          });
        }

        // 監聽地圖移動和縮放事件
        mapInstanceRef.current.on('moveend', () => {
          if (mapInstanceRef.current) {
            currentViewRef.current = {
              center: mapInstanceRef.current.getCenter(),
              zoom: mapInstanceRef.current.getZoom()
            };
          }
        });
      } catch (error) {
        console.error("地圖初始化錯誤:", error);
      }
    }

    // 更新標記
    if (Array.isArray(data) && data.length > 0) {
      try {
        updateMarkers(data);
      } catch (error) {
        console.error("更新標記時出錯:", error);
      }
    } else if (markerClusterRef.current) {
      // 清空標記
      markerClusterRef.current.clearLayers();
    }

    // 清理函數
    return () => {
      // 不需要在每次更新時銷毀地圖
    };
  }, [data, mapType, onMarkerClick, onClusterClick]);  // 在 data, mapType 或點擊處理器變化時更新

  // 處理地圖類型變更
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    
    try {
      // 如果已有圖層，先移除
      if (tileLayerRef.current) {
        mapInstanceRef.current.removeLayer(tileLayerRef.current);
      }
      
      // 根據 mapType 添加不同的圖層
      if (mapType === 'satellite') {
        // 衛星圖層
        tileLayerRef.current = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        }).addTo(mapInstanceRef.current);
      } else {
        // 標準地圖
        tileLayerRef.current = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(mapInstanceRef.current);
      }
    } catch (error) {
      console.error("更新地圖類型時出錯:", error);
    }
  }, [mapType]);

  // 獨立的清理函數，確保在組件卸載時徹底清理地圖
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
          markerClusterRef.current = null;
        } catch (error) {
          console.error("清理地圖時出錯:", error);
        }
      }
    };
  }, []);  // 空依賴數組，只在卸載時執行

  // 更新標記的安全實現 - 使用批量處理和 requestAnimationFrame 優化
  const updateMarkers = (data) => {
    if (!markerClusterRef.current || !Array.isArray(data)) {
      console.error("無法更新標記: markerCluster 不存在或資料不是陣列");
      return;
    }

    console.log("開始更新標記，資料點數量:", data.length);

    try {
      // 保存當前視角
      const currentView = currentViewRef.current || {
        center: [23.5, 121],
        zoom: 7
      };

      // 清除現有標記
      markerClusterRef.current.clearLayers();
      
      // 如果數據為空，直接返回
      if (data.length === 0) {
        console.log("沒有資料點需要添加");
        return;
      }
      
      // 批量處理標記，每批次處理的標記數量
      const BATCH_SIZE = 100;
      let processedCount = 0;
      let addedMarkers = 0;
      
      // 創建標記的函數
      const createMarker = (point) => {
        // 確保點位資料有效
        if (!point || typeof point.lat !== 'number' || typeof point.lng !== 'number') {
          return null;
        }
        
        // 確保誤差值有效
        const error = typeof point.error === 'number' ? point.error : 0;
        
        const marker = L.marker([point.lat, point.lng], {
          icon: createCustomIcon(error),
          error: error,
          originalPoint: point // 保存原始數據點以便在點擊事件中使用
        });

        // 添加點擊事件處理器
        if (onMarkerClick) {
          marker.on('click', () => {
            onMarkerClick([point]);
          });
        }

        // 延遲綁定彈出窗口，只有在用戶點擊標記時才創建內容
        marker.bindPopup(() => {
          // 格式化日期，用安全的方式
          let formattedDate = '未知日期';
          try {
            if (point.date) {
              formattedDate = new Date(point.date).toLocaleDateString('zh-TW', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              });
            }
          } catch (e) {
            console.warn("日期格式化錯誤:", e);
          }

          // 處理價格格式化
          const actualPrice = typeof point.actualPrice === 'number' ?
            Math.round(point.actualPrice).toLocaleString('zh-TW') : '未知';
          const estimatedPrice = typeof point.estimatedPrice === 'number' ?
            Math.round(point.estimatedPrice).toLocaleString('zh-TW') : '未知';

          // 處理新增的屬性，確保即使資料不存在也能優雅處理
          const area = point.size !== undefined && point.size !== null ? parseFloat(point.size).toFixed(2) : '未提供';
          const floor = point.floor !== undefined && point.floor !== null ? point.floor.toString() : '未提供';
          const address = point.address || '未提供';
          const community = point.community || '未提供';

          // 根據誤差值決定顏色
          let errorColorClass = error >= 0 ? 'text-red-500' : 'text-blue-600';
          let errorBgClass = error >= 0 ? 'bg-red-50' : 'bg-blue-50';
          let errorBorderClass = error >= 0 ? 'border-red-200' : 'border-blue-200';
          
          return `
            <div class="p-3 max-w-xs rounded-xl shadow-lg bg-white" style="max-height: 400px; overflow-y: auto; animation: fadeIn 0.3s ease-in-out;">
              <h3 class="font-bold text-base mb-3 text-gray-800 flex items-center">
                <svg class="w-5 h-5 mr-1 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
                房產資訊
              </h3>
              
              <div class="grid grid-cols-2 gap-2 mb-3">
                <div class="bg-gradient-to-br from-blue-50 to-indigo-50 p-2 rounded-lg shadow-sm transform transition-transform hover:scale-105">
                  <p class="text-xs text-blue-600 font-semibold flex items-center">
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path>
                    </svg>
                    坪數
                  </p>
                  <p class="font-medium text-gray-800">${area} 坪</p>
                </div>
                <div class="bg-gradient-to-br from-purple-50 to-pink-50 p-2 rounded-lg shadow-sm transform transition-transform hover:scale-105">
                  <p class="text-xs text-purple-600 font-semibold flex items-center">
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                    樓層
                  </p>
                  <p class="font-medium text-gray-800">${floor}</p>
                </div>
              </div>
              
              <div class="mb-3 bg-gradient-to-r from-green-50 to-emerald-50 p-2 rounded-lg shadow-sm">
                <p class="text-xs text-green-600 font-semibold flex items-center">
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  社區
                </p>
                <p class="font-medium text-sm text-gray-800">${community}</p>
              </div>
              
              <div class="mb-3 bg-gradient-to-r from-amber-50 to-yellow-50 p-2 rounded-lg shadow-sm">
                <p class="text-xs text-amber-600 font-semibold flex items-center">
                  <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  地址
                </p>
                <p class="font-medium text-sm text-gray-800">${address}</p>
              </div>
              
              <div class="grid grid-cols-2 gap-2 mb-3 pt-2 border-t border-gray-100">
                <div class="bg-gradient-to-br from-red-50 to-orange-50 p-2 rounded-lg shadow-sm">
                  <p class="text-xs text-red-500 font-semibold flex items-center">
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    實際價格
                  </p>
                  <p class="font-medium text-sm text-gray-800">${actualPrice} 元/坪</p>
                </div>
                <div class="bg-gradient-to-br from-cyan-50 to-sky-50 p-2 rounded-lg shadow-sm">
                  <p class="text-xs text-cyan-600 font-semibold flex items-center">
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                    </svg>
                    估計價格
                  </p>
                  <p class="font-medium text-sm text-gray-800">${estimatedPrice} 元/坪</p>
                </div>
              </div>
              
              <div class="flex justify-between items-center pt-2 border-t border-gray-100">
                <div class="bg-gradient-to-r from-gray-50 to-slate-50 p-2 rounded-lg shadow-sm">
                  <p class="text-xs text-gray-500 font-semibold flex items-center">
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    交易日期
                  </p>
                  <p class="font-medium text-sm text-gray-800">${formattedDate}</p>
                </div>
                <div class="text-center ${errorBgClass} ${errorBorderClass} border p-2 rounded-lg shadow-md transform transition-transform hover:scale-105"
                     style="background: ${error >= 0 ? 'linear-gradient(135deg, #FEE2E2, #FECACA)' : 'linear-gradient(135deg, #EFF6FF, #BFDBFE)'}">
                  <p class="text-xs ${error >= 0 ? 'text-red-600' : 'text-blue-600'} font-semibold flex items-center justify-center">
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"></path>
                    </svg>
                    誤差
                  </p>
                  <p class="font-bold ${errorColorClass}">${error.toFixed(1)}%</p>
                </div>
              </div>
              
              <style>
                @keyframes fadeIn {
                  from { opacity: 0; transform: translateY(10px); }
                  to { opacity: 1; transform: translateY(0); }
                }
              </style>
            </div>
          `;
        });

        return marker;
      };
      
      // 批量處理函數
      const processBatch = () => {
        if (processedCount >= data.length) {
          // 所有批次處理完成，恢復地圖視角
          if (mapInstanceRef.current && currentView) {
            try {
              mapInstanceRef.current.setView(currentView.center, currentView.zoom, {
                animate: false
              });
            } catch (e) {
              console.warn("恢復地圖視角時出錯:", e);
              // 嘗試使用默認視角
              mapInstanceRef.current.setView([23.5, 121], 7, {
                animate: false
              });
            }
          }
          
          console.log("成功添加標記數量:", addedMarkers);
          return;
        }
        
        // 處理當前批次
        const endIdx = Math.min(processedCount + BATCH_SIZE, data.length);
        const tempMarkers = [];
        
        for (let i = processedCount; i < endIdx; i++) {
          const marker = createMarker(data[i]);
          if (marker) {
            tempMarkers.push(marker);
            addedMarkers++;
          }
        }
        
        // 一次性添加所有標記到圖層
        if (tempMarkers.length > 0) {
          markerClusterRef.current.addLayers(tempMarkers);
        }
        
        // 更新處理計數
        processedCount = endIdx;
        
        // 使用 requestAnimationFrame 安排下一批處理，給 UI 線程喘息的機會
        requestAnimationFrame(processBatch);
      };
      
      // 開始批量處理
      processBatch();
      
    } catch (error) {
      console.error("更新標記時出現未預期的錯誤:", error);
    }
  };

  // 更新狀態
  useEffect(() => {
    setMapStatus(prev => ({
      ...prev,
      isEmpty: data.length === 0,
      isInitialized: !!mapInstanceRef.current
    }));
  }, [data, mapInstanceRef.current]);

  return (
    <div className="h-full w-full relative">
      <div ref={mapRef} className="h-full w-full" />
      
      {/* 加載中狀態 */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10">
          <div className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mb-3"></div>
            <p className="text-gray-700 font-medium">資料載入中...</p>
          </div>
        </div>
      )}
      
      {/* 空數據狀態 */}
      {!isLoading && mapStatus.isInitialized && mapStatus.isEmpty && (
        <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center z-10">
          <div className="bg-white p-6 rounded-lg shadow-md text-center max-w-sm">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <h3 className="text-lg font-bold text-gray-800 mb-2">沒有資料可顯示</h3>
            <p className="text-gray-600">請上傳房產資料或選擇不同的篩選條件</p>
          </div>
        </div>
      )}
    </div>
  );
}
