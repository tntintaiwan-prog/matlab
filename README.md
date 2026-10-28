# MATLAB 學習成果網站

## 期末程式背誦與測驗

上方「期末練習」連至獨立的 `practice/` 練習室，說明頁為 `practice/guide/`。不列入學習成果卡片、課程數量或互動課程總覽。設定與參考答案存於 `lessons/003-matlab-exam`，由內建 exam 模式產生獨立頁面。包含 MATLAB Editor 風格配色、行號、自動縮排、可選式函式補字、六段默寫、逐詞差異、錯題重練、60 分鐘完整測驗與瀏覽器進度保存／匯出匯入。輸入 `ins` 可選 insertObjectAnnotation 或 insertShape，Tab 填入、Esc 關閉，也可直接繼續打完。函式提示為本練習整理的小型清單，不是完整 MATLAB 函式庫。

此功能不執行 MATLAB；評分為固定練習答案的符合率，不能取代實機驗收。完整測驗期間關閉補字與參考答案。草稿、熟練度與最近 30 次完整測驗紀錄僅存於目前瀏覽器。請以匯出進度備份；同一個來源網址下才共用紀錄，本機與 GitHub Pages 的紀錄不會自動同步。

`interactive: "exam"` 是網站內建模式，不需要 iframe，也不改變自訂互動頁的隔離設定。練習參考答案位於這堂課的 `matlab.m`，內容與分段答案由 `static/exam-trainer.js` 維護；修改答案後需同步更新參考檔並重新建置。

一堂課一個資料夾。把課程資料夾加入 GitHub，GitHub Actions 會自動建立首頁卡片、內容頁與互動頁，再發布至 GitHub Pages。不需要後台、管理帳號或資料庫。

## 新增一堂課

複製 `lessons/_template`，改名為 `lessons/002-your-topic`。範本是可運作的正弦波課程示例，不會自動列為正式課程。

```text
lessons/
  001-kmeans/             現有第一堂課
  002-your-topic/         你的下一堂課
    lesson.json          標題、日期、摘要、互動設定
    content.md           課程內容（可改用 report.docx）
    matlab.m             MATLAB 程式，可省略
    python.py            Python 程式，可省略
    interactive.html     自訂互動網頁，包含 HTML、CSS、JavaScript
    assets/              內容頁使用的 PNG、JPG、GIF、WebP 圖片，可省略
```

1. 修改 `lesson.json` 的標題、日期與摘要。
2. 編輯 `content.md`，或移除它並加入 Word 報告 `report.docx`。兩者擇一。
3. 放入這堂課的 `matlab.m`、`python.py`，網站只展示內容，不會執行這兩個檔案。
4. 修改 `interactive.html`，加入這堂課的 JavaScript 互動程式。
5. 將整個資料夾提交到 GitHub 的 `main` 分支。首次部署請先依 [GITHUB_PAGES.md](GITHUB_PAGES.md) 設定。

系統自動連接內容页與互動頁，無須手改首頁、連結或課程清單。資料夾名稱開頭的三位數是課次，同一課次不能重複。`001` 已使用，下一堂請從 `002` 開始。

## 課程設定

```json
{
  "title": "課程標題",
  "date": "2026-09-30",
  "summary": "首頁卡片摘要",
  "author": "作者姓名",
  "class_name": "班級",
  "published": true,
  "interactive": "custom",
  "experiment_title": "互動頁標題"
}
```

- `interactive: "custom"`：使用同一資料夾的 `interactive.html`，缺少時停止建置並提示檔名。
- `interactive: "kmeans"`：使用已內建的 K-means 互動實驗室，不需另外放 `interactive.html`。僅適合 K-means 相關課程。
- `published: false`：暫不發布；資料夾名稱以 `_` 開頭也會略過。
- 修改或刪除課程後，提交即可更新或移除頁面。建置失敗時不部署，原先成功部署的網站不變。

上傳 Word 並不會自動產生新的演算法或翻譯 MATLAB。互動程式需隨課程一起準備；之後可把報告交給助手，請它製作完整課程資料夾。

## 檔案注意事項

Markdown 可用標題、清單、表格、程式區塊与圖片，圖片寫法為 `![說明](assets/圖片.png)`。Word 會擷取一般段落、內嵌圖片與表格；複雜版面、註解、頁首頁尾及浮動圖形不保證保留。程式建議用 Consolas 字型並保留換行。

自訂互動頁以獨立 iframe 顯示。請使用包含 CSS 和 JavaScript 的單一 `interactive.html`，如同範本，不依賴外部套件或相對路徑資源。互動頁不能操作父頁或讀取父頁儲存資料；允許自身腳本與檔案下載。這讓不同課程的樣式和程式互不干擾。

## 本機預覽

```powershell
python -m pip install -r requirements-pages.txt
python preview_local.py
```

瀏覽 `http://127.0.0.1:8000/`。修改檔案後重新啟動預覽，或執行 `python build_static.py` 再重新整理。

`python build_static.py` 產生公開 `docs` 與 `github-pages-ready.zip`；`python package_project.py` 產生含自動發布流程的 `github-project-ready.zip`。第一次放到 GitHub 請用後者。

原有本機資料庫與舊設定檔不再使用，也不會包含在 GitHub 原始碼部署包中。

## 人臉偵測課程與課程延伸

`lessons/002-face-detection` 使用 `interactive: "face"`，會自動建立內容頁、攝影機頁與課程延伸頁，並加入 `/labs/` 與 `/extensions/` 總覽。

- 課程內容保留 Word 原稿，另附 MATLAB 與 Python 程式。
- 日期 2026-10-21 為整理日期，原文件未提供上課日期，可在 lesson.json 修改 date 與 date_note。
- 瀏覽器使用 MediaPipe Tasks Vision 0.10.21；首次使用需連線至 jsDelivr 與 Google Storage 取得程式、WASM 與模型。
- 圖片與影片留在本機處理，不會上傳，不要求麥克風權限。
- 攝影機需要 HTTPS 或 localhost，以及使用者的攝影機許可。停止、切換模式、切換分頁及離開頁面會釋放攝影機。
- 人臉門檻為模型信心分數，與 MATLAB MergeThreshold、OpenCV minNeighbors 不等效。
- 遊戲僅接受單隻手、信心分數至少 0.65 的握拳／張掌／V 字手勢，倒數結束需維持穩定半秒，否則不計分。
- 未授予權限或沒有攝影機時仍可使用靜態圖片功能。

自訂 HTML 仍維持原本的隔離設定；人臉功能使用專用頁面，不放寬任意 HTML 的權限。
