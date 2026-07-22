# 🍔 Happy Burger Shop

一款卡通、低多邊形風格的 **3D 漢堡店時間管理遊戲**（瀏覽器優先，架構保留未來 Electron 桌面打包）。

使用 **TypeScript + 原生 ES Modules + Vite + Three.js** 開發，HTML/CSS HUD，無後端、可離線執行。

> 完整設計與開發規格請見 [docs/GDD.md](docs/GDD.md)（持續維護的 GDD 文件）。

---

## 線上試玩

推送到 `main` 後由 GitHub Actions 自動建置並部署到 GitHub Pages：

**▶ https://volibeartea.github.io/happy-burger-shop/**

> 首次需在 GitHub 倉庫 **Settings → Pages → Build and deployment → Source** 選擇 **GitHub Actions**，之後每次 push 會自動更新。

其他試玩方式：

- **本機建置版**：`npm run build && npm run preview`（預設 http://localhost:4173/）
- **同區網分享**：`npm run dev` 後用終端顯示的 `Network` 網址（如 `http://192.168.x.x:5173/`）讓同網段的人開啟
- **打包分享**：把 `dist/` 資料夾用任一靜態伺服器（或壓縮後）分享

---

## 專案用途

在漢堡店工作區內，玩家以滑鼠操作各種料理設備完成顧客訂單：拿取食材 → 烹調 → 組裝 → 出餐，於顧客失去耐心前正確出餐以獲得分數、金錢與 Combo。第一版以「一個可以完整開始、遊玩、結算、重新開始」的垂直切片為目標，並分階段擴充。

---

## 安裝

需求：Node.js 18+（開發環境使用 Node 22）。

```bash
npm install
```

## 啟動 / 建置

```bash
npm run dev       # 啟動開發伺服器（預設自動開啟瀏覽器）
npm run build     # 型別檢查 (tsc --noEmit) + 產生 dist/ 生產版
npm run preview   # 預覽 dist/ 建置結果
npm run typecheck # 只做 TypeScript 型別檢查
```

未來加入 Electron 後，架構可擴充為 `npm run electron:dev` / `npm run electron:build`（見 GDD 第 16 節）。

---

## 操作方式

| 操作 | 說明 |
| --- | --- |
| **點擊** 左側食材區托盤 | 生成一份對應食材 |
| **拖曳** 食材 | 拿取並移動；經過可放置站台會高亮 |
| 漢堡肉拖到 **煎台** | 開始煎製；**點擊漢堡肉翻面**，兩面都到「✓完美」再取出 |
| 炸雞 / 薯條拖到 **油鍋** | 開始炸製；到「✓完美」時取出，過久會 **燒焦** |
| 材料拖到 **組裝台** | 垂直堆疊；點擊 **打包** pad → 完成一份漢堡 |
| 完成餐點拖到 **出餐區** | 自動比對對應訂單，正確得分/金錢/Combo，錯誤扣分 |
| 拖到 **垃圾桶** | 丟棄食材或整份漢堡（含燒焦） |
| 右上 **⏸** | 暫停 / 繼續（暫停時凍結烹調與計時） |
| 放到**無效位置** | 食材自動彈回原位，不會消失 |
| 滑鼠移到可互動物件 | 高亮 + 游標變化 + 近游標操作提示 |
| 右上「⛶ 全螢幕」 | 切換全螢幕 |

固定斜俯視攝影機，一眼可見所有工作台，第一版不控制角色走動。

---

## 目前已完成功能

**第一階段（基礎場景與互動）**

- Vite + TypeScript + Three.js 純 ES Module 專案骨架。
- 固定斜俯視 3D 攝影機、卡通燈光、程序化低多邊形廚房環境。
- 六座可辨識工作台：食材區、煎台、油鍋、組裝台、出餐區、垃圾桶。
- 完整滑鼠互動：hover 高亮/游標/tooltip、點擊生成食材、拖曳、落點高亮、無效彈回。
- 資料驅動食材系統（`data/ingredients.ts`）。
- 平台抽象層（`PlatformService` / `BrowserPlatform` / `SaveService`）與 `localStorage` 存檔（最佳分數）。

