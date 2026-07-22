# Happy Burger Shop — 遊戲設計與開發文件（GDD）

> 這是一份**持續維護**的開發文件。每完成一個階段或做出重要設計決策，都應更新對應章節與最後的〈變更紀錄〉。
>
> - 文件版本：`v0.1`
> - 對應程式版本：`0.1.0`
> - 最後更新：2026-07-22
> - 目前開發階段：**第一階段（基礎場景與互動）完成**

---

## 1. 專案概述

一款**卡通、低多邊形風格的 3D 漢堡店時間管理遊戲**，第一版以瀏覽器為主，架構保留未來以 Electron 打包為 Windows 桌面程式的可能。

- 玩家不控制角色走動，透過**滑鼠點擊與拖曳**操作固定的料理工作台。
- 採用**固定斜俯視 3D 攝影機**，一眼可見所有工作台。
- 核心樂趣：同時管理多台設備、掌握熟度、避免燒焦、依訂單組裝、限時出餐、追求高分與連續正確（Combo）。
- 無後端、無帳號、無多人；遊戲核心可離線執行。

### 設計原則（貫穿全程）

- 優先做出**可玩的垂直切片**，再逐步擴充；不過早加入經營／升級／劇情／裝潢系統。
- **資料驅動**：食材、食譜、平衡數值集中管理，新增內容主要靠新增資料。
- **避免**：巨大單一類別、循環依賴、全域可變狀態、把 Three.js 物件散落在所有邏輯中、為小功能建立不必要的 Manager、過度抽象與空殼類別。
- 遊戲核心**不得**直接依賴 Electron 或 Node.js API（`fs` / `path` / `process`）。

---

## 2. 遊戲定位與核心體驗

### 核心遊戲循環

1. 顧客產生訂單（最多同時三張）。
2. 玩家從食材區拿取生食材。
3. 將食材放到油鍋或煎台烹調。
4. 等待烹調，必要時翻面（漢堡肉）。
5. 將完成食材移到暫存區或組裝台。
6. 依訂單需求組裝漢堡或炸物。
7. 將餐點送到出餐區。
8. 系統自動比對訂單是否正確。
9. 正確 → 分數／金錢／Combo；錯誤或超時 → 扣分／失去生命。

### 預設遊戲規則（第 21 節預設值）

| 項目 | 預設 |
| --- | --- |
| 攝影機 | 固定斜俯視，不可旋轉／縮放 |
| 角色 | 不控制走動 |
| 操作 | 滑鼠點擊 + 拖曳 |
| 單局時間 | 180 秒（3 分鐘） |
| 同時訂單 | 最多 3 張 |
| 生命 | 3 點 |
| 出餐判定 | 材料**種類與數量**正確即可，不檢查堆疊順序 |
| 出餐匹配 | 自動匹配第一張符合的訂單 |
| 美術 | 卡通低多邊形 placeholder（程序化幾何） |
| 存檔 | 瀏覽器 `localStorage` |
| Electron | 第一版不加入套件，只保留相容架構 |

---

## 3. 開發階段與進度追蹤

> 圖例：`[x]` 完成、`[~]` 進行中、`[ ]` 未開始

### 第一階段：基礎場景與互動 — ✅ 完成

- [x] 建立 Vite + TypeScript + Three.js 專案（純 ES Modules）
- [x] 固定斜俯視攝影機、燈光、卡通廚房環境
- [x] 可點擊測試物件（食材區托盤 → 生成食材）
- [x] 基本拖曳系統（拿取 / 拖曳 / 放置 / 無效彈回）
- [x] 油鍋、煎台、組裝台、出餐區、垃圾桶、食材區
- [x] Hover 高亮、游標變化、操作提示 tooltip、放置區高亮
- [x] 平台抽象層（`PlatformService` / `BrowserPlatform` / `SaveService`）
- [x] `npm run dev` / `npm run build` / `npm run preview` 正常

### 第二階段：烹調系統 — ⬜ 未開始

