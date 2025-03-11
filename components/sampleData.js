// components/sampleData.js
// 台灣主要城市的大致座標和地址前綴
const cityCoordinates = {
    taipei: { 
      lat: 25.0330, 
      lng: 121.5654,
      addressPrefix: "台北市",
      districts: ["信義區", "大安區", "中山區", "松山區", "內湖區"]
    },
    taichung: { 
      lat: 24.1477, 
      lng: 120.6736,
      addressPrefix: "台中市",
      districts: ["西區", "北區", "南區", "東區", "北屯區"]
    },
    kaohsiung: { 
      lat: 22.6273, 
      lng: 120.3014,
      addressPrefix: "高雄市",
      districts: ["前金區", "鹽埕區", "鼓山區", "三民區", "左營區"]
    },
    hsinchu: { 
      lat: 24.8138, 
      lng: 120.9675,
      addressPrefix: "新竹市",
      districts: ["東區", "北區", "香山區"]
    },
    tainan: { 
      lat: 22.9999, 
      lng: 120.2269,
      addressPrefix: "台南市",
      districts: ["中西區", "東區", "南區", "北區", "安平區"]
    },
    keelung: { 
      lat: 25.1276, 
      lng: 121.7392,
      addressPrefix: "基隆市",
      districts: ["仁愛區", "信義區", "中正區", "中山區", "安樂區"]
    },
    taoyuan: { 
      lat: 24.9936, 
      lng: 121.3010,
      addressPrefix: "桃園市",
      districts: ["桃園區", "中壢區", "平鎮區", "八德區", "龜山區"]
    },
    newTaipei: {
      lat: 25.0120, 
      lng: 121.4650,
      addressPrefix: "新北市",
      districts: ["板橋區", "新莊區", "三重區", "中和區", "永和區"]
    }
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

// 生成隨機樓層
const generateFloor = () => {
  return Math.floor(1 + nextRandom() * 20); // 1樓到20樓
};

// 生成隨機坪數
const generateSize = () => {
  return Math.floor(20 + nextRandom() * 60); // 20坪到80坪
};

// 生成隨機地址
const generateAddress = (city, district) => {
  const roads = ["文化路", "中山路", "民生路", "建國路", "和平路", "忠孝路", "信義路", "復興路", "光明路", "仁愛路"];
  const road = roads[Math.floor(nextRandom() * roads.length)];
  const section = Math.floor(1 + nextRandom() * 3); // 1~3段
  const number = Math.floor(1 + nextRandom() * 500); // 1~500號
  const subNumber = Math.floor(nextRandom() * 50); // 0~49
  
  return `${city}${district}${road}一段${number}${subNumber > 0 ? '之' + subNumber : ''}號`;
};

// 生成隨機社區名稱
const generateCommunityName = (city, district) => {
  const prefixes = ["豪景", "翠堤", "帝寶", "皇家", "富貴", "尊爵", "雅緻", "麗景", "星河", "御花園"];
  const suffixes = ["社區", "花園", "大廈", "廣場", "城堡", "莊園", "山莊", "別墅", "公寓", ""];
  
  const prefix = prefixes[Math.floor(nextRandom() * prefixes.length)];
  const suffix = suffixes[Math.floor(nextRandom() * suffixes.length)];
  
  // 有時候使用城市或區域名稱作為前綴
  const useCityPrefix = nextRandom() > 0.7;
  const cityPrefix = useCityPrefix ? city.replace("市", "") : "";
  
  return `${cityPrefix}${prefix}${suffix}`;
};
  
  // 生成隨機日期
  const generateDate = () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(endDate.getMonth() - 6);
    return new Date(startDate.getTime() + nextRandom() * (endDate.getTime() - startDate.getTime()));
  };
  
  // 在特定座標周圍生成隨機點位
  const generatePointsAroundCoordinate = (cityKey, cityInfo, count) => {
    const { lat: baseLat, lng: baseLng, addressPrefix, districts } = cityInfo;
    const points = [];
    
    for (let i = 0; i < count; i++) {
      const lat = baseLat + (nextRandom() - 0.5) * 0.05;
      const lng = baseLng + (nextRandom() - 0.5) * 0.05;
      const actualPrice = generatePrice();
      const district = districts[Math.floor(nextRandom() * districts.length)];
      const address = generateAddress(addressPrefix, district);
      const floor = generateFloor();
      const size = generateSize();
      
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
      
      // 生成含社區調整的估值 (在基本估值基礎上加上 ±5% 的調整)
      const communityAdjustment = (nextRandom() * 0.1) - 0.05; // -5% 到 +5% 的社區調整
      const estimatedPriceWithCommunity = estimatedPrice * (1 + communityAdjustment);
      const errorWithCommunity = ((estimatedPriceWithCommunity - actualPrice) / actualPrice) * 100;
      
      // 生成含社區和時間調整的估值 (在含社區調整估值基礎上再加上 ±5% 的時間調整)
      const timeAdjustment = (nextRandom() * 0.1) - 0.05; // -5% 到 +5% 的時間調整
      const estimatedPriceWithCommunityAndTime = estimatedPriceWithCommunity * (1 + timeAdjustment);
      const errorWithCommunityAndTime = ((estimatedPriceWithCommunityAndTime - actualPrice) / actualPrice) * 100;
      
      points.push({
        lat,
        lng,
        actualPrice,
        estimatedPrice,
        estimatedPriceWithCommunity,
        estimatedPriceWithCommunityAndTime,
        error,
        errorWithCommunity,
        errorWithCommunityAndTime,
        date: generateDate(),
        address,
        floor,
        size,
        city: addressPrefix,
        district,
        community: generateCommunityName(addressPrefix, district)
      });
    }
    return points;
  };
  
  // 生成所有測試資料
  export const generateSampleData = () => {
    // 重置種子，確保每次生成的數據一致
    seed = 1;
    
    let allPoints = [];
    
    Object.entries(cityCoordinates).forEach(([cityKey, cityInfo]) => {
      const pointsCount = Math.floor(10 + nextRandom() * 20); // 每個城市10-30個點
      const points = generatePointsAroundCoordinate(cityKey, cityInfo, pointsCount);
      allPoints = [...allPoints, ...points];
    });
    
    return allPoints;
  };
