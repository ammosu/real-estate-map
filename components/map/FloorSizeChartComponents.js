import React from 'react';

const FloorSizeChartComponents = ({ chartData, chartType }) => {
  // 如果沒有數據，顯示空狀態
  if (!chartData || chartData.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        沒有足夠的數據來顯示分析
      </div>
    );
  }

  // 根據圖表類型決定使用的 dataKey
  const dataKey = chartType === 'floor' ? 'floorGroup' : 'sizeGroup';
  
  // 格式化數字為千分位
  const formatNumber = (num) => {
    return Math.round(num).toLocaleString('zh-TW');
  };

  return (
    <div className="w-full">
      {/* 圖表標題 */}
      <h4 className="text-sm font-medium text-gray-700 mb-2">
        {chartType === 'floor' ? '各樓層價格分布' : '各坪數價格分布'}
      </h4>
      
      {/* 表格形式顯示數據 */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b text-left text-xs font-medium text-gray-600">
                {chartType === 'floor' ? '樓層' : '坪數'}
              </th>
              <th className="py-2 px-4 border-b text-right text-xs font-medium text-gray-600">
                平均交易價格 (元/坪)
              </th>
              <th className="py-2 px-4 border-b text-right text-xs font-medium text-gray-600">
                平均估值 (元/坪)
              </th>
            </tr>
          </thead>
          <tbody>
            {chartData.map((item, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="py-2 px-4 border-b text-sm text-gray-700">
                  {item[dataKey]}
                </td>
                <td className="py-2 px-4 border-b text-sm text-right text-blue-600 font-medium">
                  {formatNumber(item.avgTradePrice)}
                </td>
                <td className="py-2 px-4 border-b text-sm text-right text-amber-600 font-medium">
                  {formatNumber(item.avgEstimatedPrice)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* 簡易柱狀圖 */}
      <div className="mt-4 space-y-4">
        {chartData.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex items-center">
              <div className="w-24 text-xs text-gray-600">{item[dataKey]}</div>
              <div className="flex-1">
                <div className="flex items-center">
                  <div className="w-16 text-xs text-gray-500 mr-2">交易價格:</div>
                  <div 
                    className="h-6 bg-blue-500 rounded-sm"
                    style={{ width: `${Math.min(100, (item.avgTradePrice / 1000000) * 100)}%` }}
                  ></div>
                  <div className="ml-2 text-xs text-blue-700">{formatNumber(item.avgTradePrice)}</div>
                </div>
                <div className="flex items-center mt-1">
                  <div className="w-16 text-xs text-gray-500 mr-2">估值:</div>
                  <div 
                    className="h-6 bg-amber-500 rounded-sm"
                    style={{ width: `${Math.min(100, (item.avgEstimatedPrice / 1000000) * 100)}%` }}
                  ></div>
                  <div className="ml-2 text-xs text-amber-700">{formatNumber(item.avgEstimatedPrice)}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* 圖例 */}
      <div className="flex mt-4 space-x-6">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
          <span className="text-sm">平均交易價格</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-amber-500 rounded mr-2"></div>
          <span className="text-sm">平均估值</span>
        </div>
      </div>
      
      <div className="text-xs text-gray-500 text-center mt-2">
        * 柱狀圖寬度以100萬元/坪為基準
      </div>
    </div>
  );
};

export default FloorSizeChartComponents;