- [ ] 漢堡肉雙面煎製與**翻面**
- [ ] 炸雞、薯條的油鍋烹調
- [ ] 狀態機：生 / 烹調中 / 完美 / 燒焦
- [ ] 完成提示（顏色、圖示、跳動、粒子）與燒焦冒煙
- [ ] `CookingSystem` 依時間推進各站食材狀態

### 第三階段：組裝與食譜 — ⬜ 未開始

- [ ] 麵包與配料完整放入組裝台，3D 垂直堆疊成可辨識漢堡
- [ ] `Burger` 聚合物件（可整份拖曳）
- [ ] `RecipeManager`：以**材料多重集合**比對食譜
- [ ] 出餐區判定、垃圾桶丟棄整份

### 第四階段：訂單與遊戲流程 — ⬜ 未開始

- [ ] `OrderManager`：最多三張訂單、生成間隔、耐心條
- [ ] 計時、生命、分數、金錢、Combo、`ScoreManager`
- [ ] 開始畫面、暫停、結算畫面、重新開始

### 第五階段：手感與視覺效果 — ⬜ 未開始

- [ ] 拖曳回饋強化、工作台高亮精修
- [ ] 粒子（油炸氣泡、煎台蒸氣、燒焦煙、出餐星星）
- [ ] `AudioManager` 與各種 placeholder 音效
- [ ] 訂單完成動畫、錯誤提示、UI 排版與平衡調整

---

## 4. 技術架構

| 項目 | 選擇 |
| --- | --- |
| 語言 | TypeScript（`strict`） |
| 模組 | 原生 ES Modules，`"type": "module"`，禁用 CommonJS / `require` / `module.exports` |
| 建置 | Vite 5 |
| 3D | Three.js（`three@^0.169`） |
| UI | HTML + CSS 疊加於 `<canvas>` 之上（不使用 React） |
| 別名 | Vite + tsconfig `paths`：`@` → `src` |
| 核心隔離 | tsconfig `"types": []` → `src/` 看不到 Node 型別，誤用 `fs`/`path`/`process` 直接編譯失敗 |
| base | `base: './'`（未來 Electron `file://` 載入相容） |

### 為何 `base: './'`

打包後所有資源使用相對路徑，讓建置結果能從 `file://` 直接開啟——這正是未來 Electron Renderer 載入 `dist/index.html` 的方式，避免屆時再改路徑。

---

## 5. 專案結構（模組地圖）

> 狀態：✅ 已實作、🅿️ 佔位資料（已建立、後續階段使用）、⬜ 尚未建立（待對應階段）

