// components/RangeSlider.js
import React, { useState, useEffect, useRef, useCallback } from 'react';

/**
 * 防抖函數 - 延遲執行函數直到停止呼叫一段時間後
 * @param {Function} func 要執行的函數
 * @param {number} wait 等待時間（毫秒）
 * @returns {Function} 防抖處理後的函數
 */
function debounce(func, wait) {
  let timeout;
  return function(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

/**
 * 雙向範圍滑塊元件
 * @param {Object} props 元件屬性
 * @param {Array} props.value 目前值 [最小值, 最大值]
 * @param {Function} props.onChange 值變更時的回呼
 * @param {number} props.min 滑塊最小可選值
 * @param {number} props.max 滑塊最大可選值
 * @param {number} props.step 滑塊步進值
 * @param {Function} props.formatValue 格式化顯示值的函數
 * @param {Function} props.parseValue 解析輸入值的函數 (可選)
 * @param {string} props.unit 值的單位
 * @param {boolean} props.allowNoLimit 是否允許無上限選項
 * @param {boolean} props.allowManualInput 是否允許手動輸入 (可選)
 * @param {string} props.inputType 輸入框類型 (可選，預設為 'text')
 */
const RangeSlider = ({
  value,
  onChange,
  min,
  max,
  step,
  formatValue = (val) => val.toString(),
  parseValue = (val) => Number(val),
  unit = '',
  allowNoLimit = false,
  allowManualInput = false,
  inputType = 'text'
}) => {
  // 確保值在有效範圍內
  const [minValue, maxValue] = value;
  const [noUpperLimit, setNoUpperLimit] = useState(false);
  
  // 內部狀態用於即時更新 UI
  const [localMinValue, setLocalMinValue] = useState(minValue);
  const [localMaxValue, setLocalMaxValue] = useState(maxValue);
  
  // 錯誤狀態
  const [inputError, setInputError] = useState('');
  
  // 使用 useRef 存儲防抖函數，避免重新創建
  const debouncedOnChange = useRef(
    debounce((newMin, newMax) => {
      onChange([newMin, newMax]);
    }, 300) // 300ms 的防抖延遲
  ).current;
  
  // 當外部 value 變化時更新內部狀態
  useEffect(() => {
    setLocalMinValue(minValue);
    setLocalMaxValue(maxValue);
  }, [minValue, maxValue]);
  
  // 當啟用無上限時，將最大值設為最大可能值
  useEffect(() => {
    if (noUpperLimit) {
      onChange([minValue, max]);
    }
  }, [noUpperLimit, onChange, minValue, max]);
  
  // 處理滑塊最小值變化
  const handleMinChange = useCallback((e) => {
    const newMin = Number(e.target.value);
    if (newMin < localMaxValue) {
      setLocalMinValue(newMin);
      debouncedOnChange(newMin, localMaxValue);
    }
  }, [localMaxValue, debouncedOnChange]);
  
  // 處理滑塊最大值變化
  const handleMaxChange = useCallback((e) => {
    if (noUpperLimit) return;
    const newMax = Number(e.target.value);
    if (newMax > localMinValue) {
      setLocalMaxValue(newMax);
      debouncedOnChange(localMinValue, newMax);
    }
  }, [localMinValue, noUpperLimit, debouncedOnChange]);
  
  // 移除所有與手動輸入相關的函數
  
  return (
    <div className="mb-6">
      <div className="flex justify-between mb-2 px-2">
        <span className="text-sm font-medium">
          {formatValue(localMinValue)}{unit}
        </span>
        <span className="text-sm font-medium">
          {noUpperLimit ? "不限" : `${formatValue(localMaxValue)}${unit}`}
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
      
      {/* 錯誤提示 */}
      {inputError && (
        <div className="mb-2 px-2">
          <p className="text-sm text-red-500">{inputError}</p>
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
            value={localMinValue}
            onChange={handleMinChange}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500 mb-2"
          />
          
          {/* 移除手動輸入框 */}
        </div>
        
        {/* 最大值選擇器 */}
        <div className={noUpperLimit ? "opacity-50" : ""}>
          <label className="block text-xs text-gray-500 mb-1">最大值</label>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={localMaxValue}
            onChange={handleMaxChange}
            disabled={noUpperLimit}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500 mb-2"
          />
          
          {/* 移除手動輸入框 */}
        </div>
      </div>
    </div>
  );
};

export default RangeSlider;
