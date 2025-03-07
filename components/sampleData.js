// components/sampleData.js
// 台灣主要城市的大致座標
const cityCoordinates = {
    taipei: { lat: 25.0330, lng: 121.5654 },
    taichung: { lat: 24.1477, lng: 120.6736 },
    kaohsiung: { lat: 22.6273, lng: 120.3014 },
    hsinchu: { lat: 24.8138, lng: 120.9675 },
    tainan: { lat: 22.9999, lng: 120.2269 },
    keelung: { lat: 25.1276, lng: 121.7392 },
    taoyuan: { lat: 24.9936, lng: 121.3010 }
  };
  
// 使用固定種子的隨機數生成器，確保每次生成的數據一致
const seededRandom = (seed) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

let seed = 1;
const nextRandom = () => {
  seed++;
  return seededRandom(seed);
};

// 生成隨機誤差（正負值）
const generateError = () => {
  return (nextRandom() * 40) - 20; // -20% 到 +20% 的誤差
};

// 生成隨機價格
const generatePrice = () => {
  return Math.floor(150000 + nextRandom() * 350000); // 15萬到50萬之間
};
  
  // 生成隨機日期
  const generateDate = () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(endDate.getMonth() - 6);
    return new Date(startDate.getTime() + nextRandom() * (endDate.getTime() - startDate.getTime()));
  };
  
  // 在特定座標周圍生成隨機點位
  const generatePointsAroundCoordinate = (baseLat, baseLng, count) => {
    const points = [];
    for (let i = 0; i < count; i++) {
      const lat = baseLat + (nextRandom() - 0.5) * 0.05;
      const lng = baseLng + (nextRandom() - 0.5) * 0.05;
      const actualPrice = generatePrice();
      
      // 確保生成的誤差有正有負
      // 使用 i 的奇偶性來決定誤差的正負，確保正負誤差大約各半
      let error;
      if (i % 2 === 0) {
        // 偶數索引生成正誤差 (0% 到 20%)
        error = nextRandom() * 20;
      } else {
        // 奇數索引生成負誤差 (-20% 到 0%)
        error = (nextRandom() * 20) * -1;
      }
      
      const estimatedPrice = actualPrice * (1 + (error / 100)); // 正誤差會高估，負誤差會低估
      
      points.push({
        lat,
        lng,
        actualPrice,
        estimatedPrice,
        error,
        date: generateDate()
      });
    }
    return points;
  };
  
  // 生成所有測試資料
  export const generateSampleData = () => {
    // 重置種子，確保每次生成的數據一致
    seed = 1;
    
    let allPoints = [];
    
    Object.values(cityCoordinates).forEach(coord => {
      const pointsCount = Math.floor(10 + nextRandom() * 20); // 每個城市10-30個點
      const points = generatePointsAroundCoordinate(coord.lat, coord.lng, pointsCount);
      allPoints = [...allPoints, ...points];
    });
    
    return allPoints;
  };