```text
happy-burger-shop/
├─ index.html                     ✅ 掛載 #game-canvas 與 #ui-root
├─ vite.config.ts                 ✅ alias '@'、base './'
├─ tsconfig.json                  ✅ strict、types:[]、paths
├─ docs/GDD.md                    ✅ 本文件
└─ src/
   ├─ main.ts                     ✅ 進入點：建立 Game 並 start()
   ├─ game/
   │  ├─ Game.ts                  ✅ 頂層編排器，實作 GameContext
   │  ├─ GameLoop.ts              ✅ rAF 迴圈（clamped dt）
   │  ├─ GameState.ts             ✅ 執行期狀態（bestScore 已用；其餘待 P4）
   │  ├─ GameConfig.ts            ✅ 場景/佈局/攝影機技術常數
   │  ├─ GameContext.ts           ✅ 站台 ↔ 遊戲的窄介面（spawn/remove）
   │  └─ Updatable.ts             ✅ update(dt) 介面
   ├─ scene/
   │  ├─ SceneManager.ts          ✅ renderer/scene/resize/render
   │  ├─ CameraController.ts      ✅ 固定斜俯視相機
   │  ├─ Lighting.ts              ✅ 半球 + 環境 + 主陰影光 + 邊光
   │  ├─ KitchenScene.ts          ✅ 地板/檯面/背牆/招牌
   │  └─ TextSprite.ts            ✅ Canvas 文字精靈（站台名牌/食材標籤）
   ├─ input/
   │  ├─ InputManager.ts          ✅ 指標事件 → NDC、raycast、平面投影
   │  ├─ PointerController.ts     ✅ Hover 揀選/高亮/游標/tooltip
   │  ├─ DragController.ts        ✅ 拿取/拖曳/放置/點擊 生命週期
   │  ├─ InteractionTypes.ts      ✅ Interactive/Draggable/DropTarget 契約
   │  └─ InteractionRegistry.ts   ✅ mesh→物件解析、drop 判定
   ├─ entities/
   │  └─ IngredientEntity.ts      ✅ 資料驅動食材（可拖曳、平滑動畫）
   ├─ stations/
   │  ├─ Station.ts               ✅ 站台基底（本體/名牌/footprint/高亮）
   │  ├─ CookingStation.ts        ✅ 有格位的烹調站基底（容量/釋放）
   │  ├─ FryerStation.ts          ✅ 油鍋
   │  ├─ GrillStation.ts          ✅ 煎台
   │  ├─ AssemblyStation.ts       ✅ 組裝台（垂直堆疊、getStackIds）
   │  ├─ StorageStation.ts        ✅ 食材區 + 可點擊 bin
   │  ├─ ServingStation.ts        ✅ 出餐區（P4 接訂單判定）
   │  └─ TrashStation.ts          ✅ 垃圾桶
   ├─ platform/
   │  ├─ PlatformService.ts       ✅ 平台介面（storage/fullscreen）
   │  ├─ BrowserPlatform.ts       ✅ localStorage + 全螢幕
   │  └─ SaveService.ts           ✅ 存檔（highScore/settings）
   ├─ ui/
   │  └─ HUD.ts                   ✅ 頂欄/最佳分/全螢幕/說明/tooltip
   ├─ data/
   │  ├─ types.ts                 ✅ 資料型別
   │  ├─ ingredients.ts           ✅ 食材資料
   │  ├─ recipes.ts               🅿️ 食譜資料（P3 使用）
   │  └─ gameBalance.ts           ✅ 平衡數值
   └─ styles/
      └─ main.css                 ✅ HUD/畫面樣式

# 後續階段將新增（尚未建立，避免空殼）
   systems/  CookingSystem(P2) OrderManager(P4) RecipeManager(P3) ScoreManager(P4) AudioManager(P5)
   entities/ CookableIngredient(P2) Burger(P3) CustomerOrder(P4)
   ui/       OrderCard(P4) StartScreen(P4) ResultScreen(P4)
electron/    main.ts preload.ts ipc/*   （未來 Electron 階段）
```

### 依賴方向（避免循環）

```
main → game/Game → { scene, input, stations, entities, ui, platform, data }
stations → { Station, GameContext(型別), data, scene/TextSprite }
entities → { input/InteractionTypes(型別), data, game/GameConfig, game/Updatable }
input    → { InteractionTypes, InteractionRegistry, game/GameConfig }
GameContext(型別) → { entities/IngredientEntity(型別), input/InteractionTypes(型別) }
```

`GameContext` 以介面型別存在，讓站台可回呼 `spawnIngredient` / `removeItem` 而不反向依賴 `Game` 具體類別。

---

## 6. 資料驅動設計

新增食材／食譜原則上**只需新增資料**，不動核心邏輯。

### 食材定義（`data/types.ts`）

```ts
interface IngredientDefinition {
  id: string;
  displayName: string;
  cookable: boolean;
  validStations: StationId[];   // 可放置的站台
  cookDuration?: number;        // 到完美熟度秒數（煎台為單面）
  perfectWindow?: number;       // 完美持續秒數
  burnDuration?: number;        // 完美後到燒焦秒數
  needsFlip?: boolean;          // 煎台是否需翻面
  scoreValue: number;
  color: number;                // placeholder 顏色
  shape: IngredientShape;       // placeholder 幾何
  stackHeight: number;          // 堆疊厚度
}
```

