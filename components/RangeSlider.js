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
  
  // 用於手動輸入的狀態
  const [minInputValue, setMinInputValue] = useState(formatValue(minValue));
  const [maxInputValue, setMaxInputValue] = useState(formatValue(maxValue));
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
    setMinInputValue(formatValue(minValue));
    setMaxInputValue(formatValue(maxValue));
  }, [minValue, maxValue, formatValue]);
  
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
      setMinInputValue(formatValue(newMin));
      debouncedOnChange(newMin, localMaxValue);
    }
  }, [localMaxValue, debouncedOnChange, formatValue]);
  
  // 處理滑塊最大值變化
  const handleMaxChange = useCallback((e) => {
    if (noUpperLimit) return;
    const newMax = Number(e.target.value);
    if (newMax > localMinValue) {
      setLocalMaxValue(newMax);
      setMaxInputValue(formatValue(newMax));
      debouncedOnChange(localMinValue, newMax);
    }
  }, [localMinValue, noUpperLimit, debouncedOnChange, formatValue]);
  
  // 處理手動輸入最小值
  const handleMinInputChange = useCallback((e) => {
    const inputVal = e.target.value;
    setMinInputValue(inputVal);
  }, []);
  
  // 處理手動輸入最大值
  const handleMaxInputChange = useCallback((e) => {
    const inputVal = e.target.value;
    setMaxInputValue(inputVal);
  }, []);
  
  // 處理最小值輸入框失去焦點
  const handleMinInputBlur = useCallback(() => {
    try {
      const newMin = parseValue(minInputValue);
      
      // 驗證輸入值
      if (isNaN(newMin)) {
        throw new Error('請輸入有效的值');
      }
      
      if (newMin < min) {
        throw new Error(`最小值不能小於 ${formatValue(min)}`);
      }
      
      if (newMin >= localMaxValue && !noUpperLimit) {
        throw new Error('最小值必須小於最大值');
      }
      
      // 更新值
      setLocalMinValue(newMin);
      setMinInputValue(formatValue(newMin));
      debouncedOnChange(newMin, localMaxValue);
      setInputError('');
    } catch (error) {
      setInputError(error.message);
      // 恢復為原始值
      setMinInputValue(formatValue(localMinValue));
    }
  }, [minInputValue, parseValue, min, localMaxValue, noUpperLimit, formatValue, debouncedOnChange]);
  
  // 處理最大值輸入框失去焦點
  const handleMaxInputBlur = useCallback(() => {
    if (noUpperLimit) return;
    
    try {
      const newMax = parseValue(maxInputValue);
      
      // 驗證輸入值
      if (isNaN(newMax)) {
        throw new Error('請輸入有效的值');
      }
      
      if (newMax > max) {
        throw new Error(`最大值不能大於 ${formatValue(max)}`);
      }
      
      if (newMax <= localMinValue) {
        throw new Error('最大值必須大於最小值');
      }
      
      // 更新值
      setLocalMaxValue(newMax);
      setMaxInputValue(formatValue(newMax));
      debouncedOnChange(localMinValue, newMax);
      setInputError('');
    } catch (error) {
      setInputError(error.message);
      // 恢復為原始值
      setMaxInputValue(formatValue(localMaxValue));
    }
  }, [maxInputValue, parseValue, max, localMinValue, noUpperLimit, formatValue, debouncedOnChange]);
  
  // 處理輸入框按下 Enter 鍵
  const handleInputKeyDown = useCallback((e, isMin) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (isMin) {
        handleMinInputBlur();
      } else {
        handleMaxInputBlur();
      }
    }
  }, [handleMinInputBlur, handleMaxInputBlur]);
  
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
          
          {/* 手動輸入框 */}
          {allowManualInput && (
            <div className="mt-1">
              <input
                type={inputType}
                value={minInputValue}
                onChange={handleMinInputChange}
                onBlur={handleMinInputBlur}
                onKeyDown={(e) => handleInputKeyDown(e, true)}
                className="w-full p-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={`最小${unit}`}
              />
            </div>
          )}
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
          
          {/* 手動輸入框 */}
          {allowManualInput && (
            <div className="mt-1">
              <input
                type={inputType}
                value={noUpperLimit ? "不限" : maxInputValue}
                onChange={handleMaxInputChange}
                onBlur={handleMaxInputBlur}
                onKeyDown={(e) => handleInputKeyDown(e, false)}
                disabled={noUpperLimit}
                className="w-full p-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={`最大${unit}`}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RangeSlider;
