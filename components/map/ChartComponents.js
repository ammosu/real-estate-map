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
        label: '平均估值',
        data: chartData.map(item => item.avgEstimatedPrice),
        borderColor: '#F59E0B',
        backgroundColor: 'rgba(245, 158, 11, 0.5)',
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
        label: 'MAPE (平均絕對百分比誤差)',
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
        label: 'MPE (平均百分比誤差)',
        data: chartData.map(item => item.mpe),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        yAxisID: 'y',
        tension: 0.1,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
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
        grid: {
          drawOnChartArea: false,
        },
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
        min: -20,
        max: 20,
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
        grid: {
          drawOnChartArea: false,
        },
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