### 食譜定義

```ts
interface RecipeDefinition {
  id: string;
  displayName: string;
  ingredients: string[];  // 食材 id 多重集合（v1 不檢查順序）
  baseScore: number;
  baseReward: number;
}
```

### 平衡數值（`data/gameBalance.ts`）

單局時間、最大訂單數、生命、訂單耐心區間、生成間隔、Combo 倍率、速度加成、錯誤懲罰、油鍋/煎台容量等，全部集中於此。

### 目前內容

- **食材**：漢堡肉、炸雞、薯條（可烹調）；麵包底、麵包頂、起司片、生菜、番茄片（免烹調）。
- **食譜**：經典起司漢堡、生菜番茄漢堡、炸雞漢堡、薯條。
- **未來擴充**：鱈魚排、雞排、培根、洋蔥、酸黃瓜、醬料、洋蔥圈、雞塊、不同麵包——皆為新增資料。

---

## 7. 場景與攝影機

- **攝影機**：`PerspectiveCamera`，fov 42，位置 `(0, 13.5, 13.5)`，看向 `(0, 0.4, -0.4)`；固定不動，僅隨視窗調整 aspect。
- **佈局**（XZ 平面，檯面頂 y = 1.0）：
  - 食材區（左）、煎台（後左）、油鍋（後右）、組裝台（中）、出餐區（右）、垃圾桶（右前）。
  - 生成點：食材區前方 `(-5.6, 1.0, 3.4)`。
- **燈光**：半球光 + 環境光（平坦卡通色）＋ 一盞投影主光（柔和陰影）＋ 冷色邊光。
- **渲染**：`ACESFilmicToneMapping`、`SRGBColorSpace`、`PCFSoftShadowMap`、pixelRatio ≤ 2。

---

## 8. 操作與互動系統

### 互動契約（`input/InteractionTypes.ts`）

- `Interactive`：可被 hover / click（`onHoverEnter/Leave`、選配 `onClick`）。
- `Draggable extends Interactive`：可拿取拖放（`onPickup` / `dragTo` / `snapTo` / `returnToOrigin` / `dispose`），並持有目前所在 `container`。
- `DropTarget`：站台落點（`canAccept` / `accept` / `setDropCandidate` + footprint）。
- `ItemContainer`：持有物件的容器（`release`），供烹調格位與組裝堆疊使用。

### 揀選與拖放流程（`DragController`）

1. `pointerdown` → raycast 命中 → 若為 draggable 則「待命」（尚未拿起）。
2. 移動超過點擊容許值 → 正式開始拖曳（拿起、脫離原容器）。
3. 拖曳中 → 指標投影到承載平面（y = `CARRY_HEIGHT`），物件跟隨；可放置的站台以 footprint 判定並高亮。
4. `pointerup` → 落在有效站台 → `accept`；否則 `returnToOrigin`（彈回原位）。
5. 未移動即放開且命中 `onClick` 物件 → 觸發點擊（例如食材區 bin 生成食材）。

### 回饋

- Hover：物件放大 + 自發光高亮 + 游標變化（grab / pointer）+ 近游標 tooltip 操作文字。
- 可放置區：拖曳經過時綠色高亮（垃圾桶為紅色）。
- 無效放置：物件平滑彈回原位，不消失。

### 判定方式

- **Hover 揀選**用 raycast（幾何精準）。
- **落點判定**用站台 XZ footprint（相機無關、穩定，不做複雜物理）。裝飾用文字精靈已停用 raycast，避免遮擋揀選。

---

## 9. 烹調系統設計（第二階段規格）

