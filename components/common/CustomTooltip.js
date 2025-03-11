// components/common/CustomTooltip.js
import React from 'react';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  // 格式化數字為千分位
  const formatNumber = (num) => {
    if (typeof num !== 'number') return '0';
    return num.toLocaleString('zh-TW');
  };

  // 格式化百分比
  const formatPercent = (num) => {
    if (typeof num !== 'number') return '0%';
    return `${num.toFixed(2)}%`;
  };

  // 根據數據類型決定格式化方式
  const getFormattedValue = (entry) => {
    const { name, value } = entry;
    
    if (name.includes('MAPE') || name.includes('MPE')) {
      return formatPercent(value);
    } else if (name.includes('價格')) {
      return `${formatNumber(value)} 元/坪`;
    } else {
      return formatNumber(value);
    }
  };

  // 根據數據類型決定顏色
  const getColor = (entry) => {
    const { name } = entry;
    
    if (name.includes('MAPE')) {
      return '#EF4444'; // 紅色
    } else if (name.includes('MPE')) {
      return '#10B981'; // 綠色
    } else if (name.includes('平均交易價格')) {
      return '#3B82F6'; // 藍色
    } else if (name.includes('平均估值')) {
      return '#F59E0B'; // 橙色
    } else {
      return '#6B7280'; // 灰色
    }
  };

  return (
    <div className="bg-white p-3 rounded-lg shadow-md border border-gray-200">
      <p className="text-gray-700 font-medium mb-2">{label}</p>
      <div className="space-y-1">
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center">
            <div 
              className="w-3 h-3 rounded-full mr-2" 
              style={{ backgroundColor: getColor(entry) }}
            />
            <span className="text-gray-600 mr-2">{entry.name}:</span>
            <span className="font-medium" style={{ color: getColor(entry) }}>
              {getFormattedValue(entry)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomTooltip;