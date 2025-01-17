# 房地產估價地圖可視化

這個專案是一個互動式的房地產估價地圖可視化工具，用於顯示和分析房地產估價的準確性。使用者可以在地圖上查看不同位置的房地產估價誤差，並透過時間範圍進行篩選。

## 功能特點

- 互動式地圖顯示，支援縮放和平移
- 根據估價誤差顯示不同顏色的標記點
- 自動聚合鄰近的資料點
- 時間範圍篩選功能
- 點擊標記顯示詳細資訊
- 保持地圖視角在篩選時不變

## 安裝步驟

1. 確保您已安裝 Node.js（建議版本 18 或更新版本）

2. 克隆專案並安裝依賴：
```bash
# 克隆專案
git clone [your-repository-url]
cd real-estate-map

# 安裝依賴
npm install
```

3. 建立設定檔案：
```bash
# 複製範例設定檔
cp .env.example .env.local
```

4. 啟動開發伺服器：
```bash
npm run dev
```

5. 訪問應用：
開啟瀏覽器訪問 `http://10.0.0.85:3002`

## 使用方法

### 基本使用

1. 在瀏覽器中訪問 `http://10.0.0.85:3002`
2. 使用滑鼠滾輪或觸控板進行地圖縮放
3. 點擊標記點查看詳細資訊
4. 使用時間範圍選擇器篩選資料

### 資料格式

如果要使用自己的資料，需要準備符合以下格式的資料：

```javascript
{
  "lat": 25.0330,          // 緯度（必須）
  "lng": 121.5654,         // 經度（必須）
  "actualPrice": 15000000, // 實際價格（必須）
  "estimatedPrice": 14500000, // 估計價格（必須）
  "date": "2024-01-15"     // 交易日期（必須）
}
```

支援的資料來源格式：
- JSON 文件
- CSV 文件（需包含上述欄位）
- API 端點

### CSV 格式範例

```csv
lat,lng,actualPrice,estimatedPrice,date
25.0330,121.5654,15000000,14500000,2024-01-15
```

### 自訂資料整合

1. **使用 CSV 文件**：
   - 將 CSV 文件放置在專案的 `public` 目錄下
   - 確保 CSV 包含必要欄位
   - 使用提供的 CSV 讀取功能

2. **使用 API**：
   - 實作符合格式的 API 端點
   - 在 `.env.local` 中設定 API URL

## 技術棧

- Next.js
- React
- Leaflet
- Tailwind CSS
- Papa Parse（用於 CSV 解析）

## 自訂設定

### 修改顏色範圍

在 `components/Map.js` 中修改誤差範圍的顏色：

```javascript
if (error <= 5) color = '#10B981'; // 綠色
else if (error <= 10) color = '#FBBF24'; // 黃色
else if (error <= 15) color = '#F97316'; // 橘色
else color = '#EF4444'; // 紅色
```

### 調整聚合設定

調整 `maxClusterRadius` 來改變聚合的範圍：

```javascript
maxClusterRadius: 80, // 預設值，可以根據需求調整
```

## 注意事項

- 請確保資料中的經緯度資訊正確
- 建議資料量在合理範圍內（建議小於 10000 筆）
- 注意資料的日期格式必須一致

## 貢獻指南

1. Fork 專案
2. 創建特性分支
3. 提交變更
4. 發出 Pull Request

## 授權

MIT License