- 每個可烹調食材具狀態機：`raw → cooking → perfect → burnt`，時間參數來自資料。
- **漢堡肉（煎台）**：放上 → 第一面 → 手動翻面 → 第二面 → 完美 → 燒焦；兩面皆熟才算正確。
- **炸雞／薯條（油鍋）**：容量有限，過久燒焦。
- 完成/燒焦有明顯視覺與音效提示；燒焦不可用於正確訂單，但可拿起丟棄。
- 由 `systems/CookingSystem` 於每幀依 dt 推進站台上食材狀態（第一階段的 `CookingStation` 已提供格位/容量/釋放基礎）。

---

## 10. 組裝與食譜系統（第三階段規格）

- 組裝台可放入麵包/配料/完成食材，於 3D 垂直堆疊成可辨識漢堡（`AssemblyStation` 已支援堆疊與 `getStackIds()`）。
- `Burger` 聚合物件：可整份拖到出餐區或垃圾桶。
- 出餐判定（v1）：以**材料種類與數量**比對，不檢查堆疊順序（起司與生菜對調仍算正確）。
- `RecipeManager`：多重集合比對，新增食譜不需改判定核心。

---

## 11. 訂單系統（第四階段規格）

- 畫面最多同時三張訂單；每張含顧客圖示、名稱、所需餐點、材料分解、耐心條、分數、金錢。
- 耐心隨時間下降；越快完成，時間獎勵越高。
- 完成後移除舊訂單，短暫間隔後生成新訂單。
- 超時：顧客離開、扣分/失去生命、播放失敗提示。
- 出餐匹配（v1）：自動匹配第一張符合的訂單。

---

## 12. 遊戲規則與結算（第四階段規格）

- 單局 180 秒；生命 3 點；生命歸零或時間結束 → 結算。
- 正確出餐：基礎分 + 剩餘耐心加成 + 金錢 + Combo；錯誤：扣分、Combo 歸零。
- 結算畫面：總分、金錢、完成/錯誤/超時訂單數、最高 Combo、平均出餐時間。

---

## 13. UI / HUD

- HTML/CSS 疊加於 canvas；`#ui-root` 透明穿透，只有控制項接收指標事件。
- 第一階段：標題、最佳分數、全螢幕鈕、操作說明、hover tooltip。
- 第四階段補齊：剩餘時間、分數、金錢、生命、Combo、訂單列表、暫停、音效開關/音量、開始/結算/重新開始。
- 需求：清楚易讀、不遮擋工作台、適配 16:9、隨視窗縮放；第一版以桌面滑鼠為主。

---

## 14. 美術方向

卡通、低多邊形、明亮色彩、可愛輕鬆。第一版全部使用**程序化幾何 + 程序化材質**（無外部模型），避免因缺素材阻塞開發。食材以形狀 + 顏色 + 中文標籤辨識。

---

## 15. 音效（第五階段）

placeholder 音效：拿取/放置/油炸/煎肉/翻面/組裝/正確出餐/錯誤出餐/超時/倒數警告/丟垃圾。需有開關與音量、避免無限疊加、避免未互動即自動播放（瀏覽器政策）。第一版透過 `AudioManager` 管理。

---

## 16. 平台抽象與 Electron 整合規劃

### 抽象層（已就緒）

- `PlatformService`：`name`、`storage`（KeyValueStorage）、`isFullscreen` / `toggleFullscreen`。
- `BrowserPlatform`：`localStorage`（不可用時退回記憶體）、Fullscreen API。
- `SaveService`：以 `PlatformService.storage` 讀寫存檔（`highScore` / `settings`）。
- 遊戲核心**只**依賴這些介面，不觸碰 Electron / Node。

### 未來 Electron 階段

```text
electron/
├─ main.ts      # Main Process（獨立模組，ES Module）
├─ preload.ts   # Preload（contextBridge 暴露安全 API）
└─ ipc/         # saveHandlers / windowHandlers
```

- 安全設定：`contextIsolation: true`、`nodeIntegration: false`，Renderer 無完整 Node 權限。
- 本機存檔／檔案系統／視窗控制／全螢幕／系統通知／Steam 整合，皆透過 Preload + IPC Bridge 提供，並以新的 `PlatformService` 實作接上，**不影響瀏覽器版**。
- 指令擴充：`electron:dev` / `electron:build`（Electron Builder 或 Forge，輸出 `.exe` 安裝版或 Portable）。

