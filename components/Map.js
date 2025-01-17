// components/Map.js
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;

const createCustomIcon = (error) => {
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

export default function Map({ data }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerClusterRef = useRef(null);
  const currentViewRef = useRef(null); // 保存當前視角的ref

  useEffect(() => {
    if (!mapInstanceRef.current) {
      // 初始化地圖
      mapInstanceRef.current = L.map(mapRef.current).setView([23.5, 121], 7);
      
      // 添加圖層
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(mapInstanceRef.current);

      // 初始化標記群集
      markerClusterRef.current = L.markerClusterGroup({
        iconCreateFunction: function(cluster) {
          const childMarkers = cluster.getAllChildMarkers();
          const avgError = childMarkers.reduce((sum, marker) => 
            sum + marker.options.error, 0) / childMarkers.length;

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
    }

    // 更新標記，並保持當前視角
    if (data && data.length > 0) {
      updateMarkers(data);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [data]);

  // 更新標記
  const updateMarkers = (data) => {
    if (!markerClusterRef.current) return;

    // 保存當前視角
    const currentView = currentViewRef.current || {
      center: [23.5, 121],
      zoom: 7
    };

    markerClusterRef.current.clearLayers();

    data.forEach(point => {
      const marker = L.marker([point.lat, point.lng], {
        icon: createCustomIcon(point.error),
        error: point.error
      });

      const formattedDate = new Date(point.date).toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      marker.bindPopup(`
        <div class="p-3">
          <h3 class="font-bold text-lg mb-2">房產資訊</h3>
          <div class="space-y-1">
            <p><span class="font-medium">實際價格:</span> ${point.actualPrice.toLocaleString('zh-TW')} 元</p>
            <p><span class="font-medium">估計價格:</span> ${point.estimatedPrice.toLocaleString('zh-TW')} 元</p>
            <p><span class="font-medium">誤差:</span> <strong>${point.error.toFixed(1)}%</strong></p>
            <p><span class="font-medium">交易日期:</span> ${formattedDate}</p>
          </div>
        </div>
      `);

      markerClusterRef.current.addLayer(marker);
    });

    // 恢復先前的視角
    if (mapInstanceRef.current && currentView) {
      mapInstanceRef.current.setView(currentView.center, currentView.zoom, {
        animate: false
      });
    }
  };

  return <div ref={mapRef} className="h-full w-full" />;
}