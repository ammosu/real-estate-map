// components/RangeSlider.js
import React, { useState, useEffect } from 'react';

/**
 * 雙向範圍滑塊組件
 * @param {Object} props 組件屬性
 * @param {Array} props.value 當前值 [最小值, 最大值]
 * @param {Function} props.onChange 值變更時的回調
 * @param {number} props.min 滑塊最小可選值
 * @param {number} props.max 滑塊最大可選值
 * @param {number} props.step 滑塊步進值
 * @param {Function} props.formatValue 格式化顯示值的函數
 * @param {string} props.unit 值的單位
 * @param {boolean} props.allowNoLimit 是否允許無上限選項
 */
const RangeSlider = ({ 
  value, 
  onChange, 
  min, 
  max, 
  step,
  formatValue = (val) => val.toString(),
  unit = '',
  allowNoLimit = false
}) => {
  // 確保值在有效範圍內
  const [minValue, maxValue] = value;
  const [noUpperLimit, setNoUpperLimit] = useState(false);
  
  // 當啟用無上限時，將最大值設為最大可能值
  useEffect(() => {
    if (noUpperLimit) {
      onChange([minValue, max]);
    }
  }, [noUpperLimit]);
  
  // 簡單的範圍選擇器實現 - 使用兩個獨立的輸入控件
  return (
    <div className="mb-6">
      <div className="flex justify-between mb-2 px-2">
        <span className="text-sm font-medium">
          {formatValue(minValue)}{unit}
        </span>
        <span className="text-sm font-medium">
          {noUpperLimit ? "不限" : `${formatValue(maxValue)}${unit}`}
        </span>
      </div>
      
      {allowNoLimit && (
        <div className="flex justify-end mb-2">
          <label className="inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              checked={noUpperLimit} 
              onChange={(e) => setNoUpperLimit(e.target.checked)}
              className="sr-only peer"
            />
            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            <span className="ms-3 text-sm font-medium text-gray-600">不限上限</span>
          </label>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        {/* 最小值選擇器 */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">最小值</label>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={minValue}
            onChange={(e) => {
              const newMin = Number(e.target.value);
              if (newMin < maxValue) {
                onChange([newMin, maxValue]);
              }
            }}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>
        
        {/* 最大值選擇器 */}
        <div className={noUpperLimit ? "opacity-50" : ""}>
          <label className="block text-xs text-gray-500 mb-1">最大值</label>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={maxValue}
            onChange={(e) => {
              if (noUpperLimit) return;
              const newMax = Number(e.target.value);
              if (newMax > minValue) {
                onChange([minValue, newMax]);
              }
            }}
            disabled={noUpperLimit}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>
      </div>
    </div>
  );
};

export default RangeSlider;
