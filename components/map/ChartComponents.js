// components/map/ChartComponents.js
import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

// 註冊所有需要的Chart.js組件
if (typeof window !== 'undefined') {
  Chart.register(...registerables);
}

const ChartComponents = ({ chartData, showErrorMetrics }) => {
  // 如果沒有數據，顯示空狀態
  if (!chartData || chartData.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        沒有足夠的數據來顯示趨勢分析
      </div>
    );
  }

  // 準備圖表數據
  const labels = chartData.map(item => item.yearMonth);
  
  // 價格視圖數據
  const priceData = {
    labels,
    datasets: [
      {
        type: 'line',
        label: '平均交易價格',
        data: chartData.map(item => item.avgTradePrice),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        yAxisID: 'y',
        tension: 0.1,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        type: 'line',
        label: '平均基本估值',
        data: chartData.map(item => item.avgEstimatedPrice),
        borderColor: '#F59E0B',
        backgroundColor: 'rgba(245, 158, 11, 0.5)',
        yAxisID: 'y',
        tension: 0.1,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        type: 'line',
        label: '平均含社區調整估值',
        data: chartData.map(item => item.avgEstimatedPriceWithCommunity),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        yAxisID: 'y',
        tension: 0.1,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        type: 'line',
        label: '平均含社區時間調整估值',
        data: chartData.map(item => item.avgEstimatedPriceWithCommunityAndTime),
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.5)',
        yAxisID: 'y',
        tension: 0.1,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        type: 'bar',
        label: '交易數量',
        data: chartData.map(item => item.count),
        backgroundColor: 'rgba(209, 213, 219, 0.8)',
        yAxisID: 'y1',
      }
    ]
  };

  // 誤差指標視圖數據
  const errorData = {
    labels,
    datasets: [
      {
        type: 'line',
        label: 'MAPE (基本估值)',
        data: chartData.map(item => item.mape),
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.5)',
        yAxisID: 'y',
        tension: 0.1,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        type: 'line',
        label: 'MPE (基本估值)',
        data: chartData.map(item => item.mpe),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        yAxisID: 'y',
        tension: 0.1,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        type: 'line',
        label: 'MAPE (含社區調整)',
        data: chartData.map(item => item.mapeWithCommunity),
        borderColor: '#F59E0B',
        backgroundColor: 'rgba(245, 158, 11, 0.5)',
        yAxisID: 'y',
        tension: 0.1,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderDash: [5, 5],
      },
      {
        type: 'line',
        label: 'MPE (含社區調整)',
        data: chartData.map(item => item.mpeWithCommunity),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        yAxisID: 'y',
        tension: 0.1,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderDash: [5, 5],
      },
      {
        type: 'line',
        label: 'MAPE (含社區時間調整)',
        data: chartData.map(item => item.mapeWithCommunityAndTime),
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.5)',
        yAxisID: 'y',
        tension: 0.1,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderDash: [10, 5],
      },
      {
        type: 'line',
        label: 'MPE (含社區時間調整)',
        data: chartData.map(item => item.mpeWithCommunityAndTime),
        borderColor: '#EC4899',
        backgroundColor: 'rgba(236, 72, 153, 0.5)',
        yAxisID: 'y',
        tension: 0.1,
        pointRadius: 4,
        pointHoverRadius: 6,
        borderDash: [10, 5],
      },
      {
        type: 'bar',
        label: '交易數量',
        data: chartData.map(item => item.count),
        backgroundColor: 'rgba(209, 213, 219, 0.8)',
        yAxisID: 'y1',
      }
    ]
  };

  // 計算誤差指標的最小值和最大值
  const calculateErrorBounds = () => {
    // 收集所有誤差指標數據
    const allErrorValues = [];
    chartData.forEach(item => {
      if (item.mape !== undefined) allErrorValues.push(item.mape);
      if (item.mpe !== undefined) allErrorValues.push(item.mpe);
      if (item.mapeWithCommunity !== undefined) allErrorValues.push(item.mapeWithCommunity);
      if (item.mpeWithCommunity !== undefined) allErrorValues.push(item.mpeWithCommunity);
      if (item.mapeWithCommunityAndTime !== undefined) allErrorValues.push(item.mapeWithCommunityAndTime);
      if (item.mpeWithCommunityAndTime !== undefined) allErrorValues.push(item.mpeWithCommunityAndTime);
    });

    // 如果沒有數據，返回默認值
    if (allErrorValues.length === 0) {
      return { min: -20, max: 20 };
    }

    // 計算最小值和最大值
    const minError = Math.min(...allErrorValues);
    const maxError = Math.max(...allErrorValues);
    
    // 添加10%的邊距
    const range = maxError - minError;
    const padding = Math.max(range * 0.1, 2); // 至少2%的邊距
    
    return {
      min: Math.floor(minError - padding),
      max: Math.ceil(maxError + padding)
    };
  };

  // 計算交易數量的最大值
  const calculateCountMax = () => {
    const counts = chartData.map(item => item.count);
    const maxCount = Math.max(...counts);
    
    // 添加20%的邊距
    const padding = Math.ceil(maxCount * 0.2);
    
    return maxCount + padding;
  };

  // 獲取計算後的邊界值
  const errorBounds = calculateErrorBounds();
  const countMax = calculateCountMax();

  // 價格視圖配置
  const priceOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              if (context.dataset.yAxisID === 'y') {
                label += Math.round(context.parsed.y).toLocaleString('zh-TW') + ' 元/坪';
              } else {
                label += context.parsed.y;
              }
            }
            return label;
          }
        }
      },
      legend: {
        position: 'top',
      },
      title: {
        display: false,
        text: '價格時間趨勢分析'
      },
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: '價格 (元/坪)'
        },
        ticks: {
          callback: function(value) {
            return value.toLocaleString('zh-TW');
          }
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: '交易數量'
        },
        max: countMax,
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          stepSize: 1,
          callback: function(value) {
            return Math.floor(value); // 只顯示整數
          }
        }
      },
    },
  };

  // 誤差指標視圖配置
  const errorOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              if (context.dataset.yAxisID === 'y') {
                label += context.parsed.y.toFixed(2) + '%';
              } else {
                label += context.parsed.y;
              }
            }
            return label;
          }
        }
      },
      legend: {
        position: 'top',
      },
      title: {
        display: false,
        text: '誤差指標分析'
      },
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: '誤差百分比 (%)'
        },
        min: errorBounds.min,
        max: errorBounds.max,
        ticks: {
          callback: function(value) {
            return value + '%';
          }
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: '交易數量'
        },
        max: countMax,
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          stepSize: 1,
          callback: function(value) {
            return Math.floor(value); // 只顯示整數
          }
        }
      },
    },
  };

  return (
    <div className="h-96">
      {!showErrorMetrics ? (
        <Bar data={priceData} options={priceOptions} />
      ) : (
        <Bar data={errorData} options={errorOptions} />
      )}
    </div>
  );
};

export default ChartComponents;