---

## 17. 設計決策紀錄（ADR）

| # | 決策 | 理由 |
| --- | --- | --- |
| 1 | 落點以 footprint（XZ）判定，而非物理 | 穩定、相機無關、符合「不做複雜物理」原則 |
| 2 | Hover 用 raycast、拖放用平面投影 | 各取所長：揀選精準、拖放順手 |
| 3 | `tsconfig types:[]` | 讓遊戲核心在編譯期就無法使用 Node API，強制平台隔離 |
| 4 | `base: './'` | 建置結果可由 `file://` 開啟，未來 Electron 免改路徑 |
| 5 | 站台以 `GameContext` 介面回呼 | 避免站台反向依賴 `Game`，降低耦合與循環風險 |
| 6 | 食材以「shape + color + 標籤」程序化生成 | 不依賴外部模型即可辨識，符合 placeholder 美術 |
| 7 | 食材區以「點擊 bin 生成」而非預放 | 更貼近真實遊玩、示範資料驅動 + 點擊互動 |
| 8 | 單一 Set 追蹤所有食材實體 | 同時可 update 與被 remove，避免多容器同步問題 |

---

## 18. 未解問題與預設決策

> 未獲回答前一律採用〈第 2 節〉預設值繼續開發。

1. 美術是否全程使用程序化 placeholder（無外部模型）？ → 預設：是。
2. 存檔第一版 `localStorage` 是否足夠，或需 IndexedDB？ → 預設：`localStorage`。
3. 出餐匹配用「自動匹配第一張符合訂單」或「拖到指定訂單卡」？ → 預設：自動匹配。

---

## 19. 已知問題與限制（第一階段）

- 尚無烹調、訂單、計時、分數、結算（屬第二～四階段）。
- `data/recipes.ts` 已備資料但第一階段未使用（P3 接上）。
- 拖曳落點視差（front-strip 死區）已於審查後修正：改以站台頂面 `DROP_PLANE_Y` 投影做落點判定，食材仍以 `CARRY_HEIGHT` 呈現。
- 無音效（第五階段）。
- 尚未針對觸控最佳化（第一版以桌面滑鼠為主）。
- Three.js 打包體積 > 500 kB（單一 chunk 警告）；未來可 code-split，暫不處理。

---

## 20. 變更紀錄（Changelog）

### v0.1（2026-07-22）— 第一階段完成

- 建立 Vite + TypeScript + Three.js（純 ESM）專案骨架與三個 npm 指令。
- 固定斜俯視攝影機、卡通燈光、程序化廚房環境。
- 完整互動系統：hover 高亮/游標/tooltip、點擊生成、拖曳、footprint 落點判定、無效彈回。
- 六座工作台（食材區、煎台、油鍋、組裝台、出餐區、垃圾桶）與資料驅動食材。
- 平台抽象層與 `localStorage` 存檔（最佳分數）。
- 建立本 GDD 與 README；`tsc` 與 `vite build` 皆通過。
- **對抗式程式碼審查（4 維度 × 逐項反駁驗證，9 項全數確認）後修正**：
  - 落點視差死區 → 改用 `DROP_PLANE_Y` 站台頂面投影判定。
  - 指標離開視窗/blur 時卡住拖曳 → 加入 `setPointerCapture` + `pointercancel`/`blur` 中止。
  - 拿取放大/發光被 hover 清除覆蓋 → 調整 `startDrag` 順序。
  - 只允許滑鼠左鍵觸發拿取/放置。
  - Hover 自發光改用食材本色（避免白色洗白）、食材接收陰影。
  - 食材區托盤生成改為不重疊網格；炸雞堆疊高度校正。
  - 食材區 bin 清單改由 `data` 過濾 `spawnable` 產生（更貼合資料驅動）。