**第二階段（烹調系統）**

- 烹調狀態機：生 / 烹調中 / 完美 / 燒焦，時間參數資料驅動。
- 煎台漢堡肉**雙面煎製 + 點擊翻面**，兩面皆熟才算完美。
- 油鍋炸雞 / 薯條單階段烹調，過久燒焦。
- 視覺提示：顏色即時漸變、「✓完美」與「燒焦」標記、完美跳動、翻面動畫。

**第三階段（組裝與食譜）**

- 組裝台垂直堆疊材料，點擊「打包」→ `Burger` 聚合物件（整份拖曳）。
- `RecipeManager` 以材料多重集合比對食譜（不檢查堆疊順序）。
- 出餐區判定（符合食譜 + 全熟）並以 toast 回饋；單一完成薯條可直接出餐。

**第四階段（訂單與遊戲流程）— 首個完整可玩版本**

- 最多三張顧客訂單、耐心條倒數、超時失去生命；出餐自動匹配對應訂單。
- 計時（180 秒）、分數、金錢、Combo、速度加成、錯誤懲罰。
- 開始畫面 → 遊玩（可暫停）→ 時間/生命結束 → 結算（統計 + 最佳分數）→ 重新開始。
- HUD 顯示時間/分數/金錢/生命/Combo 與訂單卡。

## 尚未完成功能

- **第五階段**：粒子效果（油炸氣泡、蒸氣、燒焦煙、出餐星星）、音效、動畫、UI 精修與平衡調整。

（各階段規格見 [docs/GDD.md](docs/GDD.md)。）

---

## 專案架構（摘要）

```text
src/
├─ main.ts            進入點
├─ game/              Game / GameLoop / GameState / GameConfig / GameContext / Updatable
├─ scene/             SceneManager / CameraController / Lighting / KitchenScene / TextSprite
├─ input/             InputManager / PointerController / DragController / InteractionTypes / InteractionRegistry
├─ entities/          IngredientEntity / Burger / CustomerOrder / Cookable / Servable / shapes
├─ stations/          Station / CookingStation / Fryer / Grill / Assembly / Storage / Serving / Trash
├─ systems/           RecipeManager / OrderManager / ScoreManager
├─ platform/          PlatformService / BrowserPlatform / SaveService
├─ ui/                HUD / OrderCard / Overlay / StartScreen / ResultScreen
├─ data/              types / ingredients / recipes / gameBalance
└─ styles/            main.css
```

- 使用 Vite alias `@` → `src`。
- tsconfig `"types": []` 讓遊戲核心在編譯期即無法使用 Node API，強制平台隔離。
- `base: './'` 讓建置結果可由 `file://` 載入（未來 Electron 相容）。

完整模組地圖與依賴方向見 GDD 第 5 節。

---

## 未來 Electron 整合方式

Electron 只作為桌面容器，不與遊戲核心綁定：

- Three.js 遊戲跑在 Renderer；Main / Preload 為獨立模組。
- 安全設定：`contextIsolation: true`、`nodeIntegration: false`。
- 本機存檔、視窗控制、全螢幕、系統通知等透過 Preload + IPC Bridge 提供，並以新的 `PlatformService` 實作接上，不影響瀏覽器版。

細節見 [docs/GDD.md](docs/GDD.md) 第 16 節。

---

## 已知問題

- 第五階段功能尚未實作（粒子、音效、動畫、平衡微調）。
- 訂單顧客為文字卡片，尚無角色圖像。
- Three.js 打包為單一 chunk（> 500 kB 警告），未來可 code-split，暫不處理。
- 尚未針對行動裝置觸控最佳化。
