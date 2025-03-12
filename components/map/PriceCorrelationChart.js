// components/map/PriceCorrelationChart.js
import React, { useMemo } from 'react';
import { Chart as ChartJS, registerables } from 'chart.js';
import { Scatter } from 'react-chartjs-2';
import { usePropertyData } from '../../context/PropertyDataContext';

// 註冊所有需要的Chart.js組件
if (typeof window !== 'undefined') {
  ChartJS.register(...registerables);
}

const PriceCorrelationChart = ({ community = null }) => {
  const { scatterData } = usePropertyData();
  
  // 根據是否指定社區來過濾數據
  const filteredData = useMemo(() => {
    if (!scatterData || scatterData.length === 0) return [];
    return community 
      ? scatterData.filter(item => item.community === community)
      : scatterData;
  }, [scatterData, community]);

  // 如果沒有數據，顯示空狀態
  if (!filteredData || filteredData.length === 0) {
    return (
      <div className="bg-white p-4 rounded-lg shadow flex flex-col items-center justify-center h-64">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p className="text-gray-500 text-center">沒有足夠的數據來顯示價格關係圖</p>
      </div>
    );
  }

  // 計算最大估值，用於基準線
  const maxEstimatedPrice = Math.max(...filteredData.map(d => d.estimatedPrice));

  // 準備散點圖數據
  const chartData = {
    datasets: [
      // 散點數據
      {
        label: '房屋',
        data: filteredData.map(item => ({
          x: item.estimatedPrice,
          y: item.tradePrice,
          address: item.address,
          floor: item.floor,
          area: item.area,
          date: item.date,
          estimatedPrice: item.estimatedPrice,
          tradePrice: item.tradePrice
        })),
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      // 基準線數據
      {
        label: '基準線',
        data: [
          { x: 0, y: 0 },
          { x: maxEstimatedPrice, y: maxEstimatedPrice }
        ],
        borderColor: '#FF0000',
        borderDash: [5, 5],
        borderWidth: 2,
        pointRadius: 0,
        showLine: true,
        type: 'line'
      }
    ]
  };

  // 圖表配置
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: '估值 (元/坪)'
        },
        ticks: {
          callback: function(value) {
            return value.toLocaleString('zh-TW');
          }
        }
      },
      y: {
        title: {
          display: true,
          text: '交易價格 (元/坪)'
        },
        ticks: {
          callback: function(value) {
            return value.toLocaleString('zh-TW');
          }
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context) {
            const data = context.raw;
            if (context.dataset.label === '基準線') {
              return '基準線';
            }
            
            const lines = [
              `地址: ${data.address || '地址未知'}`,
              `樓層: ${data.floor}F / 坪數: ${data.area}坪`,
              `日期: ${data.date}`,
              `交易價格: ${Math.round(data.tradePrice).toLocaleString('zh-TW')} 元/坪`,
              `估值: ${Math.round(data.estimatedPrice).toLocaleString('zh-TW')} 元/坪`
            ];
            return lines;
          }
        }
      },
      legend: {
        position: 'top',
      },
    },
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-bold mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        {community ? `${community} 交易價格與估值相關性` : '交易價格與估值相關性'}
      </h3>
      <div className="h-64">
        <Scatter data={chartData} options={options} />
      </div>
    </div>
  );
};

export default PriceCorrelationChart;
