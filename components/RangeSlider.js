// components/RangeSlider.js
import React from 'react';

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
 */
const RangeSlider = ({ 
  value, 
  onChange, 
  min, 
  max, 
  step,
  formatValue = (val) => val.toString(),
  unit = ''
}) => {
  // 確保值在有效範圍內
  const [minValue, maxValue] = value;
  
  // 簡單的範圍選擇器實現 - 使用兩個獨立的輸入控件
  return (
    <div className="mb-6">
      <div className="flex justify-between mb-2 px-2">
        <span className="text-sm font-medium">
          {formatValue(minValue)}{unit}
        </span>
        <span className="text-sm font-medium">
          {formatValue(maxValue)}{unit}
        </span>
      </div>
      
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
        <div>
          <label className="block text-xs text-gray-500 mb-1">最大值</label>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={maxValue}
            onChange={(e) => {
              const newMax = Number(e.target.value);
              if (newMax > minValue) {
                onChange([minValue, newMax]);
              }
            }}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>
      </div>
    </div>
  );
};

export default RangeSlider;