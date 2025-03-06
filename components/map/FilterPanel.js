// components/map/FilterPanel.js
import React from 'react';
import { cn } from '@/lib/utils';
import RangeSlider from '../RangeSlider';

export default function FilterPanel({
  isMobileFilterOpen,
  timeRange,
  setTimeRange,
  priceRange,
  setPriceRange,
  errorRange,
  setErrorRange,
  formatDate,
  formatPrice
}) {
  return (
    <div className={cn(
      "transition-all duration-300 overflow-hidden md:h-auto border-b border-gray-200/50",
      isMobileFilterOpen ? "max-h-[500px]" : "max-h-0 md:max-h-[500px]"
    )}>
      <div className="p-4 md:p-6 bg-gray-50/50">
        <div className="flex items-center mb-4">
          <div className="bg-blue-500 w-8 h-8 rounded-lg flex items-center justify-center mr-2 shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">篩選條件</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 時間範圍選擇 */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              時間範圍:
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">開始日期</label>
                <input
                  type="date"
                  className="w-full p-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  value={formatDate(timeRange[0])}
                  min="2012-07-01"
                  max={formatDate(new Date().getTime())}
                  onChange={(e) => {
                    try {
                      const date = new Date(e.target.value);
                      if (!isNaN(date.getTime())) {
                        // 確保開始日期不晚於結束日期
                        const endDate = timeRange[1];
                        if (date.getTime() <= endDate) {
                          setTimeRange([date.getTime(), endDate]);
                        } else {
                          // 如果開始日期晚於結束日期，將結束日期設為開始日期
                          setTimeRange([date.getTime(), date.getTime()]);
                        }
                      }
                    } catch (error) {
                      console.error('日期解析錯誤:', error);
                    }
                  }}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">結束日期</label>
                <input
                  type="date"
                  className="w-full p-2 border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  value={formatDate(timeRange[1])}
                  min={formatDate(timeRange[0])}
                  max={formatDate(new Date().getTime())}
                  onChange={(e) => {
                    try {
                      const date = new Date(e.target.value);
                      if (!isNaN(date.getTime())) {
                        // 確保結束日期不早於開始日期
                        const startDate = timeRange[0];
                        if (date.getTime() >= startDate) {
                          setTimeRange([startDate, date.getTime()]);
                        }
                      }
                    } catch (error) {
                      console.error('日期解析錯誤:', error);
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* 價格範圍滑塊 */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              價格範圍:
            </label>
            <RangeSlider
              value={priceRange}
              onChange={setPriceRange}
              min={0}
              max={2000000}
              step={100000}
              formatValue={formatPrice}
              parseValue={(val) => Number(val.replace(/,/g, ''))}
              unit=" 元"
              allowNoLimit={true}
              allowManualInput={false}
            />
          </div>

          {/* 誤差範圍滑塊 */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              誤差範圍:
            </label>
            <RangeSlider
              value={errorRange}
              onChange={setErrorRange}
              min={0}
              max={20}
              step={1}
              unit="%"
              allowNoLimit={true}
              allowManualInput={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
