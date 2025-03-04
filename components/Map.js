// components/Map.js
import { useEffect, useRef } from 'react';
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
  
  let color;
  if (error <= 5) color = '#10B981';
  else if (error <= 10) color = '#FBBF24';
  else if (error <= 15) color = '#F97316';
  else color = '#EF4444';

  return L.divIcon({
    className: 'custom-div-icon',
    html: `
      <div style="
        background-color: ${color};
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 0 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 12px;
      ">${error.toFixed(1)}%</div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  });
};

export default function Map({ data = [], mapType = 'map' }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerClusterRef = useRef(null);
  const currentViewRef = useRef(null);

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

            let color;
            if (avgError <= 5) color = '#10B981';
            else if (avgError <= 10) color = '#FBBF24';
            else if (avgError <= 15) color = '#F97316';
            else color = '#EF4444';

            return L.divIcon({
              html: `
                <div style="
                  background-color: ${color};
                  width: 50px;
                  height: 50px;
                  border-radius: 50%;
                  border: 2px solid white;
                  box-shadow: 0 0 4px rgba(0,0,0,0.3);
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  color: white;
                  font-weight: bold;
                  font-size: 12px;
                  line-height: 1.2;
                ">
                  <span>${avgError.toFixed(1)}%</span>
                  <span style="font-size: 10px;">(${cluster.getChildCount()})</span>
                </div>
              `,
              className: 'custom-cluster-icon',
              iconSize: [50, 50],
              iconAnchor: [25, 25]
            });
          },
          maxClusterRadius: 80,
          spiderfyOnMaxZoom: true,
          showCoverageOnHover: true,
          zoomToBoundsOnClick: true
        }).addTo(mapInstanceRef.current);

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
  }, [data, mapType]);  // 在 data 或 mapType 變化時更新

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
          error: error
        });

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
            point.actualPrice.toLocaleString('zh-TW') : '未知';
          const estimatedPrice = typeof point.estimatedPrice === 'number' ?
            point.estimatedPrice.toLocaleString('zh-TW') : '未知';

          return `
            <div class="p-3">
              <h3 class="font-bold text-lg mb-2">房產資訊</h3>
              <div class="space-y-1">
                <p><span class="font-medium">實際價格:</span> ${actualPrice} 元</p>
                <p><span class="font-medium">估計價格:</span> ${estimatedPrice} 元</p>
                <p><span class="font-medium">誤差:</span> <strong>${error.toFixed(1)}%</strong></p>
                <p><span class="font-medium">交易日期:</span> ${formattedDate}</p>
              </div>
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

  return <div ref={mapRef} className="h-full w-full" />;
}
